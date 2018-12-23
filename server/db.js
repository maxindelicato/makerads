import { MongoClient, Logger, ObjectID } from 'mongodb';
import config from 'getconfig';

export let url;

if (config.db.user) {
  url = `mongodb://${config.db.user}:${config.db.password}@${config.db.host}:${
    config.db.port
  }/${config.db.name}?authSource=admin`;
} else {
  url = `mongodb://${config.db.host}:${config.db.port}/${config.db.name}`;
}

const client = new MongoClient(url, { useNewUrlParser: true });

let connection = null;
export function connect() {
  return new Promise((resolve, reject) => {
    client.connect(err => {
      if (err) {
        console.error('db: error connecting');
        console.error(err);
        return reject(err);
      }
      console.log('db: connected');
      connection = client.db(config.db.name);
      return resolve(connection);
    });
  });
}

export function close() {
  return connection.close();
}

export default function db() {
  return connection;
}

export function isoDate(date) {
  // mongo has to take dates like this....
  if (date) {
    return new Date(new Date(date).toISOString());
  }
  return new Date(new Date().toISOString());
}

export async function initCounter() {
  const col = await connection.collection('counter');
  await col.updateOne({}, { counter: 0 }, { upsert: true });
}

export async function getAd(id, { referrer } = {}) {
  if (!id) return getRandom({ referrer });
  const col = await connection.collection('ads');
  return col.findOne({ _id: new ObjectID(id) });
}

// ensure this function is only ever called
// once concurrently
let queue = [];
let fetching = false;
let fetchingPromise;
async function getRandom({ referrer } = {}) {
  if (fetching) {
    await fetchingPromise;
    return getRandom({ referrer });
  }
  console.log('get ad, not', referrer);
  fetching = true;
  fetchingPromise = new Promise(async (resolve, reject) => {
    try {
      const col = await connection.collection('counter');
      const { counter } = await col.findOne();
      console.log('serving ad', counter);
      await col.updateOne(
        {},
        {
          $inc: {
            counter: 1
          }
        }
      );
      const ads = await connection.collection('ads');
      const count = await ads.countDocuments({
        url: { $not: new RegExp(referrer) }
      });

      const random = await ads
        .find({ url: { $not: new RegExp(referrer) } })
        .skip(counter % count)
        .limit(1);

      const output = await random.toArray();
      resolve(output[0]);
    } catch (err) {
      reject(err);
    } finally {
      fetching = false;
    }
  });
  return fetchingPromise;
}

export async function click(id) {
  const col = await connection.collection('ads');
  return col.updateOne({ _id: new ObjectID(id) }, { $inc: { clicks: 1 } });
}

export async function impression(id) {
  const col = await connection.collection('ads');
  return col.updateOne({ _id: new ObjectID(id) }, { $inc: { impressions: 1 } });
}
