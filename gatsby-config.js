const { url } = require('getconfig');
module.exports = {
  siteMetadata: {
    title: `Makerads - Together we can do more ❤️`,
    description: `MakerAds`,
    author: `@jamesivings`,
    baseUrl: url
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
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.app/offline
    'gatsby-plugin-offline',
    `gatsby-plugin-sass`
  ]
};
