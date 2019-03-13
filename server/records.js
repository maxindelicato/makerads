import db, { isoDate } from './db';

import Airtable from 'airtable';
import { airtable as airTableConf } from 'getconfig';
import fs from 'fs';

const request = require('request').defaults({ encoding: null });

const base = new Airtable({ apiKey: airTableConf.apiKey }).base(
  airTableConf.base
);

// used on LIVE to sync data with the AirTable
// base, so that users can submit ads easily
async function sync({ reset } = {}) {
  console.log('syncing');
  try {
    const ids = await getRecords({ reset });
    const updateIds = await updateExistingRecords();
    if (!reset) {
      await updateRecords([...ids, ...updateIds]);
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// get the records from the AirTable base
// and insert into mongo
async function getRecords({ reset = false } = {}) {
  return new Promise((resolve, reject) => {
    let recordIds = [];
    base('Table 1')
      .select({
        view: 'Grid view',
        filterByFormula: reset ? 'Approved' : 'AND(NOT(Inserted), Approved)'
      })
      .eachPage(
        async function page(records, fetchNextPage) {
          if (!records.length) {
            console.log('no new ads');
          }
          await records.reduce(async (p, record) => {
            await p;
            try {
              await insert(record.fields);
              recordIds = [...recordIds, record.id];
            } catch (err) {
              console.error('failed to insert image');
              console.error(err);
            }
          }, Promise.resolve());
          fetchNextPage();
        },
        function done(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve(recordIds);
        }
      );
  });
}

async function updateExistingRecords() {
  return new Promise((resolve, reject) => {
    let recordIds = [];
    base('Table 1')
      .select({
        view: 'Grid view',
        filterByFormula: 'Update'
      })
      .eachPage(
        async function page(records, fetchNextPage) {
          if (!records.length) {
            console.log('no new ads to update');
          }
          await records.reduce(async (p, record) => {
            await p;
            try {
              await update(record.fields);
              recordIds = [...recordIds, record.id];
            } catch (err) {
              console.error('failed to insert image');
              console.error(err);
            }
          }, Promise.resolve());
          fetchNextPage();
        },
        function done(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve(recordIds);
        }
      );
  });
}

// update the AirTable base to specify that
// the records were inserted successfully
async function updateRecords(ids) {
  return Promise.all(
    ids.map(async id => {
      return new Promise((resolve, reject) => {
        base('Table 1').update(
          id,
          {
            Inserted: true,
            Update: false
          },
          function(err, record) {
            if (err) {
              return reject(err);
            }
            resolve();
          }
        );
      });
    })
  );
}

// insert a record into mongo
const insert = async fields => {
  const {
    Image,
    Name,
    Email,
    URL,
    Duration,
    Label,
    Paid,
    Sponsored,
    Expires,
    Text
  } = fields;
  if (!Name) return null;
  // fetch image
  const image = await fetchImage(Image[0].url);
  const data = {
    image,
    name: Name,
    email: Email,
    url: URL,
    duration: Duration,
    labelPosition: Label,
    sponsored: Sponsored,
    paidAt: Paid,
    sponsoredEnds: Expires,
    clicksToday: 0,
    text: Text,
    impressionsToday: 0
  };
  try {
    const col = await db().collection('ads');
    await col.insertOne({
      ...data,
      history: [],
      createdAt: isoDate(),
      lastUpdatedAt: isoDate()
    });
    console.log(`users-dao: inserted ad ${URL}`);
  } catch (err) {
    console.error('users-dao: error inserting ad');
    console.error(err);
    throw err;
  }
};

const update = async fields => {
  const {
    Image,
    Name,
    Email,
    URL,
    Duration,
    Label,
    Paid,
    Sponsored,
    Expires,
    Text
  } = fields;
  console.log(`inserting ${URL}`);
  if (!Name) return null;
  // fetch image
  const image = await fetchImage(Image[0].url);
  const data = {
    image,
    name: Name,
    email: Email,
    url: URL,
    duration: Duration,
    labelPosition: Label,
    sponsored: Sponsored,
    paidAt: Paid,
    sponsoredEnds: Expires,
    text: Text
  };
  try {
    const col = await db().collection('ads');
    await col.updateOne(
      {
        url: data.url
      },
      {
        $set: {
          ...data,
          lastUpdatedAt: isoDate()
        }
      }
    );
    console.log(`users-dao: updated ad ${URL}`);
  } catch (err) {
    console.error('users-dao: error updating ad');
    console.error(err);
    throw err;
  }
};
// fetch the record image and convert to bsae64
const fetchImage = async uri => {
  console.log('fetching image', uri);
  return new Promise((resolve, reject) => {
    request.get(uri, function(err, res, body) {
      if (err || res.statusCode !== 200) {
        return reject(err);
      }
      const data = new Buffer(body).toString('base64');
      return resolve(data);
    });
  });
};

// reset will fetch everything that is approved,
// even if has been inserted before.
// used to reset the local database to match the airtable
export default async function fetchRecords({ reset } = {}) {
  return sync({ reset });
}
