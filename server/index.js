import express from 'express';
import httpProxy from 'http-proxy';
import http from 'http';
import config from 'getconfig';
import helmet from 'helmet';
import url from 'url';
import path from 'path';
import io from '@pm2/io';

import { connect, organiseSponsors, recordStats } from './db';
import adsApi from './rest/ads';
import referrersApi from './rest/referrers';
import statsApi from './rest/stats';

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

export default App;
