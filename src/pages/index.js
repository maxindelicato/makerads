import React, { useState, useEffect } from 'react';
import { Link, StaticQuery, graphql } from 'gatsby';

import Leaderboard from '../components/leaderboard';
import Layout from '../components/layout';
import SEO from '../components/seo';
import InfoModal from '../components/info-modal';

const IndexPage = () => {
  const [isFormShown, toggleForm] = useState(false);
  const [currentQ, setQ] = useState(1);
  const [answers, setAnswers] = useState({});
  useEffect(
    () => {
      console.log(answers);
    },
    [Object.keys(answers).length]
  );
  return (
    <Layout>
      <SEO />
      <StaticQuery
        query={graphql`
          query SiteUrlQuery {
            site {
              siteMetadata {
                baseUrl
              }
            }
          }
        `}
        render={data => {
          const { baseUrl } = data.site.siteMetadata;
          const url = `${baseUrl}/ad`;
          return (
            <main>
              <section className="hero text-center">
                <div className="container-sm">
                  <div className="hero-inner">
                    <h1 className="hero-title h2-mobile mt-0 is-revealing">
                      Unobtrusive adverts for makers
                    </h1>
                    <p className="hero-paragraph is-revealing">
                      Together we can reach more users.
                    </p>
                    <div className="hero-form newsletter-form field field-grouped is-revealing">
                      <a
                        className="create-btn button button-primary button-block button-shadow"
                        href="https://airtable.com/shrX05grZpNBQTzuO"
                      >
                        Submit your product
                      </a>

                      <span className="submission-text">
                        <span>Free for makers.</span>
                        <span>All submissions are manually verified.</span>
                      </span>
                    </div>
                    <div className="hero-browser">
                      <div className="bubble-3 is-revealing">
                        <svg width="427" height="286" viewBox="0 0 427 286">
                          <defs>
                            <path
                              d="M213.5 286C331.413 286 427 190.413 427 72.5S304.221 16.45 186.309 16.45C68.396 16.45 0-45.414 0 72.5S95.587 286 213.5 286z"
                              id="bubble-3-a"
                            />
                          </defs>
                          <g fill="none" fillRule="evenodd">
                            <mask id="bubble-3-b" fill="#fff">
                              <use
                                dangerouslySetInnerHTML={{
                                  __html: 'xlink:href="#bubble-3-a"'
                                }}
                              />
                            </mask>
                            <use
                              fill="#4E8FF8"
                              dangerouslySetInnerHTML={{
                                __html: 'xlink:href="#bubble-3-a"'
                              }}
                            />
                            <path
                              d="M64.5 129.77c117.913 0 213.5-95.588 213.5-213.5 0-117.914-122.779-56.052-240.691-56.052C-80.604-139.782-149-201.644-149-83.73c0 117.913 95.587 213.5 213.5 213.5z"
                              fill="#1274ED"
                              mask="url(#bubble-3-b)"
                            />
                            <path
                              d="M381.5 501.77c117.913 0 213.5-95.588 213.5-213.5 0-117.914-122.779-56.052-240.691-56.052C236.396 232.218 168 170.356 168 288.27c0 117.913 95.587 213.5 213.5 213.5z"
                              fill="#75ABF3"
                              mask="url(#bubble-3-b)"
                            />
                          </g>
                        </svg>
                      </div>
                      <div className="bubble-4 is-revealing">
                        <svg width="230" height="235" viewBox="0 0 230 235">
                          <defs>
                            <path
                              d="M196.605 234.11C256.252 234.11 216 167.646 216 108 216 48.353 167.647 0 108 0S0 48.353 0 108s136.959 126.11 196.605 126.11z"
                              id="bubble-4-a"
                            />
                          </defs>
                          <g fill="none" fillRule="evenodd">
                            <mask id="bubble-4-b" fill="#fff">
                              <use
                                dangerouslySetInnerHTML={{
                                  __html: 'xlink:href="#bubble-4-a"'
                                }}
                              />
                            </mask>
                            <use
                              fill="#7CE8DD"
                              dangerouslySetInnerHTML={{
                                __html: 'xlink:href="#bubble-4-a"'
                              }}
                            />
                            <circle
                              fill="#3BDDCC"
                              mask="url(#bubble-4-b)"
                              cx="30"
                              cy="108"
                              r="108"
                            />
                            <circle
                              fill="#B1F1EA"
                              opacity=".7"
                              mask="url(#bubble-4-b)"
                              cx="265"
                              cy="88"
                              r="108"
                            />
                          </g>
                        </svg>
                      </div>
                      <div className="makerverts">
                        <div className="makerad-box">
                          <iframe
                            style={{ border: 0, width: 320, height: 144 }}
                            src={url}
                          />
                        </div>
                        <div className="makerad-box">
                          <iframe
                            style={{ border: 0, width: 320, height: 144 }}
                            src={url}
                          />
                        </div>
                        <div className="makerad-box">
                          <iframe
                            style={{ border: 0, width: 320, height: 144 }}
                            src={url}
                          />
                        </div>
                        <div className="makerad-box">
                          <iframe
                            style={{ border: 0, width: 320, height: 144 }}
                            src={url}
                          />
                        </div>
                      </div>
                      <div className="refresh-text">
                        Refresh to see more ads!
                      </div>

                      <div className="bubble-1 is-revealing">
                        <svg width="61" height="52" viewBox="0 0 61 52">
                          <defs>
                            <path
                              d="M32 43.992c17.673 0 28.05 17.673 28.05 0S49.674 0 32 0C14.327 0 0 14.327 0 32c0 17.673 14.327 11.992 32 11.992z"
                              id="bubble-1-a"
                            />
                          </defs>
                          <g fill="none" fillRule="evenodd">
                            <mask id="bubble-1-b" fill="#fff">
                              <use
                                dangerouslySetInnerHTML={{
                                  __html: 'xlink:href="#bubble-1-a"'
                                }}
                              />
                            </mask>
                            <use
                              fill="#FF6D8B"
                              dangerouslySetInnerHTML={{
                                __html: 'xlink:href="#bubble-1-a"'
                              }}
                            />
                            <path
                              d="M2 43.992c17.673 0 28.05 17.673 28.05 0S19.674 0 2 0c-17.673 0-32 14.327-32 32 0 17.673 14.327 11.992 32 11.992z"
                              fill="#FF4F73"
                              mask="url(#bubble-1-b)"
                            />
                            <path
                              d="M74 30.992c17.673 0 28.05 17.673 28.05 0S91.674-13 74-13C56.327-13 42 1.327 42 19c0 17.673 14.327 11.992 32 11.992z"
                              fillOpacity=".8"
                              fill="#FFA3B5"
                              mask="url(#bubble-1-b)"
                            />
                          </g>
                        </svg>
                      </div>
                      <div className="bubble-2 is-revealing">
                        <svg width="179" height="126" viewBox="0 0 179 126">
                          <defs>
                            <path
                              d="M104.697 125.661c41.034 0 74.298-33.264 74.298-74.298s-43.231-7.425-84.265-7.425S0-28.44 0 12.593c0 41.034 63.663 113.068 104.697 113.068z"
                              id="bubble-2-a"
                            />
                          </defs>
                          <g fill="none" fillRule="evenodd">
                            <mask id="bubble-2-b" fill="#fff">
                              <use
                                dangerouslySetInnerHTML={{
                                  __html: 'xlink:href="#bubble-2-a"'
                                }}
                              />
                            </mask>
                            <use
                              fill="#838DEA"
                              dangerouslySetInnerHTML={{
                                __html: 'xlink:href="#bubble-2-a"'
                              }}
                            />
                            <path
                              d="M202.697 211.661c41.034 0 74.298-33.264 74.298-74.298s-43.231-7.425-84.265-7.425S98 57.56 98 98.593c0 41.034 63.663 113.068 104.697 113.068z"
                              fill="#626CD5"
                              mask="url(#bubble-2-b)"
                            />
                            <path
                              d="M43.697 56.661c41.034 0 74.298-33.264 74.298-74.298s-43.231-7.425-84.265-7.425S-61-97.44-61-56.407C-61-15.373 2.663 56.661 43.697 56.661z"
                              fill="#B1B6F1"
                              opacity=".64"
                              mask="url(#bubble-2-b)"
                            />
                          </g>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <Leaderboard />
              <section className="newsletter section support" id="embed">
                <div className="container-sm">
                  <div className="newsletter-inner section-inner">
                    <div className="newsletter-header text-center is-revealing">
                      <h2 className="section-title mt-0">
                        Support the maker movement, become a referrer!
                      </h2>
                      <p className="section-paragraph">
                        Embed the following script on your website, and a random
                        maker ad will be displayed to each of your visitors!
                      </p>
                      <pre>
                        {`<iframe
  style="border:0;width:320px;height:144px;"
  src="${url}"
></iframe>`}
                      </pre>
                      <p className="section-paragraph">
                        You will also be able to take part in our revenue share
                        system, based on the number of referrals that you
                        provide.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="newsletter section market" id="embed">
                <div className="container-sm">
                  <div className="newsletter-inner section-inner">
                    <div className="newsletter-header text-center is-revealing">
                      <h2 className="section-title mt-0">
                        Market your product to thousands of developers,
                        designers, and freelancers
                      </h2>
                      <p className="section-paragraph">
                        We offer sponsored ad spots to products looking to
                        specifically target the maker community.
                      </p>
                      <div className="contact-us-container">
                        <a
                          className="create-btn button button-primary button-block button-shadow"
                          href="https://airtable.com/shrTNgZVRwEukgkU3"
                        >
                          Contact Us
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              <section>
                <div className="container-sm faq">
                  <div className="newsletter-inner section-inner">
                    <div className="newsletter-header is-revealing">
                      <h2 className="section-title mt-0">FAQ</h2>
                      <h3>What type of ads get approved?</h3>
                      <p>
                        Any indie maker can publish an ad to the network{' '}
                        <strong>for free</strong>. If you are submitting your
                        own design then try to keep it simple and unobtrusive,
                        gifs are allowed, within reason.{' '}
                        <a href="https://twitter.com/realmakerads">
                          Contact us
                        </a>{' '}
                        on Twitter if you would like help or advice with your
                        ad.
                      </p>
                      <p>
                        We only accept ads from larger companies in the form of
                        sponsored spots. This allows your ad to be shown more
                        freqently for a set period of time.{' '}
                        <a href="https://airtable.com/shrTNgZVRwEukgkU3">
                          Contact us
                        </a>{' '}
                        for more information.
                      </p>
                      <p className="section-paragraph" />
                      <h3>What type of companies do you work with?</h3>
                      <p className="section-paragraph">
                        We want to work with great companies that are interested
                        in supporting the maker community.
                      </p>
                      <h3>How does the revenue sharing program work?</h3>
                      <p>
                        90% of all revenue that we take each month from
                        sponsored ads is distributed to our referrers based on
                        the number of referrals they provide.
                      </p>
                      <p>The remaining 10% is used to maintain MakerAds.</p>
                      <h3>Do you have an "ethical advertising" policy?</h3>
                      <p className="section-paragraph">
                        Of course. We host all ad images, and don't use any
                        third party tracking scripts. We don't track you or sell
                        your information. All our stats are public, and even our
                        ad code is{' '}
                        <a href="https://github.com/squarecat/makerads">
                          open source
                        </a>
                        .
                      </p>
                      <p>
                        Our ads try to conform to the Adblock{' '}
                        <a href="https://acceptableads.com/">
                          Acceptable Ads Manifesto
                        </a>
                        .
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </main>
          );
        }}
      />
    </Layout>
  );
};

export default IndexPage;
