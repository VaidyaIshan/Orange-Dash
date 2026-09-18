import React, { useState } from 'react';
import './App.css';
import BackgroundVideo from './components/BackgroundVideo.js';
import Text from './components/Maintext.js';
import Workspace from './components/workspace.js';
import ScreenTime from './components/ScreenTime.js';
import TodoList from './components/TodoList.js';
import Pomodoro from './components/Pomodoro.js';
import StickyNotes from './components/StickyNotes.js';
import { MdAccessTimeFilled, MdChecklist, MdTimer, MdStickyNote2 } from "react-icons/md";
import icon from "./assets/android-chrome-512x512.png";

function App() {
  const [activePanel, setActivePanel] = useState(null);
  const [notesVisible, setNotesVisible] = useState(false);

  const togglePanel = (panel) => {
    setActivePanel((current) => (current === panel ? null : panel));
  };

  return (
    <>
      <div>
        <img
          src={icon}
          alt="Extension Icon"
          className="extension-icon"
        />
        <h1 className="Title">Orange Dash</h1>
        <BackgroundVideo />
        <Text />
        <Workspace />

        <div className="toolbar">
          <button
            className={`toolbar-icon ${notesVisible ? "active" : ""}`}
            onClick={() => setNotesVisible((v) => !v)}
            title="Sticky Notes"
          >
            <MdStickyNote2 />
          </button>
          <button
            className={`toolbar-icon ${activePanel === "pomodoro" ? "active" : ""}`}
            onClick={() => togglePanel("pomodoro")}
            title="Pomodoro Tracker"
          >
            <MdTimer />
          </button>
          <button
            className={`toolbar-icon ${activePanel === "todo" ? "active" : ""}`}
            onClick={() => togglePanel("todo")}
            title="To-Do List"
          >
            <MdChecklist />
          </button>
          <button
            className={`toolbar-icon ${activePanel === "screenTime" ? "active" : ""}`}
            onClick={() => togglePanel("screenTime")}
            title="Screen Time"
          >
            <MdAccessTimeFilled />
          </button>
        </div>

        <StickyNotes visible={notesVisible} />
        <Pomodoro visible={activePanel === "pomodoro"} onClose={() => setActivePanel(null)} />
        <TodoList visible={activePanel === "todo"} onClose={() => setActivePanel(null)} />
        {activePanel === "screenTime" && (
          <ScreenTime onClose={() => setActivePanel(null)} className="active" />
        )}
      </div>
    </>
  );
}

export default App;
