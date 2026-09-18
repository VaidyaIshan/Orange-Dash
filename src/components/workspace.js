import React, { useEffect, useRef, useState } from "react";
import "./css/workspace.css";
import { loadState, saveState } from "../utils/storage";

const STORAGE_KEY = "orangedash_bookmarks";

// Bundled icons are keyed by name so we only ever persist a stable key,
// never the webpack-hashed asset URL (that hash changes on every build and
// would leave saved bookmarks pointing at a file that no longer exists).
const ICONS_BY_KEY = {
  gmail: require("../assets/gmail.png"),
  youtube: require("../assets/youtube.png"),
  spotify: require("../assets/spotify.png"),
  chatgpt: require("../assets/chatgpt.png"),
  instagram: require("../assets/instagram.png"),
  linkedin: require("../assets/linkedin.png"),
  messenger: require("../assets/messenger.webp"),
  calendar: require("../assets/calendar.png"),
  teams: require("../assets/teams.png"),
  x: require("../assets/message.png"),
};

const DEFAULT_LINKS = [
  { id: "gmail", name: "Gmail", url: "https://mail.google.com/", iconKey: "gmail" },
  { id: "youtube", name: "YouTube", url: "https://youtube.com/", iconKey: "youtube" },
  { id: "spotify", name: "Spotify", url: "https://spotify.com/", iconKey: "spotify" },
  { id: "chatgpt", name: "ChatGPT", url: "https://chatgpt.com/", iconKey: "chatgpt" },
  { id: "instagram", name: "Instagram", url: "https://instagram.com/", iconKey: "instagram" },
  { id: "linkedin", name: "LinkedIn", url: "https://linkedin.com/", iconKey: "linkedin" },
  { id: "messenger", name: "Messenger", url: "https://messenger.com/", iconKey: "messenger" },
  { id: "calendar", name: "Calendar", url: "https://calendar.google.com/", iconKey: "calendar" },
  { id: "teams", name: "Teams", url: "https://teams.microsoft.com/", iconKey: "teams" },
  { id: "x", name: "X", url: "https://x.com/", iconKey: "x" },
];

function faviconFor(url) {
  try {
    const { hostname } = new URL(url);
    return `https://www.google.com/s2/favicons?sz=64&domain=${hostname}`;
  } catch {
    return null;
  }
}

function iconSrc(link) {
  if (link.iconKey && ICONS_BY_KEY[link.iconKey]) return ICONS_BY_KEY[link.iconKey];
  return faviconFor(link.url);
}

function normalizeUrl(url) {
  if (!/^https?:\/\//i.test(url)) return `https://${url}`;
  return url;
}

function Workspace() {
  const [isHovered, setIsHovered] = useState(false);
  const [links, setLinks] = useState(DEFAULT_LINKS);
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", url: "" });
  const dragIndex = useRef(null);

  useEffect(() => {
    loadState(STORAGE_KEY, null).then((saved) => {
      setLinks(saved || DEFAULT_LINKS);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) saveState(STORAGE_KEY, links);
  }, [links, loaded]);

  useEffect(() => {
    const handleMouseMove = (event) => {
      setIsHovered(event.clientY > window.innerHeight / 2);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const addLink = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.url.trim()) return;
    setLinks((prev) => [
      ...prev,
      { id: `custom-${Date.now()}`, name: form.name.trim(), url: normalizeUrl(form.url.trim()) },
    ]);
    setForm({ name: "", url: "" });
  };

  const removeLink = (id) => {
    setLinks((prev) => prev.filter((link) => link.id !== id));
  };

  const handleDragStart = (index) => {
    dragIndex.current = index;
  };

  const handleDragOver = (event, index) => {
    event.preventDefault();
    if (dragIndex.current === null || dragIndex.current === index) return;
    setLinks((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(dragIndex.current, 1);
      updated.splice(index, 0, moved);
      dragIndex.current = index;
      return updated;
    });
  };

  const handleDragEnd = () => {
    dragIndex.current = null;
  };

  return (
    <div className={`workspace ${isHovered ? "active" : ""}`}>
      <div className="workspace-title-row">
        <h1 className="workspace-title">Quick Access</h1>
        <button className="workspace-edit-toggle" onClick={() => setEditing((v) => !v)}>
          {editing ? "Done" : "Edit"}
        </button>
      </div>

      <div className="dock">
        {links.map((link, index) => (
          <div
            className={`link-item ${editing ? "editing" : ""}`}
            key={link.id}
            draggable={editing}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
          >
            {editing && (
              <button className="link-remove" onClick={() => removeLink(link.id)}>
                ✖
              </button>
            )}
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              <span className="link-icon-tile">
                <img src={iconSrc(link)} alt={`${link.name} icon`} className="link-icon" />
              </span>
              <span className="link-name">{link.name}</span>
            </a>
          </div>
        ))}

        {editing && (
          <form className="link-item add-link-form" onSubmit={addLink}>
            <input
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <input
              type="text"
              placeholder="URL"
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            />
            <button type="submit">Add</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Workspace;
