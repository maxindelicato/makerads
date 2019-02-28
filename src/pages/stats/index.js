import './stats.css';

import { Link, StaticQuery, graphql } from 'gatsby';
import React, { useEffect, useRef, useState } from 'react';

import Chart from 'chart.js';
import InfoModal from '../../components/info-modal';
import Layout from '../../components/layout';
import Leaderboard from '../../components/leaderboard';
import SEO from '../../components/seo';
import format from 'date-fns/format';
import isAfter from 'date-fns/is_after';
import numeral from 'numeral';
import startOfDay from 'date-fns/start_of_day';
import subDays from 'date-fns/sub_days';
import { useAsync } from 'react-use';

const fetchStats = url => {
  return fetch(`/api/stats`)
    .then(res => res.json())
    .catch(err => console.error(err));
};

const fetchAds = () => {
  return fetch(`/api/stats/ads`)
    .then(res => res.json())
    .catch(err => console.error(err));
};

const lineColor = '#EB6C69';
const lineColor2 = 'rgb(158, 87, 174)';

function chart(ctx, stats) {
  if (!stats) return null;

  const maxClicks = stats.reduce((m, s) => (s.clicks > m ? s.clicks : m), 0);
  const maxImpressions = stats.reduce(
    (m, s) => (s.impressions > m ? s.impressions : m),
    0
  );

  new Chart(ctx, {
    data: {
      datasets: [
        {
          label: 'Impressions',
          fill: true,
          yAxisID: 'yA',
          // backgroundColor: 'rgba(246,246,246,0.3)',
          borderColor: 'rgba(255,255,255,0.6)',
          data: stats.map(d => ({
            x: startOfDay(d.timestamp),
            y: d.impressions
          }))
        },
        {
          label: 'Clicks',
          fill: true,
          yAxisID: 'yB',
          backgroundColor: 'rgba(46,131,239,0.2)',
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
            id: 'yA',
            ticks: {
              beginAtZero: true,
              precision: maxImpressions > 5000 ? 1000 : 500,
              stepSize: maxImpressions > 5000 ? 1000 : 500,
              fontColor: 'rgba(246,246,246,0.5)',
              maxTicksLimit: 8
            },
            gridLines: {
              color: 'rgba(246,246,246,0.2)'
            }
          },
          {
            id: 'yB',
            type: 'linear',
            position: 'right',
            gridLines: false,
            ticks: {
              beginAtZero: true,
              max: maxClicks * 3,
              stepSize: (maxClicks * 3) / 6,
              min: 0,
              fontColor: 'rgb(52, 129, 226)'
            }
          }
        ]
      },
      responsive: true
    }
  });
}

export default route => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchStats()
      .then(a => {
        if (a) {
          setStats(a);
        }
      })
      .then(() => setLoading(false), () => setLoading(false));
  }, []);

  return (
    <Layout footer={false} title="Ad Stats">
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
                All stats are calculated from the last 30 days of network
                activity.
              </p>
              <p>
                Are you a referrer? Check out your stats and earnings{' '}
                <Link to="/stats/referrers">here</Link>
              </p>
            </div>
          </div>
          <>
            {loading ? (
              <div className="stats-loading">Loading global stats...</div>
            ) : null}

            <Content loading={loading} stats={stats} />
          </>
        </div>
      </main>
    </Layout>
  );
};

function Content({ stats, loading }) {
  if (loading) return null;
  if (!stats) {
    return <div className="stats-loading">Problem fetching stats</div>;
  }
  const chartRef = useRef(null);
  const sponsoredChartRef = useRef(null);

  const {
    history,
    adQuantity,
    sponsorQuantity,
    totalSponsoredClicks,
    totalSponsoredImpressions,
    sponsoredHistory,
    ads
  } = stats;
  useEffect(() => {
    if (chartRef.current) {
      chart(
        chartRef.current.getContext('2d'),
        history.reduce(
          (out, h) =>
            isAfter(new Date(h.timestamp), thisPeriod) ? [...out, h] : out,
          []
        )
      );
    }
    if (sponsoredChartRef.current) {
      chart(
        sponsoredChartRef.current.getContext('2d'),
        sponsoredHistory.reduce(
          (out, h) =>
            isAfter(new Date(h.timestamp), thisPeriod) ? [...out, h] : out,
          []
        )
      );
    }
  }, [stats, chartRef, sponsoredChartRef]);

  const today = new Date();
  const thisPeriod = subDays(today, 30);
  const displayPeriod = `${format(thisPeriod, 'Do MMM')} - ${format(
    today,
    'Do MMM'
  )}`;
  const { monthlyClicks, monthlyImpressions } = history.reduce(
    (out, day) => {
      if (isAfter(new Date(day.timestamp), thisPeriod)) {
        return {
          monthlyClicks: out.monthlyClicks + day.clicks,
          monthlyImpressions: out.monthlyImpressions + day.impressions
        };
      }
      return out;
    },
    { monthlyClicks: 0, monthlyImpressions: 0 }
  );

  const ctr =
    monthlyClicks > 0 ? (monthlyClicks / monthlyImpressions) * 100 : 0;
  const sctr =
    totalSponsoredClicks > 0
      ? (totalSponsoredClicks / totalSponsoredImpressions) * 100
      : 0;

  const sponsoredAvgImpressions = sponsoredHistory.map(sh => {
    return sh.impressions / sh.sponsoredAds;
  });
  const sponsoredAvgImpression = sponsoredAvgImpressions.reduce(
    (sum, i) => i + sum
  );
  const sponsoredAvgClicks = sponsoredHistory.map(sh => {
    return sh.clicks / sh.sponsoredAds;
  });
  const sponsoredAvgClick = sponsoredAvgClicks.reduce((sum, i) => i + sum);

  return (
    <div className="stats-content" style={{ padding: '180px 0 0 0' }}>
      <div className="stats-stats">
        <div className="stats-wrapper">
          <div className="chart-container">
            <h4 className="chart-title">
              Total{' '}
              <span
                style={{
                  color: '#d5d5d6',
                  textShadow: '1px 1px 1px #0000004a'
                }}
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
              <span className="period-text">{displayPeriod}</span>
            </h4>
            <div className="chart">
              <canvas ref={chartRef} />
            </div>
          </div>
          <div className="stats-metrics">
            <div className="metric">
              <span className="metric-label">CTR</span>
              <span className="metric-figure">{`${ctr.toFixed(2)}%`}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Impressions</span>
              <span className="metric-figure">
                {formatNumber(monthlyImpressions)}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Clicks</span>
              <span className="metric-figure">
                {formatNumber(monthlyClicks)}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Ad Count</span>
              <span className="metric-figure">{adQuantity}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Avg. Impressions/Ad</span>
              <span className="metric-figure">
                {formatNumber(monthlyImpressions / adQuantity)}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Avg. Clicks/Ad</span>
              <span className="metric-figure">
                {formatNumber(monthlyClicks / adQuantity)}
              </span>
            </div>
          </div>
          <div className="chart-container">
            <h4 className="chart-title">
              Sponsored{' '}
              <span
                style={{
                  color: '#d5d5d6',
                  textShadow: '1px 1px 1px #0000004a'
                }}
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
              <span className="period-text">{displayPeriod}</span>
            </h4>
            <div className="chart">
              <canvas ref={sponsoredChartRef} />
            </div>
          </div>
          <div className="stats-metrics">
            <div className="metric">
              <span className="metric-label">Sponsored CTR</span>
              <span className="metric-figure">{`${sctr.toFixed(2)}%`}</span>
            </div>

            <div className="metric">
              <span className="metric-label">Impressions</span>
              <span className="metric-figure">
                {formatNumber(totalSponsoredImpressions)}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Clicks</span>
              <span className="metric-figure">
                {formatNumber(totalSponsoredClicks)}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Sponsor Count</span>
              <span className="metric-figure">{sponsorQuantity}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Avg. Impressions/Ad</span>
              <span className="metric-figure">
                {formatNumber(sponsoredAvgImpression)}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Avg. Clicks/Ad</span>
              <span className="metric-figure">
                {formatNumber(sponsoredAvgClick)}
              </span>
            </div>
            {/* <div className="metric">
            <span className="metric-label">Monthly Clicks</span>
            <span className="metric-figure">{monthlyClicks}</span>
          </div> */}
          </div>
          <h4 className="chart-title">Sponsored Ads</h4>
          <p>
            Sponsored ads show up on the network more frequently, and pay for
            running costs of the MakerAds service.{' '}
            <a href="https://airtable.com/shrX05grZpNBQTzuO">
              Get in touch with us
            </a>{' '}
            to apply for a sponsored spot.
          </p>
          <AdList ads={ads.filter(a => a.sponsored)} />

          <h4 className="chart-title">Maker Ads</h4>
          <p>
            Maker ads are submitted by indie makers for free, and show on the
            network evenly.{' '}
            <a href="https://airtable.com/shrX05grZpNBQTzuO">
              Submit yours today
            </a>
            !
          </p>
          <AdList ads={ads.filter(a => !a.sponsored)} />
        </div>
      </div>
    </div>
  );
}

const AdList = ({ ads }) => {
  const sortedAds = ads
    .map(a => ({
      ...a,
      ctr: a.clicks > 0 ? a.clicks / a.impressions : 0
    }))
    .sort((a, b) => b.ctr - a.ctr);
  return (
    <ul className="ad-list">
      {sortedAds.map(ad => {
        return (
          <li className="ad-list-item" key={ad._id}>
            <Link to={`/stats/ads/?id=${ad._id}`}>
              <img
                className="ad-image"
                src={`data:image/png;base64,${ad.image}`}
                alt="ad"
              />
              <div className="ad-info">
                <span>{`${(ad.ctr * 100).toFixed(2)}% CTR`}</span>
                <span>{ad.url.split('?')[0]}</span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

function formatNumber(num) {
  return num > 1000 ? numeral(num).format('0.0a') : numeral(num).format('0.0');
}
