import ad, { jsonAd } from '../services/ad-service';
import db, { getAd } from '../db';
import { trackClick, trackImpression } from '../utils/tracking';

import fs from 'fs';
import io from '@pm2/io';
import rediscache from 'express-redis-cache';
import url from 'url';
import webp from 'webp-converter';

const tmpImageName = 'tmpimage';
const cache = rediscache();

export default app => {
  // get random ad page
  app.get('/ad', async (req, res) => {
    const referrer = req.header('Referer');
    let a;
    if (referrer) {
      const referrerUrl = url.parse(referrer);
      a = await ad({ referrer: referrerUrl.host });
    } else {
      a = await ad();
    }
    return res.send(a);
  });

  app.get('/ad.json', async (req, res) => {
    const referrer = req.header('Referer');
    let a;
    if (referrer) {
      const referrerUrl = url.parse(referrer);
      a = await jsonAd({ referrer: referrerUrl.host });
    } else {
      a = await jsonAd();
    }
    console.log(a);
    res.send(a);
  });

  app.get('/:id/redirect', async (req, res) => {
    const adId = req.params.id;
    const { ref: referrer } = req.query;
    try {
      const { url } = await getAd(adId);
      trackClick(adId, referrer);
      return res.redirect(`${url}?ref=${referrer}`);
    } catch (err) {
      console.error(err);
      res.status(500).send(err);
    }
  });

  app.get('/:id/image', async (req, res) => {
    try {
      const adId = req.params.id;
      const acceptsWebp = req.accepts('image/webp');
      const { ref: referrer } = req.query;
      const cachedResponse = await getFromCache(
        req.path,
        acceptsWebp ? 'webp' : 'png'
      );
      let imageData;

      if (cachedResponse) {
        imageData = cachedResponse;
      } else {
        const { image } = await getAd(adId);
        imageData = image;
        addToCache(req.path, imageData);
      }
      const img = new Buffer(imageData, 'base64');
      trackImpression(adId, referrer);
      res.writeHead(200, {
        'Content-Type': acceptsWebp ? 'image/webp' : 'image/png',
        'Content-Length': img.length
      });
      return res.end(img);
    } catch (err) {
      console.error(err);
      return res.status(500).send(err);
    }
  });
};

function getFromCache(key, type) {
  const typedKey = `${key}-${type}`;
  return new Promise((resolve, reject) => {
    cache.get(typedKey, (err, entries) => {
      if (err) {
        return reject(err);
      }
      if (entries.length) {
        return resolve(entries[0].body);
      }
      return resolve(null);
    });
  });
}

function addToCache(key, img) {
  return new Promise((resolve, reject) => {
    fs.writeFileSync(`${tmpImageName}.png`, img, 'base64');
    const { size: originalSize } = fs.statSync(`${tmpImageName}.png`);
    webp.cwebp(
      `${tmpImageName}.png`,
      'output.webp',
      '-q 80',
      async (status, error) => {
        if (error) {
          console.log(error);
          return reject(error);
        }
        const compressedImg = fs.readFileSync('output.webp');
        const { size: newSize } = fs.statSync('output.webp');

        console.log(
          `saved ${100 - (newSize / originalSize) * 100}% of image size`
        );

        await Promise.all([
          new Promise((res, rej) => {
            cache.add(`${key}-png`, img, { type: 'image/png' }, (err, out) => {
              if (err) {
                console.error(err);
                return rej(err);
              }
              res(out);
            });
          }),
          cache.add(`${key}-webp`, img, { type: 'image/webp' }, (err, out) => {
            if (err) {
              console.error(err);
              return rej(err);
            }
            resolve(out);
          })
        ]).then(resolve, reject);
      }
    );
  });
}
function removeFromCache(key) {
  return new Promise((res, rej) => {
    cache.del(key, (err, quantity) => {
      if (err) return rej(err);
      res(quantity);
    });
  });
}
function clearCache(key) {
  return removeFromCache('*');
}

let cacheSize = 0;
// action to manually clear the ad cache
if (process.env.NODE_ENV !== 'development') {
  io.action('cache:clear', async cb => {
    console.log('clearing cache');
    try {
      await clearCache();
      cb({ success: true });
    } catch (err) {
      console.error(err);
      cb({ success: false, err: err.message });
    }
  });

  setInterval(() => {
    cache.size((err, size) => {
      if (err) {
        return console.error(err);
      }
      cacheSize = size;
    });
  }, 1000 * 10);
}

io.metric({
  type: 'metric',
  name: 'Cache size (bytes)',
  value: () => {
    return cacheSize;
  }
});
