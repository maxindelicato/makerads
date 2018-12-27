import Airtable from 'airtable';
import { airtable as airTableConf } from 'getconfig';

import db, { isoDate } from './db';
const request = require('request').defaults({ encoding: null });

const base = new Airtable({ apiKey: airTableConf.apiKey }).base(
  airTableConf.base
);

// used on LIVE to sync data with the AirTable
// base, so that users can submit ads easily
async function sync({ reset } = {}) {
  const ids = await getRecords({ reset });
  const updateIds = await updateExistingRecords();
  if (!reset) {
    await updateRecords([...ids, ...updateIds]);
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
        function page(records, fetchNextPage) {
          if (!records.length) {
            console.log('no new ads');
          }
          records.forEach(function(record) {
            insert(record.fields);
            recordIds = [...recordIds, record.id];
          });
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
        filterByFormula: 'Force Update'
      })
      .eachPage(
        function page(records, fetchNextPage) {
          if (!records.length) {
            console.log('no new ads to update');
          }
          records.forEach(function(record) {
            update(record.fields);
            recordIds = [...recordIds, record.id];
          });
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
            ['Force Update']: false
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
  const { Image, Name, Email, URL, Duration } = fields;
  console.log(`inserting ${URL}`);
  if (!Name) return null;
  // fetch image
  const image = await fetchImage(Image[0].url);
  const data = {
    image,
    name: Name,
    email: Email,
    url: URL,
    duration: Duration
  };
  try {
    const col = await db().collection('ads');
    await col.insertOne({
      ...data,
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
  const { Image, Name, Email, URL, Duration } = fields;
  console.log(`inserting ${URL}`);
  if (!Name) return null;
  // fetch image
  const image = await fetchImage(Image[0].url);
  const data = {
    image,
    name: Name,
    email: Email,
    url: URL,
    duration: Duration
  };
  try {
    const col = await db().collection('ads');
    await col.updateOne(
      {
        url: data.url
      },
      {
        ...data,
        lastUpdatedAt: isoDate()
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
      console.log(uri);
      const data = new Buffer(body).toString('base64');
      return resolve(data);
    });
  });
};

// reset will fetch everything that is approved,
// even if has been inserted before.
// used to reset the local database to match the airtable
export default async function fetchRecords({ reset } = {}) {
  sync({ reset });
}
