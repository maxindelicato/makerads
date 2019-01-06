import { MongoClient, Logger, ObjectID } from 'mongodb';
import config from 'getconfig';
import counter from 'sliding-window-counter';
import Agenda from 'agenda';

const impressionsCount = counter(1000 * 60);
const clicksCount = counter(1000 * 60);

export let url;

// Logger.setLevel('debug');

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
  return client.close();
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
export async function getRandom({ referrer } = {}) {
  if (fetching) {
    await fetchingPromise;
    return getRandom({ referrer });
  }
  fetching = true;
  fetchingPromise = new Promise(async (resolve, reject) => {
    try {
      const col = await connection.collection('counter');
      const {
        counter,
        sponsorCounter,
        sponsorMod,
        adQuantity,
        sponsorQuantity
      } = await col.findOne();
      const ads = await connection.collection('ads');
      let query;
      let skipNumber;
      // determine if to show a regular ad or a sponsored ad
      if (sponsorCounter % sponsorMod === 0) {
        query = {
          sponsored: true
        };
        skipNumber = (sponsorCounter / sponsorMod) % sponsorQuantity;
      } else {
        query = {
          sponsored: { $ne: true }
        };
        skipNumber = counter % adQuantity;
        await col.updateOne(
          {},
          {
            $inc: {
              counter: 1
            }
          }
        );
      }

      // if there is a referrer, make sure not to
      // return that referrers ad if there is one
      // FIXME, this will skip this referrer
      // for this round, which is not ideal
      if (referrer) {
        query = {
          ...query,
          url: { $not: new RegExp(referrer) }
        };
      }

      await col.updateOne(
        {},
        {
          $inc: {
            sponsorCounter: 1
          }
        }
      );

      const random = await ads
        .find(query)
        .skip(skipNumber)
        .limit(1);

      const output = await random.toArray();
      resolve(output[0]);
    } catch (err) {
      reject(err);
    } finally {
      fetching = false;
      ss;
    }
  });
  return fetchingPromise;
}

export async function click(id, referrer) {
  const col = await connection.collection('ads');
  clicksCount(1);
  if (referrer) {
    await addReferrerClick(referrer);
  }
  return col.updateOne(
    {
      _id: new ObjectID(id)
    },
    {
      $inc: {
        clicks: 1,
        clicksToday: 1
      }
    }
  );
}

export async function impression(id, referrer) {
  const col = await connection.collection('ads');
  impressionsCount(1);
  if (referrer) {
    await addReferrerImpression(referrer);
  }
  return col.updateOne(
    { _id: new ObjectID(id) },
    {
      $inc: { impressions: 1, impressionsToday: 1 }
    }
  );
}

export async function addReferrerImpression(ref) {
  const col = await connection.collection('referrers');
  return col.updateOne(
    { referrer: ref },
    {
      $inc: { impressions: 1, impressionsToday: 1 }
    },
    { upsert: true }
  );
}

export async function addReferrerClick(ref) {
  const col = await connection.collection('referrers');
  return col.updateOne(
    { referrer: ref },
    {
      $inc: { clicks: 1, clicksToday: 1 }
    },
    { upsert: true }
  );
}

export async function getReferrers({
  skip = 0,
  limit = 5,
  sortBy = 'impressions'
} = {}) {
  try {
    const col = await connection.collection('referrers');
    return col
      .find({ referrer: { $regex: '^(?!local.)' } })
      .project({ _id: 0, createdAt: 0, lastUpdatedAt: 0 })
      .sort({ impressions: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function getTotals() {
  const col = await connection.collection('referrers');
  return col
    .aggregate([
      {
        $group: {
          _id: 'Totals',
          impressions: { $sum: '$impressions' },
          clicks: { $sum: '$clicks' }
        }
      }
    ])
    .toArray();
}

export async function organiseSponsors() {
  const ads = await connection.collection('ads');
  const sponsorCount = await ads.countDocuments({
    sponsored: true
  });
  const adCount = await ads.countDocuments({
    sponsored: { $ne: true }
  });
  const counterCol = await connection.collection('counter');
  const { showSponsorEvery } = await counterCol.findOne({});
  const sponsorMod = showSponsorEvery / sponsorCount;
  return counterCol.updateOne(
    {},
    {
      $set: {
        sponsorMod,
        sponsorQuantity: sponsorCount,
        adQuantity: adCount
      }
    }
  );
}

export async function getStats() {
  const referrers = await getReferrers({ limit: 10 });
  const [totals] = await getTotals();
  const { clicks, impressions } = totals;
  return {
    referrers,
    totalClicks: clicks,
    totalImpressions: impressions,
    impressionsPerMin: impressionsCount(),
    clicksPerMin: clicksCount()
  };
}

export async function recordDayStats() {
  const adsCol = await connection.collection('ads');
  const refsCol = await connection.collection('referrers');
  const statsCol = await connection.collection('stats');
  let totalClicksToday = 0;
  let totalImpressionsToday = 0;
  // update ads history object with todays stats
  const ads = await adsCol
    .find({}, { _id: 1, impressionsToday: 1, clicksToday: 1 })
    .toArray();

  await Promise.all(
    ads.map(({ _id, clicksToday, impressionsToday }) => {
      totalClicksToday = totalClicksToday + clicksToday;
      totalImpressionsToday = totalImpressionsToday + impressionsToday;
      return adsCol.updateOne(
        { _id },
        {
          $push: {
            history: {
              timestamp: isoDate(),
              impressions: impressionsToday,
              clicks: clicksToday
            }
          },
          $set: {
            impressionsToday: 0,
            clicksToday: 0
          }
        }
      );
    })
  );
  // update referrers history object with todays stats
  const refs = await refsCol
    .find({}, { _id: 1, impressionsToday: 1, clicksToday: 1 })
    .toArray();

  await Promise.all(
    refs.map(({ _id, clicksToday, impressionsToday }) =>
      refsCol.updateOne(
        { _id },
        {
          $push: {
            history: {
              timestamp: isoDate(),
              impressions: impressionsToday,
              clicks: clicksToday
            }
          },
          $set: {
            impressionsToday: 0,
            clicksToday: 0
          }
        }
      )
    )
  );

  await statsCol.updateOne(
    {},
    {
      $inc: {
        totalImpressions: totalImpressionsToday,
        totalClicks: totalClicksToday
      },
      $push: {
        history: {
          timestamp: isoDate(),
          impressions: totalImpressionsToday,
          clicks: totalClicksToday
        }
      }
    }
  );
}
const agenda = new Agenda({ db: { address: url } });

agenda.define('record day stats', async (job, done) => {
  console.log('recording day stats');
  recordDayStats();
});

export async function recordStats() {
  console.log('starting agenda');
  agenda.on('ready', async () => {
    await agenda.start();
    await agenda.every('0 0 * * *', 'record day stats');
  });
}
