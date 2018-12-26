import { getReferrers } from '../db';

export default app => {
  app.get('/referrers', async (req, res) => {
    try {
      console.log('get referrers');
      const refs = await getReferrers();
      res.send(refs);
    } catch (err) {
      console.error(err);
      res.status(500);
    }
  });
};
