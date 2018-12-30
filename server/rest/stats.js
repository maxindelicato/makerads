import { Router } from 'express';

import { getStats } from '../db';

const referrers = new Router();
referrers.get('/stats', async (req, res) => {
  try {
    const s = await getStats();
    res.send(s);
  } catch (err) {
    console.error(err);
    res.status(500);
  }
});

export default referrers;
