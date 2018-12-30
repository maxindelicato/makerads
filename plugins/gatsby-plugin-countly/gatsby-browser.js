exports.onRouteUpdate = function({ location }) {
  if (!window.Countly || !location) return;
  const isDebug = window.Countly.debug;
  if (process.env.NODE_ENV !== 'production' && !isDebug) return;
  const excludePath =
    window.excludePaths &&
    window.excludePaths.some(rx => rx.test(location.pathname));

  if (!excludePath) {
    if (isDebug) {
      console.debug(
        `gatsby-countly: tracking route change ${location.pathname}`
      );
      console.debug(
        'gatsby-countly: tracking route change ignored in debug mode'
      );
    }
    window.Countly.q.push(['track_pageview', location.pathname]);
  } else {
    console.debug(
      `gatsby-countly: not tracking excluded path ${location.pathname}`
    );
  }
};
