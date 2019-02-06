const MongoClient = require('mongodb').MongoClient;

const url = `mongodb://colin:colinlovesmongo@db.leavemealone.xyz/makerads?authSource=admin`;

const client = new MongoClient(url, { useNewUrlParser: true });

let connection = null;
function connect() {
  return new Promise((resolve, reject) => {
    client.connect(err => {
      if (err) {
        console.error('db: error connecting');
        console.error(err);
        return reject(err);
      }
      console.log('db: connected');
      connection = client.db('makerads');
      return resolve(connection);
    });
  });
}

async function doFix() {
  try {
    const con = await connect();
    const col = await con.collection('referrers');
    const ads = await col.find().toArray();
    await Promise.all(
      ads.map(a => {
        const history = a.history.reduce((out, h) => {
          const ts = new Date(h.timestamp);
          if (ts.getDate() === 13 && ts.getMinutes() !== 19) {
            const realItem = a.history[1] || a.history[0];
            return [
              {
                ...realItem,
                impressions: realItem.impressions + h.impressions,
                clicks: realItem.clicks + h.clicks,
                earnings:
                  realItem.earnings +
                  (isNaN(h.earnings) || !h.earnings ? 0 : h.earnings)
              }
            ];
          }
          return [...out, h];
        }, []);

        col.updateMany(
          { id: a.id },
          { $set: { history: [] } },
          { multi: true }
        );
      })
    );
  } catch (err) {
    console.error(err);
  }
}

doFix();
