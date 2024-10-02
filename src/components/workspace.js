import React, { useState, useEffect } from "react";
import "./css/workspace.css";

// Update the paths to your asset images
const defaultLinks = [
  {
    name: "Gmail",
    url: "https://mail.google.com/",
    icon: require("../assets/gmail.png"), // Ensure the image path is correct
  },
  {
    name: "YouTube",
    url: "https://youtube.com/",
    icon: require("../assets/youtube.png"), // Ensure the image path is correct
  },
  {
    name: "Spotify",
    url: "https://spotify.com/",
    icon: require("../assets/spotify.png"), // Ensure the image path is correct
  },
  {
    name: "ChatGPT",
    url: "https://chatgpt.com/",
    icon: require("../assets/chatgpt.png"), // Ensure the image path is correct
  },
  {
    name: "Instagram",
    url: "https://instagram.com/",
    icon: require("../assets/instagram.png"), // Ensure the image path is correct
  },
  {
    name: "LinkedIn",
    url: "https://linkedin.com/",
    icon: require("../assets/linkedin.png"), // Ensure the image path is correct
  },
  {
    name: "Messenger",
    url: "https://messenger.com/",
    icon: require("../assets/messenger.webp"), // Ensure the image path is correct
  },
  {
    name: "Calendar",
    url: "https://calendar.google.com/",
    icon: require("../assets/calendar.png"), // Ensure the image path is correct
  },
  {
    name: "Teams",
    url: "https://teams.microsoft.com/",
    icon: require("../assets/teams.png"), // Ensure the image path is correct
  },
  {
    name: "X",
    url: "https://x.com/",
    icon: require("../assets/message.png"), // Ensure the image path is correct
  },
];

function Workspace() {
  const [isHovered, setIsHovered] = useState(false);
  const [links] = useState(defaultLinks); // Use default links without the ability to add

  const handleMouseMove = (event) => {
    if (event.clientY > window.innerHeight / 2) {
      setIsHovered(true); // Show workspace when the mouse is in the lower half
    } else {
      setIsHovered(false); // Hide workspace when mouse is in the upper half
    }
  };

  useEffect(() => {
    // Add mousemove event listener
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      // Cleanup event listener when component unmounts
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className={`workspace ${isHovered ? "active" : ""}`}>
      <h1 className="maintitle">Quick Access</h1>
      <div className="dock">
        {links.map((link, index) => (
          <div className="link-item" key={index}>
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              <img
                src={link.icon}
                alt={`${link.name} icon`}
                className="link-icon"
              />
              <span className="link-name">{link.name}</span>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Workspace;