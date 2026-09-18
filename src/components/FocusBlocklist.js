import React, { useEffect, useState } from "react";
import { loadState, saveState } from "../utils/storage";

const STORAGE_KEY = "orangedash_focus_blocklist";

export const PRESET_SITES = [
  { key: "youtube", label: "YouTube" },
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
  { key: "twitterx", label: "X / Twitter" },
  { key: "reddit", label: "Reddit" },
  { key: "tiktok", label: "TikTok" },
  { key: "netflix", label: "Netflix" },
];

const DEFAULT_BLOCKLIST = {
  enabled: false,
  presets: Object.fromEntries(PRESET_SITES.map((s) => [s.key, false])),
  custom: [],
};

const hasPermissions = typeof chrome !== "undefined" && chrome.permissions?.request;

function normalizeDomain(input) {
  let value = input.trim().toLowerCase();
  value = value.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  return value;
}

function FocusBlocklist({ open, onToggleOpen }) {
  const [blocklist, setBlocklist] = useState(DEFAULT_BLOCKLIST);
  const [loaded, setLoaded] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [permissionError, setPermissionError] = useState("");

  useEffect(() => {
    loadState(STORAGE_KEY, DEFAULT_BLOCKLIST).then((saved) => {
      setBlocklist({ ...DEFAULT_BLOCKLIST, ...saved, presets: { ...DEFAULT_BLOCKLIST.presets, ...saved.presets } });
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) saveState(STORAGE_KEY, blocklist);
  }, [blocklist, loaded]);

  const toggleEnabled = () => {
    setBlocklist((prev) => ({ ...prev, enabled: !prev.enabled }));
  };

  const togglePreset = (key) => {
    setBlocklist((prev) => ({ ...prev, presets: { ...prev.presets, [key]: !prev.presets[key] } }));
  };

  const addCustomDomain = async (e) => {
    e.preventDefault();
    setPermissionError("");
    const domain = normalizeDomain(customInput);
    if (!domain || blocklist.custom.includes(domain)) {
      setCustomInput("");
      return;
    }

    if (hasPermissions) {
      try {
        const granted = await chrome.permissions.request({ origins: [`*://*.${domain}/*`] });
        if (!granted) {
          setPermissionError("Permission was not granted, so this site can't be blocked.");
          return;
        }
      } catch {
        setPermissionError("Couldn't request permission for that site.");
        return;
      }
    }

    setBlocklist((prev) => ({ ...prev, custom: [...prev.custom, domain] }));
    setCustomInput("");
  };

  const removeCustomDomain = (domain) => {
    setBlocklist((prev) => ({ ...prev, custom: prev.custom.filter((d) => d !== domain) }));
  };

  return (
    <div className="focus-blocklist">
      <button className="focus-blocklist-toggle-row" onClick={onToggleOpen}>
        <span>Block distracting sites during Focus</span>
        <span
          className={`od-toggle ${blocklist.enabled ? "on" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleEnabled();
          }}
        >
          <span className="od-toggle-knob" />
        </span>
      </button>

      {open && (
        <div className="focus-blocklist-body">
          <div className="focus-blocklist-presets">
            {PRESET_SITES.map((site) => (
              <button
                key={site.key}
                className={`focus-blocklist-chip ${blocklist.presets[site.key] ? "selected" : ""}`}
                onClick={() => togglePreset(site.key)}
              >
                {site.label}
              </button>
            ))}
          </div>

          {blocklist.custom.length > 0 && (
            <ul className="focus-blocklist-custom-list">
              {blocklist.custom.map((domain) => (
                <li key={domain}>
                  {domain}
                  <button onClick={() => removeCustomDomain(domain)} aria-label={`Remove ${domain}`}>
                    ✖
                  </button>
                </li>
              ))}
            </ul>
          )}

          <form className="focus-blocklist-form" onSubmit={addCustomDomain}>
            <input
              type="text"
              placeholder="Add another site (e.g. example.com)"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
            />
            <button type="submit" className="ghost-btn">Block</button>
          </form>
          {permissionError && <p className="focus-blocklist-error">{permissionError}</p>}
        </div>
      )}
    </div>
  );
}

export default FocusBlocklist;
