import React, { useState, useEffect } from 'react';
import { Link, StaticQuery, graphql } from 'gatsby';

import Leaderboard from '../components/leaderboard';
import Layout from '../components/layout';
import SEO from '../components/seo';
import InfoModal from '../components/info-modal';

const fetchStats = () => {
  return fetch('/api/stats')
    .then(res => res.json())
    .catch(err => console.error(err));
};

export default () => {
  return (
    <Layout>
      <SEO />
      <div className="stats">
        <div className="stats-header">
          <div className="header-title">
            To help our sponsors make an informed choice, all of our metrics are
            public.
          </div>
          <div className="ad-select">
            <input name="ad-url" />
          </div>
        </div>
      </div>
    </Layout>
  );
};
