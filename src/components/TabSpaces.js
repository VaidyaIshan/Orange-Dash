import React, { useEffect, useState } from "react";
import "./css/TabSpaces.css";
import { loadState, saveState } from "../utils/storage";

const STORAGE_KEY = "orangedash_tabspaces";

const DEFAULT_SPACES = [
  {
    id: "work",
    name: "Work",
    urls: ["https://mail.google.com/", "https://slack.com/", "https://meet.google.com/"],
  },
];

function normalizeUrl(url) {
  if (!/^https?:\/\//i.test(url)) return `https://${url}`;
  return url;
}

function openUrl(url) {
  if (typeof chrome !== "undefined" && chrome.tabs?.create) {
    chrome.tabs.create({ url });
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

function TabSpaces({ visible, onClose }) {
  const [spaces, setSpaces] = useState(DEFAULT_SPACES);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState({ name: "", urlsText: "" });

  useEffect(() => {
    loadState(STORAGE_KEY, null).then((saved) => {
      setSpaces(saved || DEFAULT_SPACES);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) saveState(STORAGE_KEY, spaces);
  }, [spaces, loaded]);

  const openSpace = (space) => {
    space.urls.forEach(openUrl);
  };

  const removeSpace = (id) => {
    setSpaces((prev) => prev.filter((s) => s.id !== id));
  };

  const addSpace = (e) => {
    e.preventDefault();
    const name = form.name.trim();
    const urls = form.urlsText
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean)
      .map(normalizeUrl);
    if (!name || urls.length === 0) return;
    setSpaces((prev) => [...prev, { id: `space-${Date.now()}`, name, urls }]);
    setForm({ name: "", urlsText: "" });
  };

  return (
    <div className={`od-panel tabspaces-panel ${visible ? "active" : ""}`}>
      <div className="od-panel-header">
        <h2>Tab Spaces</h2>
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>
      </div>

      <p className="tabspaces-hint">Open a whole group of tabs in one click.</p>

      <ul className="tabspaces-list">
        {spaces.map((space) => (
          <li key={space.id} className="tabspaces-item">
            <div className="tabspaces-item-main">
              <div className="tabspaces-item-name">{space.name}</div>
              <div className="tabspaces-item-count">{space.urls.length} tabs</div>
            </div>
            <div className="tabspaces-item-actions">
              <button className="pill-btn" onClick={() => openSpace(space)}>
                Open all
              </button>
              <button
                className="tabspaces-delete"
                onClick={() => removeSpace(space.id)}
                aria-label={`Delete ${space.name}`}
              >
                ✖
              </button>
            </div>
          </li>
        ))}
        {spaces.length === 0 && <li className="tabspaces-empty">No spaces yet.</li>}
      </ul>

      <form className="tabspaces-form" onSubmit={addSpace}>
        <input
          type="text"
          placeholder="Space name (e.g. Work)"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <textarea
          placeholder={"One URL per line\nmail.google.com\nslack.com"}
          value={form.urlsText}
          onChange={(e) => setForm((f) => ({ ...f, urlsText: e.target.value }))}
        />
        <button type="submit" className="pill-btn">Add space</button>
      </form>
    </div>
  );
}

export default TabSpaces;
