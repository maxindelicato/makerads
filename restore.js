require('@babel/register');
require('@babel/polyfill');
const db = require('./server/db');
const records = require('./server/records');

(async function() {
  await db.connect();

  records.default({ reset: true });
})();
