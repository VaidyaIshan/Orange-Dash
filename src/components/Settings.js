import React, { useRef, useState } from "react";
import "./css/Settings.css";
import { useSettings, ACCENT_PRESETS, FONT_OPTIONS } from "../context/SettingsContext";
import { useBookmarks, iconSrc } from "../context/BookmarksContext";

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

function Toggle({ checked, onChange, label }) {
  return (
    <label className="od-toggle-row">
      <span>{label}</span>
      <span className={`od-toggle ${checked ? "on" : ""}`} onClick={() => onChange(!checked)}>
        <span className="od-toggle-knob" />
      </span>
    </label>
  );
}

function Settings({ visible, onClose }) {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { links, addLink, removeLink, moveLink } = useBookmarks();
  const fileInputRef = useRef(null);
  const [linkForm, setLinkForm] = useState({ name: "", url: "" });

  const handleAddLink = (e) => {
    e.preventDefault();
    addLink(linkForm.name, linkForm.url);
    setLinkForm({ name: "", url: "" });
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      window.alert("Please choose an image under 3MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateSettings({ background: { type: "image", imageDataUrl: reader.result } });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={`od-panel settings-panel ${visible ? "active" : ""}`}>
      <div className="od-panel-header">
        <h2>Settings</h2>
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>
      </div>

      <div className="settings-body">
        <section className="settings-section">
          <h3>Appearance</h3>

          <div className="od-field">
            <span>Accent color</span>
            <div className="settings-accent-row">
              <div className="settings-swatches">
                {ACCENT_PRESETS.map((color) => (
                  <button
                    key={color}
                    className={`settings-swatch ${settings.accentColor.toLowerCase() === color.toLowerCase() ? "selected" : ""}`}
                    style={{ background: color }}
                    onClick={() => updateSettings({ accentColor: color })}
                    aria-label={`Use accent ${color}`}
                  />
                ))}
              </div>
              <input
                type="color"
                value={settings.accentColor}
                onChange={(e) => updateSettings({ accentColor: e.target.value })}
              />
            </div>
          </div>

          <label className="od-field">
            <span>Font</span>
            <select
              value={settings.fontFamily}
              onChange={(e) => updateSettings({ fontFamily: e.target.value })}
              style={{ fontFamily: settings.fontFamily }}
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                  {font.label}
                </option>
              ))}
            </select>
          </label>

          <label className="od-field">
            <span>Background</span>
            <select
              value={settings.background.type}
              onChange={(e) => updateSettings({ background: { type: e.target.value } })}
            >
              <option value="video">Video</option>
              <option value="color">Solid color</option>
              <option value="gradient">Gradient</option>
              <option value="image">Custom image</option>
              <option value="none">None (black)</option>
            </select>
          </label>

          {settings.background.type === "color" && (
            <label className="od-field">
              <span>Background color</span>
              <input
                type="color"
                value={settings.background.color}
                onChange={(e) => updateSettings({ background: { color: e.target.value } })}
              />
            </label>
          )}

          {settings.background.type === "gradient" && (
            <>
              <label className="od-field">
                <span>Gradient start</span>
                <input
                  type="color"
                  value={settings.background.gradientFrom}
                  onChange={(e) => updateSettings({ background: { gradientFrom: e.target.value } })}
                />
              </label>
              <label className="od-field">
                <span>Gradient end</span>
                <input
                  type="color"
                  value={settings.background.gradientTo}
                  onChange={(e) => updateSettings({ background: { gradientTo: e.target.value } })}
                />
              </label>
            </>
          )}

          {settings.background.type === "image" && (
            <div className="od-field">
              <span>Custom image</span>
              <div className="settings-image-row">
                <button className="pill-btn" onClick={() => fileInputRef.current?.click()}>
                  Upload image
                </button>
                {settings.background.imageDataUrl && (
                  <button
                    className="ghost-btn"
                    onClick={() => updateSettings({ background: { imageDataUrl: null } })}
                  >
                    Remove
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
            </div>
          )}
        </section>

        <section className="settings-section">
          <h3>Header</h3>
          <Toggle
            label="Show logo"
            checked={settings.header.showLogo}
            onChange={(v) => updateSettings({ header: { showLogo: v } })}
          />
          <Toggle
            label="Show title"
            checked={settings.header.showTitle}
            onChange={(v) => updateSettings({ header: { showTitle: v } })}
          />
          <label className="od-field">
            <span>Title text</span>
            <input
              type="text"
              value={settings.header.title}
              onChange={(e) => updateSettings({ header: { title: e.target.value } })}
            />
          </label>
        </section>

        <section className="settings-section">
          <h3>Quick Access</h3>
          <ul className="settings-links-list">
            {links.map((link, index) => (
              <li key={link.id} className="settings-links-item">
                <img src={iconSrc(link)} alt="" className="settings-links-icon" />
                <div className="settings-links-info">
                  <div className="settings-links-name">{link.name}</div>
                  <div className="settings-links-url">{link.url}</div>
                </div>
                <div className="settings-links-actions">
                  <button
                    className="settings-links-move"
                    onClick={() => moveLink(link.id, -1)}
                    disabled={index === 0}
                    aria-label={`Move ${link.name} up`}
                  >
                    ↑
                  </button>
                  <button
                    className="settings-links-move"
                    onClick={() => moveLink(link.id, 1)}
                    disabled={index === links.length - 1}
                    aria-label={`Move ${link.name} down`}
                  >
                    ↓
                  </button>
                  <button
                    className="settings-links-remove"
                    onClick={() => removeLink(link.id)}
                    aria-label={`Remove ${link.name}`}
                  >
                    ✖
                  </button>
                </div>
              </li>
            ))}
            {links.length === 0 && <li className="settings-links-empty">No bookmarks yet.</li>}
          </ul>

          <form className="settings-links-form" onSubmit={handleAddLink}>
            <input
              type="text"
              placeholder="Name"
              value={linkForm.name}
              onChange={(e) => setLinkForm((f) => ({ ...f, name: e.target.value }))}
            />
            <input
              type="text"
              placeholder="URL"
              value={linkForm.url}
              onChange={(e) => setLinkForm((f) => ({ ...f, url: e.target.value }))}
            />
            <button type="submit" className="pill-btn">Add</button>
          </form>
        </section>

        <section className="settings-section">
          <h3>Clock</h3>
          <Toggle
            label="Show clock"
            checked={settings.clock.show}
            onChange={(v) => updateSettings({ clock: { show: v } })}
          />
          <Toggle
            label="24-hour format"
            checked={settings.clock.format24h}
            onChange={(v) => updateSettings({ clock: { format24h: v } })}
          />
          <Toggle
            label="Show date"
            checked={settings.clock.showDate}
            onChange={(v) => updateSettings({ clock: { showDate: v } })}
          />
          <label className="od-field">
            <span>Date style</span>
            <select
              value={settings.clock.dateStyle}
              onChange={(e) => updateSettings({ clock: { dateStyle: e.target.value } })}
            >
              <option value="long">Friday, 18 September</option>
              <option value="short">18/09/2026</option>
            </select>
          </label>
        </section>

        <section className="settings-section">
          <h3>Widgets</h3>
          <Toggle
            label="Quick Access bookmarks"
            checked={settings.widgets.bookmarks}
            onChange={(v) => updateSettings({ widgets: { bookmarks: v } })}
          />
          <Toggle
            label="Sticky Notes"
            checked={settings.widgets.stickyNotes}
            onChange={(v) => updateSettings({ widgets: { stickyNotes: v } })}
          />
          <Toggle
            label="Pomodoro Tracker"
            checked={settings.widgets.pomodoro}
            onChange={(v) => updateSettings({ widgets: { pomodoro: v } })}
          />
          <Toggle
            label="To-Do List"
            checked={settings.widgets.todo}
            onChange={(v) => updateSettings({ widgets: { todo: v } })}
          />
          <Toggle
            label="Screen Time"
            checked={settings.widgets.screenTime}
            onChange={(v) => updateSettings({ widgets: { screenTime: v } })}
          />
          <Toggle
            label="Tab Spaces"
            checked={settings.widgets.tabSpaces}
            onChange={(v) => updateSettings({ widgets: { tabSpaces: v } })}
          />
        </section>

        <button className="ghost-btn settings-reset" onClick={resetSettings}>
          Reset to defaults
        </button>
      </div>
    </div>
  );
}

export default Settings;
