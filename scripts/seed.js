import db, { isoDate, connect, close } from '../server/db';

import adsJson from './ads.json';
import referrersJson from './referrers.json';
const counterJson = {
  counter: 0
};

async function seed() {
  try {
    await connect();
    console.log('seeding counter');
    await seedCounter();
    console.log('seeding ads');
    await seedAds();
    console.log('seeding referrers');
    await seedReferrers();
    await close();
    console.log('seed finished');
  } catch (err) {
    console.error('failed to seed data');
    console.error(err);
  }
}
async function seedCounter() {
  const col = await db().collection('counter');
  const hasCounter = await col.findOne();
  if (hasCounter) {
    console.warn(
      'Looks like this database is not empty, this seed scripts only works on a fresh database'
    );
    process.exit();
  }
  await col.insertOne(counterJson);
}

async function seedAds() {
  const col = await db().collection('ads');
  return col.insertMany(
    adsJson.map(ad => ({
      ...ad,
      createdAt: isoDate(),
      lastUpdatedAt: isoDate()
    }))
  );
}

async function seedReferrers() {
  const col = await db().collection('referrers');
  return col.insertMany(
    referrersJson.map(ad => ({
      ...ad,
      createdAt: isoDate(),
      lastUpdatedAt: isoDate()
    }))
  );
}

seed();
