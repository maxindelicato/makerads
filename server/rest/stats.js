import {
  getStats,
  getStatsForAdWithUrl,
  getStatsForReferrerWithUrl
} from '../db';

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
    if (!s) {
      return res.status(404);
    }
    return res.send(s);
  } catch (err) {
    console.error(err);
    res.status(500);
  }
});

stats.get('/stats/referrer', async (req, res) => {
  try {
    const { url } = req.query;
    const s = await getStatsForReferrerWithUrl(url);
    if (!s) {
      return res.status(404);
    }
    return res.send(s);
  } catch (err) {
    console.error(err);
    res.status(500);
  }
});

export default stats;
