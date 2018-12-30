import url from 'url';
import rediscache from 'express-redis-cache';
import io from '@pm2/io';

import ad, { jsonAd } from '../services/ad-service';
import db, { getAd } from '../db';
import { trackClick, trackImpression } from '../utils/tracking';

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
    res.send(a);
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
      const { ref: referrer } = req.query;
      const cachedResponse = await getFromCache(req.url);
      let imageData;

      if (cachedResponse) {
        imageData = cachedResponse;
      } else {
        const { image } = await getAd(adId);
        imageData = image;
        addToCache(req.url, imageData);
      }

      const img = new Buffer(imageData, 'base64');
      trackImpression(adId, referrer);
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': img.length
      });
      res.end(img);
    } catch (err) {
      console.error(err);
      res.status(500).send(err);
    }
  });
};

function getFromCache(key) {
  return new Promise((res, rej) => {
    cache.get(key, (err, entries) => {
      if (err) {
        return rej(err);
      }
      if (entries.length) {
        return res(entries[0].body);
      }
      return res(null);
    });
  });
}

function addToCache(key, img) {
  return new Promise((res, rej) => {
    cache.add(key, img, { type: 'image/png' }, (err, out) => {
      if (err) {
        console.error(err);
        return rej(err);
      }
      res(out);
    });
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
