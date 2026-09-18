import React, { createContext, useContext, useEffect, useState } from "react";
import { loadState, saveState } from "../utils/storage";

const STORAGE_KEY = "orangedash_settings";

export const ACCENT_PRESETS = ["#FF7A45", "#FF9500", "#0A84FF", "#34C759", "#AF52DE", "#FF375F"];

export const DEFAULT_SETTINGS = {
  accentColor: "#FF7A45",
  background: {
    type: "video", // 'video' | 'color' | 'gradient' | 'image' | 'none'
    color: "#FF7A59",
    gradientFrom: "#FFB088",
    gradientTo: "#E14E8C",
    imageDataUrl: null,
  },
  header: {
    showLogo: true,
    showTitle: true,
    title: "Orange Dash",
  },
  clock: {
    show: true,
    format24h: false,
    showDate: true,
    dateStyle: "long", // 'long' | 'short'
  },
  widgets: {
    bookmarks: true,
    stickyNotes: true,
    pomodoro: true,
    todo: true,
    screenTime: true,
  },
};

function deepMerge(base, patch) {
  const result = { ...base };
  for (const key of Object.keys(patch)) {
    const value = patch[key];
    if (value && typeof value === "object" && !Array.isArray(value) && base[key] && typeof base[key] === "object") {
      result[key] = { ...base[key], ...value };
    } else {
      result[key] = value;
    }
  }
  return result;
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function toHex(n) {
  return Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
}

export function lighten(hex, amount) {
  try {
    const { r, g, b } = hexToRgb(hex);
    const nr = r + (255 - r) * amount;
    const ng = g + (255 - g) * amount;
    const nb = b + (255 - b) * amount;
    return `#${toHex(nr)}${toHex(ng)}${toHex(nb)}`;
  } catch {
    return hex;
  }
}

const SettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  loaded: false,
  updateSettings: () => {},
  resetSettings: () => {},
});

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadState(STORAGE_KEY, null).then((saved) => {
      if (saved) setSettings(deepMerge(DEFAULT_SETTINGS, saved));
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) saveState(STORAGE_KEY, settings);
  }, [settings, loaded]);

  useEffect(() => {
    document.documentElement.style.setProperty("--od-accent", settings.accentColor);
    document.documentElement.style.setProperty("--od-accent-light", lighten(settings.accentColor, 0.22));
  }, [settings.accentColor]);

  const updateSettings = (patch) => setSettings((prev) => deepMerge(prev, patch));
  const resetSettings = () => setSettings(DEFAULT_SETTINGS);

  return (
    <SettingsContext.Provider value={{ settings, loaded, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
