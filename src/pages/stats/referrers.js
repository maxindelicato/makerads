import './stats.css';

import React, { useEffect, useRef, useState } from 'react';

import Chart from 'chart.js';
import InfoModal from '../../components/info-modal';
import Layout from '../../components/layout';
import Leaderboard from '../../components/leaderboard';
import { Link } from 'gatsby';
import SEO from '../../components/seo';
import isAfter from 'date-fns/is_after';
import numeral from 'numeral';
import startOfDay from 'date-fns/start_of_day';
import startOfMonth from 'date-fns/start_of_month';
import { useAsync } from 'react-use';

const fetchStatsForReferrers = () => {
  return fetch(`/api/stats/referrers`)
    .then(res => res.json())
    .catch(err => console.error(err));
};

const lineColor = '#EB6C69';
const lineColor2 = 'rgb(158, 87, 174)';

export default route => {
  const { search } = route.location;
  const [referrers, setReferrers] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchStatsForReferrers()
      .then(a => {
        if (a) {
          setReferrers(a);
        }
      })
      .then(() => setLoading(false), () => setLoading(false));
  }, []);

  return (
    <Layout footer={false} title="Referrers Stats">
      {/* <SEO /> */}
      <main>
        <div className="stats">
          <div className="stats-header">
            <div className="header-title">
              <p>
                To help our sponsors make an informed choice, all of our metrics
                are public.
              </p>
              <p>
                <Link to="/stats">Back to stats</Link>
              </p>
            </div>
          </div>
          <>
            {loading ? (
              <div className="stats-loading">Loading referrer stats...</div>
            ) : null}
            <Content loading={loading} referrers={referrers} />
          </>
        </div>
      </main>
    </Layout>
  );
};

function Content({ referrers, loading }) {
  if (loading) return null;
  if (!referrers)
    return <div className="stats-loading">{`No referrers found`}</div>;
  let totalEarnings = 0;
  return (
    <div className="stats-content" style={{ padding: '200px 0 0 0' }}>
      <div className="stats-stats">
        <div className="stats-wrapper">
          <div className="referrers-list">
            <table>
              <thead>
                <th>Referrer</th>
                <th>Impressions</th>
                <th>Clicks</th>
                <th>Earnings</th>
              </thead>
              <tbody>
                {referrers
                  .map(r => {
                    return {
                      ...r,
                      earnings: (r.history || [])
                        .map(d => (isNaN(d.earnings) ? 0 : d.earnings))
                        .reduce((t, d) => d + t, 0)
                    };
                  })
                  .sort((a, b) => b.earnings - a.earnings)
                  .map(r => {
                    const { earnings } = r;
                    totalEarnings = totalEarnings + earnings;
                    return (
                      <tr>
                        <td>
                          <Link to={`/stats/referrer?id=${r._id}`}>
                            {r.referrer}
                          </Link>
                        </td>
                        <td>{r.impressions}</td>
                        <td>{r.clicks || 0}</td>
                        <td>{`$${numeral(earnings / 100).format('0.00')}`}</td>
                      </tr>
                    );
                  })}
              </tbody>
              <tfoot>
                <tr>
                  <td />
                  <td />
                  <td />
                  <td>{`$${numeral(totalEarnings / 100).format('0.00')}`}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
