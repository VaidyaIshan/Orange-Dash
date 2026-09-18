import React, { useRef } from "react";
import "./css/Settings.css";
import { useSettings, ACCENT_PRESETS } from "../context/SettingsContext";

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
  const fileInputRef = useRef(null);

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
        </section>

        <button className="ghost-btn settings-reset" onClick={resetSettings}>
          Reset to defaults
        </button>
      </div>
    </div>
  );
}

export default Settings;
