import React, { useEffect, useState } from "react";
import "./css/ScreenTime.css";

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

function ScreenTime({ onClose, className }) {
  const [data, setData] = useState({});

  const refresh = () => {
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.get(null, (result) => setData(result));
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const sites = Object.keys(data)
    .filter((site) => site !== "lastReset" && typeof data[site] === "number")
    .map((site) => ({ site, seconds: data[site] }))
    .sort((a, b) => b.seconds - a.seconds);

  const totalSeconds = sites.reduce((sum, s) => sum + s.seconds, 0);
  const maxSeconds = sites.length ? sites[0].seconds : 0;

  const resetData = () => {
    if (!window.confirm("Clear all tracked screen time data?")) return;
    if (typeof chrome !== "undefined" && chrome.storage) {
      const keys = sites.map((s) => s.site);
      chrome.storage.local.remove(keys, refresh);
    }
  };

  return (
    <div className={`od-panel screen-time-window ${className}`}>
      <div className="od-panel-header">
        <h2>Screen Time</h2>
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>
      </div>

      <div className="screen-time-total">
        <span className="screen-time-total-value">{formatDuration(totalSeconds)}</span>
        <span className="screen-time-total-label">tracked today</span>
      </div>

      <ul className="screen-time-list">
        {sites.map(({ site, seconds }) => (
          <li key={site} className="screen-time-item">
            <img
              className="screen-time-favicon"
              src={`https://www.google.com/s2/favicons?sz=32&domain=${site}`}
              alt=""
            />
            <div className="screen-time-item-main">
              <div className="screen-time-item-row">
                <span className="screen-time-site">{site}</span>
                <span className="screen-time-duration">{formatDuration(seconds)}</span>
              </div>
              <div className="screen-time-bar-track">
                <div
                  className="screen-time-bar-fill"
                  style={{ width: `${maxSeconds ? (seconds / maxSeconds) * 100 : 0}%` }}
                />
              </div>
            </div>
          </li>
        ))}
        {sites.length === 0 && <li className="screen-time-empty">No activity tracked yet.</li>}
      </ul>

      {sites.length > 0 && (
        <button className="ghost-btn screen-time-reset" onClick={resetData}>
          Reset data
        </button>
      )}
    </div>
  );
}

export default ScreenTime;
