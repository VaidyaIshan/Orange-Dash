import React, { useEffect, useState } from 'react';
import './css/ScreenTime.css';

function ScreenTime({ onClose, className }) {
  const [data, setData] = useState({});

  useEffect(() => {
    // Fetch screen time data from Chrome's local storage
    chrome.storage.local.get(null, (result) => {
      setData(result);
    });
  }, []);

  return (
    <div className={`screen-time-window ${className}`}>
      <div className="screen-time-header">
        <h2>Screen Time Usage</h2>
        <button className="close-btn" onClick={onClose}>✖</button>
      </div>
      <ul className="screen-time-list">
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