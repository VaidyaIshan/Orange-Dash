// components/ScreenTime.js
import React, { useEffect, useState } from 'react';
import './css/ScreenTime.css';

function ScreenTime() {
  const [data, setData] = useState({});

  useEffect(() => {
    // Fetch screen time data from Chrome's local storage
    chrome.storage.local.get(null, (result) => {
      setData(result);
    });
  }, []);

  return (
    <div className="screen-time-container">
      <h2>Screen Time Usage</h2>
      <ul>
        {Object.keys(data).map((site) => (
          site !== 'lastReset' && (
            <li key={site}>
              {site}: {Math.floor(data[site] / 60)} mins
            </li>
          )
        ))}
      </ul>
    </div>
  );
}

export default ScreenTime;