const { url } = require('getconfig');
module.exports = {
  siteMetadata: {
    title: `MakerAds - Together we can do more ❤️`,
    description: `Unobtrusive adverts for makers`,
    author: `@JamesIvings`,
    baseUrl: url,
    siteName: 'MakerAds'
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`
      }
    },
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: 'UA-131308247-1',
        head: false,
        anonymize: true,
        respectDNT: true
      }
    },
    {
      resolve: `gatsby-plugin-countly`,
      options: {
        respectDNT: false,
        app_key: '83e962133509a315e018e92fa64785dc9e981e56',
        url: 'https://analytics.squarecat.io',
        script_url: 'https://analytics.squarecat.io/sdk/web/countly.min.js',
        track_sessions: true
      }
    },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.app/offline
    'gatsby-plugin-offline',
    `gatsby-plugin-sass`
  ]
};
