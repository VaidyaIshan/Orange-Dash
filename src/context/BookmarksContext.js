import React, { createContext, useContext, useEffect, useState } from "react";
import { loadState, saveState } from "../utils/storage";

const STORAGE_KEY = "orangedash_bookmarks";

// Bundled icons are keyed by name so we only ever persist a stable key,
// never the webpack-hashed asset URL (that hash changes on every build and
// would leave saved bookmarks pointing at a file that no longer exists).
export const ICONS_BY_KEY = {
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

export function faviconFor(url) {
  try {
    const { hostname } = new URL(url);
    return `https://www.google.com/s2/favicons?sz=64&domain=${hostname}`;
  } catch {
    return null;
  }
}

export function iconSrc(link) {
  if (link.iconKey && ICONS_BY_KEY[link.iconKey]) return ICONS_BY_KEY[link.iconKey];
  return faviconFor(link.url);
}

function normalizeUrl(url) {
  if (!/^https?:\/\//i.test(url)) return `https://${url}`;
  return url;
}

const BookmarksContext = createContext({
  links: DEFAULT_LINKS,
  loaded: false,
  addLink: () => {},
  removeLink: () => {},
  moveLink: () => {},
  reorderLinks: () => {},
});

export function BookmarksProvider({ children }) {
  const [links, setLinks] = useState(DEFAULT_LINKS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadState(STORAGE_KEY, null).then((saved) => {
      setLinks(saved || DEFAULT_LINKS);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) saveState(STORAGE_KEY, links);
  }, [links, loaded]);

  const addLink = (name, url) => {
    const trimmedName = name.trim();
    const trimmedUrl = url.trim();
    if (!trimmedName || !trimmedUrl) return;
    setLinks((prev) => [
      ...prev,
      { id: `custom-${Date.now()}`, name: trimmedName, url: normalizeUrl(trimmedUrl) },
    ]);
  };

  const removeLink = (id) => {
    setLinks((prev) => prev.filter((link) => link.id !== id));
  };

  // Reorders by swapping a link with its immediate neighbor.
  const moveLink = (id, direction) => {
    setLinks((prev) => {
      const index = prev.findIndex((link) => link.id === id);
      const targetIndex = index + direction;
      if (index === -1 || targetIndex < 0 || targetIndex >= prev.length) return prev;
      const updated = [...prev];
      [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
      return updated;
    });
  };

  const reorderLinks = (fromIndex, toIndex) => {
    setLinks((prev) => {
      if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return prev;
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  return (
    <BookmarksContext.Provider value={{ links, loaded, addLink, removeLink, moveLink, reorderLinks }}>
      {children}
    </BookmarksContext.Provider>
  );
}

export function useBookmarks() {
  return useContext(BookmarksContext);
}
