const React = require('react');

const countlyBase = `
var cly = document.createElement('script');
cly.type = 'text/javascript';
cly.async = true;
`;
exports.onRenderBody = (
  { setHeadComponents, setPostBodyComponents },
  pluginOptions
) => {
  let excludePaths = [];
  if (hasOption('exclude', pluginOptions)) {
    const Minimatch = require(`minimatch`).Minimatch;
    pluginOptions.exclude.map(exclude => {
      const mm = new Minimatch(exclude);
      excludePaths.push(mm.makeRe());
    });
  }

  const setComponents = pluginOptions.head
    ? setHeadComponents
    : setPostBodyComponents;

  return setComponents([
    <script
      key={`gatsby-plugin-countly`}
      async={true}
      dangerouslySetInnerHTML={{
        __html: getCountlyCodeStr(pluginOptions)
      }}
    />
  ]);
};

function getCountlyCodeStr(options) {
  let codeStr = `
  const debug = false; // ${process.env.NODE_ENV !== 'production' ||
    options.debug};
  const respectDNT = ${options.respectDNT} && !debug;
  const doNotTrack =
    respectDNT &&
    (window.navigator.doNotTrack == '1' || window.doNotTrack == '1');
  if (!doNotTrack) {
    var Countly = Countly || {};
    Countly.q = Countly.q || [];

    //provide countly initialization parameters
    Countly.app_key = '${options.app_key}';
    Countly.url = '${options.url}';
    Countly.debug = debug;
    `;
  if (options.track_sessions) {
    codeStr = `${codeStr} Countly.q.push(['track_sessions']);`;
  }
  if (options.track_pageview) {
    codeStr = `${codeStr} Countly.q.push(['track_pageview']);`;
  }
  if (options.track_clicks) {
    codeStr = `${codeStr} Countly.q.push(['track_clicks']);`;
  }
  if (options.track_scrolls) {
    codeStr = `${codeStr} Countly.q.push(['track_scrolls']);`;
  }
  codeStr = `${codeStr}
    (function() {
      var cly = document.createElement('script');
      cly.type = 'text/javascript';
      cly.async = true;
      cly.src =
        '${options.script_url}';
      cly.onload = function() {
        Countly.init();
      };
      var s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(cly, s);
    })();
  }`;

  return codeStr;
}

function hasOption(name, pluginOptions) {
  return typeof pluginOptions[name] !== 'undefined';
}
