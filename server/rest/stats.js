import { getStats, getStatsForAdWithUrl } from '../db';

import { Router } from 'express';

const stats = new Router();
stats.get('/stats', async (req, res) => {
  try {
    const s = await getStats();
    res.send(s);
  } catch (err) {
    console.error(err);
    res.status(500);
  }
});

stats.get('/stats/ad', async (req, res) => {
  try {
    const { url } = req.query;
    const s = await getStatsForAdWithUrl(url);
    res.send(s);
  } catch (err) {
    console.error(err);
    res.status(500);
  }
});

export default stats;
