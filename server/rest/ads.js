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
    console.log('/ad');
    const referrer = req.header('Referer');
    let a;
    try {
      if (referrer) {
        const referrerUrl = url.parse(referrer);
        a = await ad({ referrer: referrerUrl.host });
      } else {
        a = await ad();
      }
    } catch (err) {
      console.error('failed to get ad');
      console.error(err);
    }
    return res.send(a);
  });

  app.get('/ad.json', async (req, res) => {
    console.log('/ad.json');
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
    console.log('/redirect');
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
    console.log('/image');
    try {
      const adId = req.params.id;
      const acceptsWebp = req.accepts('image/webp');

      const { ref: referrer } = req.query;
      const cachedResponse = await getFromCache(
        req.path,
        acceptsWebp ? 'webp' : 'png'
      );
      let imageData;
      let img;

      if (cachedResponse) {
        console.log('serving cached');
        imageData = cachedResponse;
        img = new Buffer(imageData, 'base64');

        res.writeHead(200, {
          'Content-Type': acceptsWebp ? 'image/webp' : 'image/png',
          'Content-Length': img.length
        });
      } else {
        console.log('serving uncached');
        const { image } = await getAd(adId);
        imageData = image;
        addToCache(req.path, imageData).catch(err => {
          console.error(`failed to cache ad image with id ${adId}`);
          console.error(err.message);
        });
        img = new Buffer(imageData, 'base64');
        res.writeHead(200, {
          'Content-Type': 'image/png',
          'Content-Length': img.length
        });
      }

      trackImpression(adId, referrer);
      return res.end(img);
    } catch (err) {
      console.error(err);
      return res.status(500).send(err);
    }
  });
};

function getFromCache(key, type) {
  return Promise.resolve(null);
  // const typedKey = `${key}-${type}`;
  // console.log('get', typedKey);
  // return new Promise((resolve, reject) => {
  //   cache.get(typedKey, (err, entries) => {
  //     if (err) {
  //       console.error('failed to get from cache', err);
  //       return reject(err);
  //     }
  //     if (entries.length) {
  //       return resolve(entries[0].body);
  //     }
  //     return resolve(null);
  //   });
  // });
}

function addToCache(key, img) {
  return new Promise((resolve, reject) => {
    const name = `${tmpImageName}-${Date.now()}`;
    fs.writeFileSync(`${name}.png`, img, 'base64');
    const { size: originalSize } = fs.statSync(`${name}.png`);
    webp.cwebp(
      `${name}.png`,
      `output-${name}.webp`,
      '-q 80',
      async (status, error) => {
        if (error) {
          console.log(error);
          return reject(error);
        }
        const compressedImg = fs.readFileSync(`output-${name}.webp`);
        const { size: newSize } = fs.statSync(`output-${name}.webp`);
        fs.unlinkSync(`output-${name}.webp`);
        fs.unlink(`${name}.png`);

        console.log(
          `saved ${100 - (newSize / originalSize) * 100}% of image size`
        );
        console.log('set', `${key}-png`);
        console.log('set', `${key}-webp`);
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
          cache.add(
            `${key}-webp`,
            compressedImg,
            { type: 'image/webp' },
            (err, out) => {
              if (err) {
                console.error(err);
                return rej(err);
              }
              resolve(out);
            }
          )
        ]).then(resolve, reject);
      }
    );
  });
}
function removeFromCache(key) {
  return new Promise((res, rej) => {
    cache.del(key, (err, quantity) => {
      if (err) {
        console.error('failed to remove from cache');
        return rej(err);
      }
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

  // setInterval(() => {
  //   cache.size((err, size) => {
  //     if (err) {
  //       console.error(err);
  //       return
  //     }
  //     cacheSize = size;
  //   });
  // }, 1000 * 10);
}

io.metric({
  type: 'metric',
  name: 'Cache size (bytes)',
  value: () => {
    return cacheSize;
  }
});
