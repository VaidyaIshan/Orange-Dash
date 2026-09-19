import React, { useEffect, useRef, useState } from "react";
import "./css/workspace.css";
import { useBookmarks, iconSrc } from "../context/BookmarksContext";

const MAX_SCALE = 1.4;
const INFLUENCE_RADIUS = 100; // px either side of the cursor that feel the ripple

function Workspace() {
  const [isHovered, setIsHovered] = useState(false);
  const [hoverX, setHoverX] = useState(null);
  const { links } = useBookmarks();
  const iconRefs = useRef({});

  useEffect(() => {
    const handleMouseMove = (event) => {
      setIsHovered(event.clientY > window.innerHeight / 2);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Continuous mac-dock ripple: every icon's scale is a smooth function of
  // its distance from the cursor (a cosine falloff, so it eases in and out
  // rather than snapping between a couple of fixed states), recomputed on
  // every pointer move so the magnification flows as the cursor glides
  // from one icon to the next instead of jumping between discrete levels.
  const getScale = (id) => {
    if (hoverX === null) return 1;
    const el = iconRefs.current[id];
    if (!el) return 1;
    const rect = el.getBoundingClientRect();
    const center = rect.left + rect.width / 2;
    const distance = Math.abs(hoverX - center);
    if (distance >= INFLUENCE_RADIUS) return 1;
    const falloff = Math.cos((distance / INFLUENCE_RADIUS) * (Math.PI / 2));
    return 1 + (MAX_SCALE - 1) * falloff;
  };

  return (
    <div className={`workspace ${isHovered ? "active" : ""}`}>
      <div
        className="dock"
        onMouseMove={(e) => setHoverX(e.clientX)}
        onMouseLeave={() => setHoverX(null)}
      >
        {links.map((link) => {
          const scale = getScale(link.id);
          const lift = (scale - 1) * 30;
          return (
            <div className="link-item" key={link.id}>
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                <span className="link-tooltip">{link.name}</span>
                <span
                  className="link-icon-tile"
                  ref={(el) => {
                    iconRefs.current[link.id] = el;
                  }}
                  style={{ transform: `scale(${scale}) translateY(-${lift}px)` }}
                >
                  <img src={iconSrc(link)} alt={`${link.name} icon`} className="link-icon" />
                </span>
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Workspace;
