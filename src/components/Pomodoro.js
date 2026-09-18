import React, { useEffect, useRef, useState } from "react";
import "./css/Pomodoro.css";
import { loadState, saveState } from "../utils/storage";
import FocusBlocklist from "./FocusBlocklist";

const STORAGE_KEY = "orangedash_pomodoro";
// Durations are stored in milliseconds (not minutes) so a duration set by
// editing the timer directly - which can land on a non-round minute, like
// 7:30 - doesn't get silently rounded and throw off the progress ring.
const DEFAULT_DURATIONS_MS = { focus: 25 * 60000, short: 5 * 60000, long: 15 * 60000 };
const LABELS = { focus: "Focus", short: "Short Break", long: "Long Break" };
const MAX_MINUTES = 180;

const hasRuntime = typeof chrome !== "undefined" && chrome.runtime?.sendMessage;

function defaultState() {
  return {
    mode: "focus",
    isRunning: false,
    endTime: null,
    remainingMs: DEFAULT_DURATIONS_MS.focus,
    sessionsCompleted: 0,
    durations: DEFAULT_DURATIONS_MS,
  };
}

function nextModeAfter(mode, sessionsCompleted) {
  if (mode !== "focus") return "focus";
  return sessionsCompleted % 4 === 0 ? "long" : "short";
}

function formatTime(ms) {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

// Accepts "MM:SS" or a bare number of minutes, like typing into the
// display itself rather than a separate settings field.
function parseTimeInput(value) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.includes(":")) {
    const [m, s] = trimmed.split(":");
    const minutes = parseInt(m, 10) || 0;
    const seconds = Math.min(59, parseInt(s, 10) || 0);
    return { minutes: Math.min(MAX_MINUTES, Math.max(0, minutes)), seconds };
  }
  const minutes = parseInt(trimmed, 10);
  if (Number.isNaN(minutes)) return null;
  return { minutes: Math.min(MAX_MINUTES, Math.max(0, minutes)), seconds: 0 };
}

function Pomodoro({ visible, onClose }) {
  const [state, setState] = useState(defaultState());
  const [loaded, setLoaded] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [editingTime, setEditingTime] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [blocklistOpen, setBlocklistOpen] = useState(false);
  const stateRef = useRef(state);
  const editInputRef = useRef(null);
  stateRef.current = state;

  useEffect(() => {
    loadState(STORAGE_KEY, defaultState()).then((saved) => {
      setState({ ...defaultState(), ...saved });
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) saveState(STORAGE_KEY, state);
  }, [state, loaded]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const current = stateRef.current;
    if (!current.isRunning || !current.endTime) return;
    if (now < current.endTime) return;

    const sessionsCompleted =
      current.mode === "focus" ? current.sessionsCompleted + 1 : current.sessionsCompleted;
    const nextMode = nextModeAfter(current.mode, sessionsCompleted);
    setState({
      ...current,
      mode: nextMode,
      sessionsCompleted,
      isRunning: false,
      endTime: null,
      remainingMs: current.durations[nextMode],
    });
  }, [now]);

  useEffect(() => {
    if (editingTime && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingTime]);

  const scheduleAlarm = (mode, endTime) => {
    if (hasRuntime) chrome.runtime.sendMessage({ type: "POMODORO_SCHEDULE", mode, endTime });
  };

  const cancelAlarm = (mode) => {
    if (hasRuntime) chrome.runtime.sendMessage({ type: "POMODORO_CANCEL", mode });
  };

  const start = () => {
    const endTime = Date.now() + state.remainingMs;
    setState((prev) => ({ ...prev, isRunning: true, endTime }));
    scheduleAlarm(state.mode, endTime);
  };

  const pause = () => {
    const remainingMs = Math.max(0, (state.endTime || Date.now()) - Date.now());
    setState((prev) => ({ ...prev, isRunning: false, endTime: null, remainingMs }));
    cancelAlarm(state.mode);
  };

  const reset = () => {
    cancelAlarm(state.mode);
    setState((prev) => ({
      ...prev,
      isRunning: false,
      endTime: null,
      remainingMs: prev.durations[prev.mode],
    }));
  };

  const skip = () => {
    cancelAlarm(state.mode);
    const sessionsCompleted =
      state.mode === "focus" ? state.sessionsCompleted + 1 : state.sessionsCompleted;
    const nextMode = nextModeAfter(state.mode, sessionsCompleted);
    setState((prev) => ({
      ...prev,
      mode: nextMode,
      sessionsCompleted,
      isRunning: false,
      endTime: null,
      remainingMs: prev.durations[nextMode],
    }));
  };

  const switchMode = (mode) => {
    if (mode === state.mode) return;
    cancelAlarm(state.mode);
    setState((prev) => ({
      ...prev,
      mode,
      isRunning: false,
      endTime: null,
      remainingMs: prev.durations[mode],
    }));
  };

  const startEditingTime = () => {
    if (state.isRunning) return;
    setEditValue(formatTime(state.remainingMs));
    setEditingTime(true);
  };

  const commitEditingTime = () => {
    if (!editingTime) return;
    const parsed = parseTimeInput(editValue);
    setEditingTime(false);
    if (!parsed) return;
    const totalMs = (parsed.minutes * 60 + parsed.seconds) * 1000;
    if (totalMs <= 0) return;
    setState((prev) => ({
      ...prev,
      remainingMs: totalMs,
      durations: { ...prev.durations, [prev.mode]: totalMs },
    }));
  };

  const handleEditKeyDown = (e) => {
    if (e.key === "Enter") {
      commitEditingTime();
    } else if (e.key === "Escape") {
      setEditingTime(false);
    }
  };

  const remainingMs = state.isRunning && state.endTime ? Math.max(0, state.endTime - now) : state.remainingMs;
  const totalMs = state.durations[state.mode];
  const progress = totalMs > 0 ? 1 - remainingMs / totalMs : 0;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className={`od-panel pomodoro-panel ${visible ? "active" : ""}`}>
      <div className="od-panel-header">
        <h2>Pomodoro</h2>
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>
      </div>

      <div className="pomodoro-modes">
        {Object.keys(LABELS).map((mode) => (
          <button
            key={mode}
            className={`pomodoro-mode ${state.mode === mode ? "active" : ""}`}
            onClick={() => switchMode(mode)}
          >
            {LABELS[mode]}
          </button>
        ))}
      </div>

      <div className="pomodoro-ring-wrapper">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r={radius} className="pomodoro-ring-bg" />
          <circle
            cx="100"
            cy="100"
            r={radius}
            className="pomodoro-ring-progress"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
          />
        </svg>
        {editingTime ? (
          <input
            ref={editInputRef}
            className="pomodoro-time-input"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitEditingTime}
            onKeyDown={handleEditKeyDown}
          />
        ) : (
          <button
            className={`pomodoro-time ${state.isRunning ? "locked" : ""}`}
            onClick={startEditingTime}
            title={state.isRunning ? "Pause to edit the time" : "Tap to set the time"}
          >
            {formatTime(remainingMs)}
          </button>
        )}
      </div>

      <div className="pomodoro-controls">
        {state.isRunning ? (
          <button className="pill-btn" onClick={pause}>Pause</button>
        ) : (
          <button className="pill-btn" onClick={start}>Start</button>
        )}
        <button className="ghost-btn" onClick={reset}>Reset</button>
        <button className="ghost-btn" onClick={skip}>Skip</button>
      </div>

      <div className="pomodoro-footer">
        <div className="pomodoro-sessions">Focus sessions completed: {state.sessionsCompleted}</div>
        <div className="pomodoro-hint">
          Tap Focus / Short Break / Long Break to switch, or tap the time to set it. A long break
          follows automatically every 4th focus session.
        </div>
      </div>

      <FocusBlocklist open={blocklistOpen} onToggleOpen={() => setBlocklistOpen((v) => !v)} />
    </div>
  );
}

export default Pomodoro;
