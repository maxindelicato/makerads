import {
  getStats,
  getStatsForAdWithId,
  getStatsForReferrerWithId,
  getStatsForReferrers
} from '../db';

import { Router } from 'express';

const stats = new Router();
stats.get('/stats', async (req, res) => {
  try {
    const s = await getStats();
    res.send(s);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

stats.get('/stats/ad', async (req, res) => {
  try {
    const { id } = req.query;
    const s = await getStatsForAdWithId(id);
    if (!s) {
      return res.status(404).send();
    }
    return res.send(s);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

stats.get('/stats/referrer', async (req, res) => {
  try {
    const { id } = req.query;
    const s = await getStatsForReferrerWithId(id);
    if (!s) {
      return res.status(404).send();
    }
    return res.send(s);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

stats.get('/stats/referrers', async (req, res) => {
  try {
    const s = await getStatsForReferrers();
    return res.send(s);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

export default stats;
