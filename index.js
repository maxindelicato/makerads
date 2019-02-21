let App;
require('dotenv').config();
if (process.env.NODE_ENV !== 'development') {
  console.info('starting production api');
  require('@babel/polyfill');
  App = require('./build/index').default;
} else {
  console.info('starting dev api');
  require('@babel/polyfill');
  require('@babel/register');
  App = require('./server/index').default;
}

App.start();

process.on('unhandledRejection', function(reason, p) {
  console.error('Unhandled rejection');
  console.error(reason);
});

process.on('uncaughtException', function(error) {
  console.error('Uncaught exception');
  console.error(error);
  process.exit(1);
});
