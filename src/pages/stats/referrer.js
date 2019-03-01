import './stats.css';

import { Link, StaticQuery, graphql } from 'gatsby';
import React, { useEffect, useRef, useState } from 'react';

import Chart from 'chart.js';
import InfoModal from '../../components/info-modal';
import Layout from '../../components/layout';
import Leaderboard from '../../components/leaderboard';
import SEO from '../../components/seo';
import isAfter from 'date-fns/is_after';
import startOfDay from 'date-fns/start_of_day';
import startOfMonth from 'date-fns/start_of_month';
import { useAsync } from 'react-use';

const fetchStatsForReferrer = id => {
  return fetch(`/api/stats/referrer?id=${id}`)
    .then(res => res.json())
    .catch(err => console.error(err));
};

const lineColor = '#EB6C69';
const lineColor2 = 'rgb(158, 87, 174)';

function chart(ctx, stats) {
  if (!stats) return null;

  new Chart(ctx, {
    data: {
      datasets: [
        {
          label: 'Impressions',
          fill: true,
          backgroundColor: 'rgba(246,246,246,0.3)',
          borderColor: 'rgba(255,255,255,0.6)',
          data: stats.map(d => ({
            x: startOfDay(d.timestamp),
            y: d.impressions
          }))
        },
        {
          label: 'Clicks',
          fill: true,
          backgroundColor: 'rgba(46,131,239,0.5)',
          borderColor: 'rgba(46,131,239,0.8)',
          data: stats.map(d => ({
            x: startOfDay(d.timestamp),
            y: d.clicks
          }))
        }
      ]
    },
    type: 'line',
    options: {
      legend: {
        display: false
      },
      maintainAspectRatio: false,
      scales: {
        xAxes: [
          {
            type: 'time',
            time: {
              unit: 'day'
            },
            ticks: {
              fontColor: 'rgba(246,246,246,0.5)'
            },
            gridLines: {
              color: 'rgba(246,246,246,0.2)'
            }
          }
        ],
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
              precision: 0,
              fontColor: 'rgba(246,246,246,0.5)'
            },
            gridLines: {
              color: 'rgba(246,246,246,0.2)'
            }
          }
        ]
      },
      responsive: true
    }
  });
}

export default route => {
  const { search } = route.location;
  const [referrer, setReferrer] = useState(null);
  const [loading, setLoading] = useState(true);
  let id;
  if (typeof window !== 'undefined') {
    id = new URLSearchParams(search).get('id');
  }
  useEffect(() => {
    fetchStatsForReferrer(id)
      .then(a => {
        if (a) {
          setReferrer(a);
        }
      })
      .then(() => setLoading(false), () => setLoading(false));
  }, []);

  return (
    <Layout footer={false} title="Referrer Stats">
      <SEO />
      <main>
        <div className="stats">
          <div className="stats-header">
            <div className="header-title">
              <p>
                To help our sponsors make an informed choice, all of our metrics
                are public.
              </p>
              <p>
                <Link to="/stats/referrers">Back to referrer list</Link>
              </p>
            </div>
          </div>
          <>
            {loading ? (
              <div className="stats-loading">Loading referrer stats...</div>
            ) : null}
            <Content loading={loading} referrer={referrer} />
          </>
        </div>
      </main>
    </Layout>
  );
};

function Content({ referrer, loading }) {
  if (loading) return null;
  if (!referrer)
    return <div className="stats-loading">{`No referrer found`}</div>;

  const chartRef = useRef(null);
  const { history } = referrer;

  useEffect(() => {
    if (chartRef.current) {
      chart(chartRef.current.getContext('2d'), referrer.history);
    }
  }, [referrer, chartRef]);

  const today = new Date();
  const thisPeriod = subDays(today, 30);
  const { monthlyClicks, monthlyImpressions, monthlyEarnings } = history.reduce(
    (out, day) => {
      if (isAfter(new Date(day.timestamp), thisPeriod)) {
        return {
          monthlyClicks: out.monthlyClicks + day.clicks,
          monthlyImpressions: out.monthlyImpressions + day.impressions,
          monthlyEarnings:
            out.monthlyEarnings + (isNaN(day.earnings) ? 0 : day.earnings)
        };
      }
      return out;
    },
    { monthlyClicks: 0, monthlyImpressions: 0, monthlyEarnings: 0 }
  );

  const ctr = (monthlyClicks / monthlyImpressions) * 100;
  return (
    <div className="stats-content" style={{ padding: '180px 0 0 0' }}>
      <div className="stats-stats">
        <h3 className="stats-url">
          <a href={`https://${referrer.referrer}?ref=makerads`}>
            {referrer.referrer}
          </a>
        </h3>
        <div className="chart-container">
          <h4 className="chart-title">
            <span
              style={{ color: '#d5d5d6', textShadow: '1px 1px 1px #0000004a' }}
            >
              Impressions
            </span>{' '}
            vs{' '}
            <span
              style={{
                color: 'rgb(52, 129, 226)',
                textShadow: '1px 1px 1px rgb(143, 174, 213)'
              }}
            >
              Clicks
            </span>
          </h4>
          <div className="chart">
            <canvas ref={chartRef} />
          </div>
        </div>
        <div className="stats-metrics">
          {/* <div className="metric">
            <span className="metric-label">Monthly Ranking</span>
            <span className="metric-figure">#1</span>
          </div> */}
          <div className="metric">
            <span className="metric-label">Monthly CTR</span>
            <span className="metric-figure">{`${ctr.toFixed(2)}%`}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Monthly Impressions</span>
            <span className="metric-figure">{monthlyImpressions}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Monthly Clicks</span>
            <span className="metric-figure">{monthlyClicks}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Monthly earnings</span>
            <span className="metric-figure">{`$${(
              monthlyEarnings / 100
            ).toFixed(2)}`}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
