import '../scss/style.scss';

import { StaticQuery, graphql } from 'gatsby';

import Header from './header';
import PropTypes from 'prop-types';
import React from 'react';

const Layout = ({ children, footer = true }) => (
  <StaticQuery
    query={graphql`
      query SiteTitleQuery {
        site {
          siteMetadata {
            title
          }
        }
      }
    `}
    render={data => (
      <div className="body-wrap boxed-container">
        <Header />

        {children}
        {footer ? (
          <footer className="site-footer text-light">
            <div className="container">
              <div className="site-footer-inner">
                <div className="brand footer-brand">
                  <a href="#">
                    <svg width="32" height="32" viewBox="0 0 32 32">
                      <title>Ava</title>
                      <defs>
                        <path
                          d="M32 16H16v16H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h28a2 2 0 0 1 2 2v14z"
                          id="logo-gradient-footer-a"
                        />
                        <linearGradient
                          x1="50%"
                          y1="50%"
                          y2="100%"
                          id="logo-gradient-footer-b"
                        >
                          <stop stopColor="#FFF" stopOpacity="0" offset="0%" />
                          <stop stopColor="#FFF" offset="100%" />
                        </linearGradient>
                      </defs>
                      <g fill="none" fillRule="evenodd">
                        <mask id="logo-gradient-footer-c" fill="#fff">
                          <use
                            dangerouslySetInnerHTML={{
                              __html: 'xlink:href="#logo-gradient-footer-a"'
                            }}
                          />
                        </mask>
                        <use
                          fillOpacity=".32"
                          fill="#FFF"
                          dangerouslySetInnerHTML={{
                            __html: 'xlink:href="#logo-gradient-footer-a"'
                          }}
                        />
                        <path
                          fill="url(#logo-gradient-footer-b)"
                          mask="url(#logo-gradient-footer-c)"
                          d="M-16-16h32v32h-32z"
                        />
                      </g>
                    </svg>
                  </a>
                </div>
                <div className="footer-copyright">
                  &copy; 2018 Ava, all rights reserved
                </div>
              </div>
            </div>
          </footer>
        ) : null}
      </div>
    )}
  />
);

Layout.propTypes = {
  children: PropTypes.node.isRequired
};

export default Layout;
