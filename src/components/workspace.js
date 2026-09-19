import React, { useEffect, useState } from "react";
import "./css/workspace.css";
import { useBookmarks, iconSrc } from "../context/BookmarksContext";

function Workspace() {
  const [isHovered, setIsHovered] = useState(false);
  const { links } = useBookmarks();

  useEffect(() => {
    const handleMouseMove = (event) => {
      setIsHovered(event.clientY > window.innerHeight / 2);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className={`workspace ${isHovered ? "active" : ""}`}>
      <div className="dock">
        {links.map((link) => (
          <div className="link-item" key={link.id}>
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              <span className="link-icon-tile">
                <img src={iconSrc(link)} alt={`${link.name} icon`} className="link-icon" />
              </span>
              <span className="link-name">{link.name}</span>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Workspace;
