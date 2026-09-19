import React, { useEffect, useState } from "react";
import "./css/TabSpaces.css";
import { loadState, saveState } from "../utils/storage";
import { faviconFor } from "../context/BookmarksContext";

const STORAGE_KEY = "orangedash_tabspaces";
const hasTabsApi = typeof chrome !== "undefined" && chrome.tabs?.query;

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

function emptyForm() {
  return { name: "", urlsText: "" };
}

function TabSpaces({ visible, onClose }) {
  const [spaces, setSpaces] = useState(DEFAULT_SPACES);
  const [loaded, setLoaded] = useState(false);
  const [editingId, setEditingId] = useState(null); // null | "new" | a space id
  const [form, setForm] = useState(emptyForm());
  const [openTabs, setOpenTabs] = useState([]);
  const [tabPickerOpen, setTabPickerOpen] = useState(false);

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

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm());
    setTabPickerOpen(false);
  };

  const removeSpace = (id) => {
    setSpaces((prev) => prev.filter((s) => s.id !== id));
    if (editingId === id) cancelEdit();
  };

  const startCreate = () => {
    setForm(emptyForm());
    setEditingId("new");
    setTabPickerOpen(false);
  };

  const startEdit = (space) => {
    setForm({ name: space.name, urlsText: space.urls.join("\n") });
    setEditingId(space.id);
    setTabPickerOpen(false);
  };

  const submitForm = (e) => {
    e.preventDefault();
    const name = form.name.trim();
    const urls = form.urlsText
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean)
      .map(normalizeUrl);
    if (!name || urls.length === 0) return;

    if (editingId === "new") {
      setSpaces((prev) => [...prev, { id: `space-${Date.now()}`, name, urls }]);
    } else {
      setSpaces((prev) => prev.map((s) => (s.id === editingId ? { ...s, name, urls } : s)));
    }
    cancelEdit();
  };

  const toggleTabPicker = () => {
    if (!tabPickerOpen && hasTabsApi) {
      chrome.tabs.query({ currentWindow: true }, (tabs) => {
        setOpenTabs(tabs.filter((t) => t.url && !/^(chrome|chrome-extension|about):/.test(t.url)));
      });
    }
    setTabPickerOpen((v) => !v);
  };

  const appendTabUrl = (tab) => {
    setForm((f) => {
      const lines = f.urlsText.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.includes(tab.url)) return f;
      return { ...f, urlsText: [...lines, tab.url].join("\n") };
    });
  };

  return (
    <div className={`od-panel tabspaces-panel ${visible ? "active" : ""}`}>
      <div className="od-panel-header">
        <h2>Tab Spaces</h2>
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>
      </div>

      {editingId === null ? (
        <>
          <p className="tabspaces-hint">Open a whole group of tabs in one click.</p>

          <ul className="tabspaces-list">
            {spaces.map((space) => (
              <li key={space.id} className="tabspaces-item">
                <button className="tabspaces-item-main" onClick={() => openSpace(space)}>
                  <div className="tabspaces-item-top">
                    <span className="tabspaces-item-name">{space.name}</span>
                    <span className="tabspaces-item-count">{space.urls.length} tabs</span>
                  </div>
                  <div className="tabspaces-favicon-row">
                    {space.urls.slice(0, 5).map((url, i) => (
                      <img key={i} src={faviconFor(url)} alt="" className="tabspaces-favicon" />
                    ))}
                    {space.urls.length > 5 && (
                      <span className="tabspaces-favicon-more">+{space.urls.length - 5}</span>
                    )}
                  </div>
                </button>
                <div className="tabspaces-item-actions">
                  <button
                    className="tabspaces-icon-btn"
                    onClick={() => startEdit(space)}
                    aria-label={`Edit ${space.name}`}
                  >
                    ✎
                  </button>
                  <button
                    className="tabspaces-icon-btn tabspaces-delete"
                    onClick={() => removeSpace(space.id)}
                    aria-label={`Delete ${space.name}`}
                  >
                    ✖
                  </button>
                </div>
              </li>
            ))}
            {spaces.length === 0 && (
              <li className="tabspaces-empty">No spaces yet — create one below.</li>
            )}
          </ul>

          <button className="pill-btn tabspaces-new-btn" onClick={startCreate}>
            + New Space
          </button>
        </>
      ) : (
        <form className="tabspaces-form" onSubmit={submitForm}>
          <div className="tabspaces-form-header">
            <span>{editingId === "new" ? "New space" : "Edit space"}</span>
            <button type="button" className="tabspaces-cancel" onClick={cancelEdit}>
              Cancel
            </button>
          </div>

          <input
            type="text"
            placeholder="Space name (e.g. Work)"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            autoFocus
          />
          <textarea
            placeholder={"One URL per line\nmail.google.com\nslack.com"}
            value={form.urlsText}
            onChange={(e) => setForm((f) => ({ ...f, urlsText: e.target.value }))}
          />

          {hasTabsApi && (
            <div className="tabspaces-tab-picker">
              <button type="button" className="ghost-btn" onClick={toggleTabPicker}>
                {tabPickerOpen ? "Hide open tabs" : "+ Add from open tabs"}
              </button>
              {tabPickerOpen && (
                <ul className="tabspaces-tab-list">
                  {openTabs.map((tab) => (
                    <li key={tab.id}>
                      <button type="button" onClick={() => appendTabUrl(tab)}>
                        <img src={tab.favIconUrl || faviconFor(tab.url)} alt="" />
                        <span>{tab.title || tab.url}</span>
                      </button>
                    </li>
                  ))}
                  {openTabs.length === 0 && (
                    <li className="tabspaces-tab-list-empty">No other tabs open right now.</li>
                  )}
                </ul>
              )}
            </div>
          )}

          <button type="submit" className="pill-btn">
            {editingId === "new" ? "Create space" : "Save changes"}
          </button>
        </form>
      )}
    </div>
  );
}

export default TabSpaces;
