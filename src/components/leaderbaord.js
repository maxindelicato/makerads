import React from 'react';
import { useAsync } from 'react-use';
import 'isomorphic-fetch';

function fetchLeaderboard() {
  return fetch('/referrers')
    .then(d => d.json())
    .catch(e => console.error(e));
}

export default () => {
  const { error, loading, value } = useAsync(fetchLeaderboard);
  return (
    <div className="leaderboard">
      <ul />
    </div>
  );
};
