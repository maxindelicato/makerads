import io from '@pm2/io';
import { click, impression } from '../db';

const impressionsSec = io.meter({
  name: 'impressions/sec'
});
const clicksSec = io.meter({
  name: 'clicks/sec'
});

export function trackImpression(adId, referrer) {
  impressionsSec.mark();
  impression(adId, referrer);
}

export function trackClick(adId, referrer) {
  clicksSec.mark();
  click(adId, referrer);
}
