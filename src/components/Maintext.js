import React, { useState, useEffect } from "react";
import "./css/Text.css";
import { useSettings } from "../context/SettingsContext";

function formatTime(date, format24h) {
  if (format24h) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  }
  const time = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
  return time.replace(/(AM|PM)/, "").trim();
}

function formatDate(date, dateStyle) {
  if (dateStyle === "short") {
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  }
  return date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}

function Text() {
  const { settings } = useSettings();
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentTime(formatTime(now, settings.clock.format24h));
      setCurrentDate(formatDate(now, settings.clock.dateStyle));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [settings.clock.format24h, settings.clock.dateStyle]);

  if (!settings.clock.show) return null;

  return (
    <div className="text-container">
      <h1 className="time">{currentTime}</h1>
      {settings.clock.showDate && <h1 className="maintitle">{currentDate}</h1>}
    </div>
  );
}

export default Text;
