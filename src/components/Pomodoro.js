import React, { useEffect, useRef, useState } from "react";
import "./css/Pomodoro.css";
import { loadState, saveState } from "../utils/storage";

const STORAGE_KEY = "orangedash_pomodoro";
const DEFAULT_DURATIONS = { focus: 25, short: 5, long: 15 };
const LABELS = { focus: "Focus", short: "Short Break", long: "Long Break" };

const hasRuntime = typeof chrome !== "undefined" && chrome.runtime?.sendMessage;

function defaultState() {
  return {
    mode: "focus",
    isRunning: false,
    endTime: null,
    remainingMs: DEFAULT_DURATIONS.focus * 60000,
    sessionsCompleted: 0,
    durations: DEFAULT_DURATIONS,
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

function Pomodoro({ visible, onClose }) {
  const [state, setState] = useState(defaultState());
  const [loaded, setLoaded] = useState(false);
  const [now, setNow] = useState(Date.now());
  const stateRef = useRef(state);
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
      remainingMs: current.durations[nextMode] * 60000,
    });
  }, [now]);

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
      remainingMs: prev.durations[prev.mode] * 60000,
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
      remainingMs: prev.durations[nextMode] * 60000,
    }));
  };

  const setDuration = (mode, minutes) => {
    const clamped = Math.min(120, Math.max(1, minutes));
    setState((prev) => ({
      ...prev,
      durations: { ...prev.durations, [mode]: clamped },
      remainingMs:
        prev.mode === mode && !prev.isRunning ? clamped * 60000 : prev.remainingMs,
    }));
  };

  const remainingMs = state.isRunning && state.endTime ? Math.max(0, state.endTime - now) : state.remainingMs;
  const totalMs = state.durations[state.mode] * 60000;
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
          <span key={mode} className={`pomodoro-mode ${state.mode === mode ? "active" : ""}`}>
            {LABELS[mode]}
          </span>
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
        <div className="pomodoro-time">{formatTime(remainingMs)}</div>
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

      <div className="pomodoro-settings">
        {Object.keys(LABELS).map((mode) => (
          <label key={mode}>
            {LABELS[mode]}
            <input
              type="number"
              min="1"
              max="120"
              value={state.durations[mode]}
              onChange={(e) => setDuration(mode, parseInt(e.target.value, 10) || 1)}
            />
            min
          </label>
        ))}
      </div>

      <div className="pomodoro-sessions">Sessions completed: {state.sessionsCompleted}</div>
    </div>
  );
}

export default Pomodoro;
