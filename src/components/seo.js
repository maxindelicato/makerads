import React from 'react';
import Helmet from 'react-helmet';
import { StaticQuery, graphql } from 'gatsby';

import metaImage from '../images/meta-image.png';
import favicon from '../images/favicon.png';

function SEO({ description, lang = 'en', meta = [], keywords, title }) {
  return (
    <StaticQuery
      query={detailsQuery}
      render={data => {
        const metaDescription =
          description || data.site.siteMetadata.description;
        return (
          <Helmet
            htmlAttributes={{
              lang
            }}
            title={title}
            titleTemplate={`%s | ${data.site.siteMetadata.title}`}
            link={[{ rel: 'icon', type: 'image/png', href: favicon }]}
            meta={[
              {
                name: `description`,
                content: metaDescription
              },
              {
                property: `og:title`,
                content: title
              },
              {
                property: `og:description`,
                content: metaDescription
              },
              {
                property: `og:type`,
                content: `website`
              },
              {
                property: `og:site_name`,
                content: data.site.siteMetadata.siteName
              },
              {
                property: `og:url`,
                content: data.site.siteMetadata.baseUrl
              },
              {
                name: `og:image`,
                content: `${data.site.siteMetadata.baseUrl}${metaImage}`
              },
              {
                name: `og:image:secure_url`,
                content: `${data.site.siteMetadata.baseUrl}${metaImage}`
              },
              {
                name: `twitter:card`,
                content: `summary_large_image`
              },
              {
                name: `twitter:creator`,
                content: data.site.siteMetadata.author
              },
              {
                name: `twitter:title`,
                content: title
              },
              {
                name: `twitter:description`,
                content: metaDescription
              },
              {
                name: `twitter:domain`,
                content: data.site.siteMetadata.baseUrl
              },
              {
                name: `twitter:url`,
                content: data.site.siteMetadata.baseUrl
              },
              {
                name: `twitter:image`,
                content: `${data.site.siteMetadata.baseUrl}${metaImage}`
              }
            ]
              .concat(
                keywords.length > 0
                  ? {
                      name: `keywords`,
                      content: keywords.join(`, `)
                    }
                  : []
              )
              .concat(meta)}
          >
            <meta charSet="utf-8" />
            <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />
          </Helmet>
        );
      }}
    />
  );
}

export default SEO;

const detailsQuery = graphql`
  query DefaultSEOQuery {
    site {
      siteMetadata {
        title
        description
        author
        baseUrl
        siteName
      }
    }
  }
`;
