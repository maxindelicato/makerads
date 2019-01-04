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
      <div className="stats" />
    </Layout>
  );
};
