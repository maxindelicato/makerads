import RedisStore from 'rate-limit-redis';
import io from '@pm2/io';
import rateLimit from 'express-rate-limit';

const fraudMeter = io.meter({
  name: 'fraudulant clicks'
});

export default rateLimit({
  windowMs: 60 * 60 * 1000 * 24, // 1 day window
  max: 10, // start blocking after 10 requests
  skipFailedRequests: true,
  store: new RedisStore(),
  handler: (req, res, next) => {
    res.locals.ignoreClick = true;
    console.log('fraudulant click ignored');
    fraudMeter.mark();
    return next();
  }
});
