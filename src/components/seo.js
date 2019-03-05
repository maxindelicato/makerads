import { StaticQuery, graphql } from 'gatsby';

import Helmet from 'react-helmet';
import React from 'react';
import defaultImage from '../images/meta-image.png';
import favicon from '../images/favicon.png';

function SEO({
  description,
  lang = 'en',
  meta = [],
  keywords = [],
  title,
  image
}) {
  return (
    <StaticQuery
      query={detailsQuery}
      render={data => {
        const metaTitle = title
          ? `${title} | ${siteName}`
          : data.site.siteMetadata.title;
        const metaDescription =
          description || data.site.siteMetadata.description;
        const { author, baseUrl, siteName } = data.site.siteMetadata;
        const metaImage = image || defaultImage;
        return (
          <Helmet>
            <meta charSet="utf-8" />
            <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />
            <title>{metaTitle}</title>
            <meta name="description" content={metaDescription} />
            <link rel="canonical" href={`${baseUrl}/index.html`} />
            <link
              rel="shortcut icon"
              type="image/png"
              href={favicon}
              id="dynamic-favicon"
            />
            {/* facebook open graph tags */}
            <meta property="og:locale" content="en_US" />
            <meta property="og:image" content={`${baseUrl}${metaImage}`} />
            <meta
              property="og:image:secure_url"
              content={`${baseUrl}${metaImage}`}
            />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={baseUrl} />
            <meta property="og:title" content={metaTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:site_name" content={siteName} />

            {/* twitter card tags additive with the og: tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:domain" value={baseUrl} />
            <meta name="twitter:title" value={metaTitle} />
            <meta name="twitter:description" value={metaDescription} />
            <meta name="twitter:image" content={`${baseUrl}${metaImage}`} />
            <meta name="twitter:url" value={baseUrl} />
            <meta name="twitter:author" value={data.site.siteMetadata.author} />
            <html lang="en" />
          </Helmet>
          // <Helmet
          //   htmlAttributes={{
          //     lang
          //   }}
          //   title={title}
          //   titleTemplate={`%s | ${data.site.siteMetadata.title}`}
          //   link={[{ rel: 'icon', type: 'image/png', href: favicon }]}
          //   meta={[
          //     {
          //       name: `description`,
          //       content: metaDescription
          //     },
          //     {
          //       property: `og:title`,
          //       content: title
          //     },
          //     {
          //       property: `og:description`,
          //       content: metaDescription
          //     },
          //     {
          //       property: `og:type`,
          //       content: `website`
          //     },
          //     {
          //       property: `og:site_name`,
          //       content: data.site.siteMetadata.siteName
          //     },
          //     {
          //       property: `og:url`,
          //       content: data.site.siteMetadata.baseUrl
          //     },
          //     {
          //       name: `og:image`,
          //       content: `${data.site.siteMetadata.baseUrl}${metaImage}`
          //     },
          //     {
          //       name: `og:image:secure_url`,
          //       content: `${data.site.siteMetadata.baseUrl}${metaImage}`
          //     },
          //     {
          //       name: `twitter:card`,
          //       content: `summary_large_image`
          //     },
          //     {
          //       name: `twitter:creator`,
          //       content: data.site.siteMetadata.author
          //     },
          //     {
          //       name: `twitter:title`,
          //       content: title
          //     },
          //     {
          //       name: `twitter:description`,
          //       content: metaDescription
          //     },
          //     {
          //       name: `twitter:domain`,
          //       content: data.site.siteMetadata.baseUrl
          //     },
          //     {
          //       name: `twitter:url`,
          //       content: data.site.siteMetadata.baseUrl
          //     },
          //     {
          //       name: `twitter:image`,
          //       content: `${data.site.siteMetadata.baseUrl}${metaImage}`
          //     }
          //   ]
          //     .concat(
          //       keywords.length > 0
          //         ? {
          //             name: `keywords`,
          //             content: keywords.join(`, `)
          //           }
          //         : []
          //     )
          //     .concat(meta)}
          // >
          //   <meta charSet="utf-8" />
          //   <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
          //   <meta
          //     name="viewport"
          //     content="width=device-width, initial-scale=1.0"
          //   />
          // </Helmet>
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
