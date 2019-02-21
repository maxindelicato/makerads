import { connect, organiseSponsors, recordStats } from './db';

import adsApi from './rest/ads';
import config from 'getconfig';
import express from 'express';
import helmet from 'helmet';
import http from 'http';
import httpProxy from 'http-proxy';
import io from '@pm2/io';
import path from 'path';
import referrersApi from './rest/referrers';
import statsApi from './rest/stats';
import url from 'url';

const app = express();
const server = http.createServer(app);

// app.use(helmet());
app.use(express.json());
app.use(express.urlencoded());

app.use('/api', referrersApi, statsApi);

adsApi(app);

if (process.env.NODE_ENV === 'development') {
  console.info('index: serving dev assets');
  const proxy = httpProxy.createProxyServer();
  app.all('/stats/ads/:url', (req, res) => {
    console.log('redi', req.url);
    proxy.web(req, res, {
      target: 'http://localhost:8000'
    });
  });
  app.all('/stats/referrers/:url', (req, res) => {
    proxy.web(req, res, {
      target: 'http://localhost:8000'
    });
  });
  app.all('/*', (req, res) => {
    proxy.web(req, res, {
      target: 'http://localhost:8000'
    });
  });
  proxy.on('error', e => {
    console.error('index: proxy error', e);
  });
} else {
  app.use(express.static(path.join(__dirname, '../public')));
}

let listen;
const App = {
  async start() {
    console.info('server starting');
    await connect();
    console.info('sorting sponsors');
    await organiseSponsors();
    await recordStats();
    listen = server.listen(1234);
    console.info('server started');
  },
  async stop() {
    listen.close();
  }
};

// action to manually refresh the database from AirTable
if (process.env.NODE_ENV !== 'development') {
  const fetchRecords = require('./records').default;
  io.action('db:sync', async cb => {
    console.log('syncing with airtable');
    try {
      await fetchRecords();
      await organiseSponsors();

      cb({ success: true });
    } catch (err) {
      console.error(err);
      cb({ success: false, err: err.message });
    }
  });
}

// (async () => {
//   const fetchRecords = require('./records').default;
//   await fetchRecords({ reset: true });
// })();

export default App;
