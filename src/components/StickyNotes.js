import React, { useEffect, useRef, useState } from "react";
import "./css/StickyNotes.css";
import { loadState, saveState } from "../utils/storage";

const STORAGE_KEY = "orangedash_sticky_notes";
const COLORS = ["#FFE8A3", "#FFC1CC", "#B8E8FF", "#C3F0CA", "#D8C7F5", "#FFD4B8"];
const MINIMIZED_HEIGHT = 40;
const EXPANDED_SIZE = 420;

function createNote(offset = 0) {
  return {
    id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    text: "",
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    x: 120 + offset,
    y: 120 + offset,
    zIndex: 1,
    width: null,
    height: null,
    minimized: false,
    expanded: false,
  };
}

function StickyNotes({ visible }) {
  const [notes, setNotes] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const dragState = useRef(null);
  const topZ = useRef(1);
  const noteRefs = useRef({});

  useEffect(() => {
    loadState(STORAGE_KEY, []).then((saved) => {
      setNotes(saved);
      topZ.current = saved.reduce((max, n) => Math.max(max, n.zIndex || 1), 1);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) saveState(STORAGE_KEY, notes);
  }, [notes, loaded]);

  const bringToFront = (id) => {
    topZ.current += 1;
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, zIndex: topZ.current } : n)));
  };

  const addNote = () => {
    const note = createNote((notes.length % 6) * 25);
    topZ.current += 1;
    note.zIndex = topZ.current;
    setNotes((prev) => [...prev, note]);
  };

  const updateNote = (id, patch) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  };

  const deleteNote = (id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const toggleMinimize = (note) => {
    if (note.expanded) return;
    if (!note.minimized) {
      const el = noteRefs.current[note.id];
      const height = el ? el.getBoundingClientRect().height : note.height;
      updateNote(note.id, { minimized: true, height });
    } else {
      updateNote(note.id, { minimized: false });
    }
  };

  const toggleExpand = (note) => {
    if (note.minimized) return;
    if (!note.expanded) {
      const el = noteRefs.current[note.id];
      const rect = el ? el.getBoundingClientRect() : null;
      updateNote(note.id, {
        expanded: true,
        width: rect ? rect.width : note.width,
        height: rect ? rect.height : note.height,
      });
    } else {
      updateNote(note.id, { expanded: false });
    }
  };

  const onHeaderMouseDown = (event, note) => {
    bringToFront(note.id);
    dragState.current = {
      id: note.id,
      offsetX: event.clientX - note.x,
      offsetY: event.clientY - note.y,
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const onMouseMove = (event) => {
    if (!dragState.current) return;
    const { id, offsetX, offsetY } = dragState.current;
    updateNote(id, {
      x: Math.max(0, event.clientX - offsetX),
      y: Math.max(0, event.clientY - offsetY),
    });
  };

  const onMouseUp = () => {
    dragState.current = null;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };

  if (!visible) return null;

  return (
    <div className="sticky-notes-layer">
      {notes.map((note) => {
        const style = {
          left: note.x,
          top: note.y,
          zIndex: note.zIndex,
          backgroundColor: note.color,
        };
        if (note.expanded) {
          style.width = EXPANDED_SIZE;
          style.height = EXPANDED_SIZE;
        } else {
          if (note.width) style.width = note.width;
          style.height = note.minimized ? MINIMIZED_HEIGHT : note.height || undefined;
        }

        return (
          <div
            key={note.id}
            ref={(el) => {
              noteRefs.current[note.id] = el;
            }}
            className={`sticky-note ${note.minimized ? "minimized" : ""} ${note.expanded ? "expanded" : ""}`}
            style={style}
            onMouseDown={() => bringToFront(note.id)}
          >
            <div className="sticky-note-header" onMouseDown={(e) => onHeaderMouseDown(e, note)}>
              <div className="sticky-traffic-lights">
                <button
                  className="sticky-note-delete"
                  onClick={() => deleteNote(note.id)}
                  aria-label="Close note"
                >
                  <span className="sticky-traffic-icon">✕</span>
                </button>
                <button
                  className="sticky-note-dot sticky-note-dot-yellow"
                  onClick={() => toggleMinimize(note)}
                  aria-label={note.minimized ? "Expand note" : "Minimize note"}
                >
                  <span className="sticky-traffic-icon">−</span>
                </button>
                <button
                  className="sticky-note-dot sticky-note-dot-green"
                  onClick={() => toggleExpand(note)}
                  aria-label={note.expanded ? "Restore note size" : "Resize note"}
                >
                  <span className="sticky-traffic-icon">⤢</span>
                </button>
              </div>
              <div className="sticky-note-colors">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    className={`sticky-color-dot ${note.color === color ? "selected" : ""}`}
                    style={{ backgroundColor: color }}
                    onClick={() => updateNote(note.id, { color })}
                    aria-label="Change note color"
                  />
                ))}
              </div>
            </div>
            {!note.minimized && (
              <textarea
                className="sticky-note-body"
                value={note.text}
                placeholder="Write something..."
                onChange={(e) => updateNote(note.id, { text: e.target.value })}
              />
            )}
          </div>
        );
      })}
      <button className="sticky-note-add" onClick={addNote} title="Add sticky note">
        +
      </button>
    </div>
  );
}

export default StickyNotes;
