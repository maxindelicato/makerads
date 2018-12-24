import express from 'express';
import http from 'http';
import config from 'getconfig';
import helmet from 'helmet';
import url from 'url';
import path from 'path';
import db, { connect, getAd, click, impression, initCounter } from './db';
import ad, { jsonAd } from './ad';
import fetchRecords from './records';
import io from '@pm2/io';

const impressionsSec = io.meter({
  name: 'impressions/sec'
});
const clicksSec = io.meter({
  name: 'clicks/sec'
});

const app = express();
const server = http.createServer(app);

// app.use(helmet());
app.use(express.json());
app.use(express.urlencoded());

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

app.get('/ad/:id/redirect', async (req, res) => {
  const adId = req.params.id;
  const { ref: referrer } = req.query;
  try {
    const { url } = await getAd(adId);
    // log a click
    click(adId, referrer);
    clicksSec.mark();
    return res.redirect(`${url}?ref=${referrer}`);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.get('/ad/:id/image', async (req, res) => {
  const adId = req.params.id;
  const { ref: referrer } = req.query;
  try {
    const { image } = await getAd(adId);
    // log an impression
    impressionsSec.mark();
    impression(adId, referrer);
    var img = new Buffer(image, 'base64');
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

app.use(express.static(path.join(__dirname, '../client')));

let listen;
const App = {
  async start() {
    console.info('server starting');
    connect();
    listen = server.listen(1234);
    console.info('server started');
  },
  async stop() {
    listen.close();
  }
};

if (process.env.NODE_ENV !== 'development') {
  io.action('db:sync', cb => {
    fetchRecords();
  });
}

export default App;
