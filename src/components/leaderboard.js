import React from 'react';
import { useAsync } from 'react-use';
import 'isomorphic-fetch';

function fetchLeaderboard() {
  return fetch('/api/referrers')
    .then(d => d.json())
    .catch(e => console.error(e));
}

export default () => {
  const { error, loading, value } = useAsync(fetchLeaderboard);
  return (
    <div className="leaderboard">
      <h2>Top Referrers</h2>
      <p>Get referrals from the biggest names in the community.</p>
      {value ? (
        <table className="leaderboard-list">
          <thead>
            <tr>
              <th />
              <th>Impressions</th>
              <th>Clicks</th>
            </tr>
          </thead>
          {value.map(ref => (
            <tr key={ref.referrer}>
              <td className="referrer">
                <a href={ref.referrer}>{ref.referrer}</a>
              </td>
              <td className="impressions">{`${ref.impressions}`}</td>
              <td className="clicks">{`${ref.clicks || 0}`}</td>
            </tr>
          ))}
        </table>
      ) : null}
    </div>
  );
};
