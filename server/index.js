import express from 'express';
import http from 'http';
import config from 'getconfig';
import helmet from 'helmet';
import url from 'url';
import path from 'path';
import db, { connect, getAd, click, impression, initCounter } from './db';
import ad from './ad';
import fetchRecords from './records';

const app = express();
const server = http.createServer(app);

// app.use(helmet());
app.use(express.json());
app.use(express.urlencoded());

// get random ad page
app.get('/ad', async (req, res) => {
  const referrer = req.header('Referer');
  const referrerUrl = url.parse(referrer);
  const a = await ad({ referrer: referrerUrl.host });
  res.send(a);
});

app.get('/ad/:id/redirect', async (req, res) => {
  const adId = req.params.id;
  const { referrer } = req.query;
  try {
    const { url } = await getAd(adId);
    // log a click
    click(adId);
    return res.redirect(`${url}?ref=${referrer}`);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.get('/ad/:id/image', async (req, res) => {
  const adId = req.params.id;
  const { referrer } = req.query;
  try {
    const { image } = await getAd(adId);
    // log an impression
    impression(adId);
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
  setInterval(() => {
    fetchRecords();
  }, 1000 * 60);
  fetchRecords();
}

export default App;
