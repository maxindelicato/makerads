import express from 'express';
import http from 'http';
import config from 'getconfig';
import helmet from 'helmet';
import url from 'url';
import path from 'path';
import io from '@pm2/io';

import adsApi from './rest/ads';
import referrersApi from './rest/referrers';
import fetchRecords from './records';

const app = express();
const server = http.createServer(app);

// app.use(helmet());
app.use(express.json());
app.use(express.urlencoded());

app.use(express.static(path.join(__dirname, '../client')));

adsApi(app);
referrersApi(app);

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

// action to manually refresh the database from AirTable
if (process.env.NODE_ENV !== 'development') {
  io.action('db:sync', cb => {
    fetchRecords();
  });
}

export default App;
