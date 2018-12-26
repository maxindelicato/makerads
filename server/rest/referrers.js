import { Router } from 'express';

import { getReferrers } from '../db';

const referrers = new Router();
referrers.get('/referrers', async (req, res) => {
  try {
    console.log('get referrers');
    const refs = await getReferrers();
    res.send(refs);
  } catch (err) {
    console.error(err);
    res.status(500);
  }
});

export default referrers;
