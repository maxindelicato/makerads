let App;
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
