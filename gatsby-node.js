/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

// Implement the Gatsby API “onCreatePage”. This is
// called after every page is created.
exports.onCreatePage = async ({ page, actions }) => {
  const { createPage } = actions;
  console.log('PATH', page.path);
  if (page.path.match(/^\/stats\/ads/)) {
    page.matchPath = '/stats/ads/*';
    createPage(page);
  } else if (page.path.match(/^\/stats\/referrers/)) {
    page.matchPath = '/stats/referrers/*';
    createPage(page);
  }
};
