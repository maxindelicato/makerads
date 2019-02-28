import 'isomorphic-fetch';

import React from 'react';
import { useAsync } from 'react-use';

function fetchLeaderboard() {
  return fetch('/api/referrers')
    .then(d => d.json())
    .catch(e => console.error(e));
}

export default () => {
  const { error, loading, value } = useAsync(fetchLeaderboard);
  return (
    <div className="leaderboard" id="leaderboard">
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
          <tbody>
            {value.map(ref => (
              <tr key={ref.referrer}>
                <td className="referrer">
                  <a href={`https://${ref.referrer}`}>{ref.referrer}</a>
                </td>
                <td className="impressions">{`${ref.impressions}`}</td>
                <td className="clicks">{`${ref.clicks || 0}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      <p>
        All of our referrers take part in our revenue share system, through
        which we distribute 90% of our earnings from sponsored ads.
      </p>
      <p>
        Check out more stats <a href="/stats">here</a>
      </p>
    </div>
  );
};
