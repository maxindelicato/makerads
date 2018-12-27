import Airtable from 'airtable';

const apiKey = 'keytVo5TZ32yOLSAo';
const baseId = 'app25MxfBcl3Kzssu';

const base = new Airtable({ apiKey }).base(baseId);

base('Table 1')
  .select({
    view: 'Grid view',
    filterByFormula: 'Update'
  })
  .eachPage(
    function page(records, fetchNextPage) {
      console.log(records.length);
      fetchNextPage();
    },
    function done(err) {
      console.log(err || 'done');
    }
  );
