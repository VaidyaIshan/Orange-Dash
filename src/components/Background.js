import React from "react";
import "./css/back.css";
import vid from "../assets/back.mp4";
import { useSettings } from "../context/SettingsContext";

function Background() {
  const { settings } = useSettings();
  const bg = settings.background;

  if (bg.type === "color") {
    return <div className="video-background" style={{ background: bg.color }} />;
  }

  if (bg.type === "gradient") {
    return (
      <div
        className="video-background"
        style={{ background: `linear-gradient(135deg, ${bg.gradientFrom}, ${bg.gradientTo})` }}
      />
    );
  }

  if (bg.type === "image" && bg.imageDataUrl) {
    return (
      <div
        className="video-background"
        style={{
          backgroundImage: `url(${bg.imageDataUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    );
  }

  if (bg.type === "none") {
    return <div className="video-background" style={{ background: "#000" }} />;
  }

  return (
    <div className="video-background">
      <video autoPlay muted loop id="bg-video">
        <source src={vid} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

export default Background;
