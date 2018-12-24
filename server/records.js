import Airtable from 'airtable';
import db, { isoDate } from './db';

const request = require('request').defaults({ encoding: null });

const base = new Airtable({ apiKey: 'keymWk6x3qe1QpDJn' }).base(
  'app25MxfBcl3Kzssu'
);

async function sync({ reset } = {}) {
  const ids = await getRecords({ reset });
  if (!reset) {
    await updateRecords(ids);
  }
}
async function getRecords({ reset = false } = {}) {
  return new Promise((resolve, reject) => {
    let recordIds = [];
    base('Table 1')
      .select({
        view: 'Grid view',
        filterByFormula: reset ? '' : 'AND(NOT(Inserted), Approved)'
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

async function updateRecords(ids) {
  return Promise.all(
    ids.map(async id => {
      return new Promise((resolve, reject) => {
        base('Table 1').update(
          id,
          {
            Inserted: true
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

const insert = async fields => {
  const {
    Image,
    Name,
    Email,
    URL,
    Duration,
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
    product: fields['Product Name'],
    text: Text
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

export default async function fetchRecords({ reset } = {}) {
  sync({ reset });
}
