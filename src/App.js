import React, { useState } from 'react';
import './App.css';
import Background from './components/Background.js';
import Text from './components/Maintext.js';
import Workspace from './components/workspace.js';
import ScreenTime from './components/ScreenTime.js';
import TodoList from './components/TodoList.js';
import Pomodoro from './components/Pomodoro.js';
import StickyNotes from './components/StickyNotes.js';
import Settings from './components/Settings.js';
import TabSpaces from './components/TabSpaces.js';
import { useSettings } from './context/SettingsContext';
import {
  MdAccessTimeFilled,
  MdChecklist,
  MdTimer,
  MdStickyNote2,
  MdSettings,
  MdWorkspaces,
} from "react-icons/md";
import icon from "./assets/android-chrome-512x512.png";

function App() {
  const { settings } = useSettings();
  const [activePanel, setActivePanel] = useState(null);
  const [notesVisible, setNotesVisible] = useState(false);

  const togglePanel = (panel) => {
    setActivePanel((current) => (current === panel ? null : panel));
  };

  return (
    <>
      <div>
        {settings.header.showLogo && (
          <img src={icon} alt="Extension Icon" className="extension-icon" />
        )}
        {settings.header.showTitle && <h1 className="Title">{settings.header.title}</h1>}
        <Background />
        <Text />
        {settings.widgets.bookmarks && <Workspace />}

        <div className="toolbar">
          {settings.widgets.stickyNotes && (
            <button
              className={`toolbar-icon ${notesVisible ? "active" : ""}`}
              onClick={() => setNotesVisible((v) => !v)}
              title="Sticky Notes"
            >
              <MdStickyNote2 />
            </button>
          )}
          {settings.widgets.pomodoro && (
            <button
              className={`toolbar-icon ${activePanel === "pomodoro" ? "active" : ""}`}
              onClick={() => togglePanel("pomodoro")}
              title="Pomodoro Tracker"
            >
              <MdTimer />
            </button>
          )}
          {settings.widgets.todo && (
            <button
              className={`toolbar-icon ${activePanel === "todo" ? "active" : ""}`}
              onClick={() => togglePanel("todo")}
              title="To-Do List"
            >
              <MdChecklist />
            </button>
          )}
          {settings.widgets.screenTime && (
            <button
              className={`toolbar-icon ${activePanel === "screenTime" ? "active" : ""}`}
              onClick={() => togglePanel("screenTime")}
              title="Screen Time"
            >
              <MdAccessTimeFilled />
            </button>
          )}
          {settings.widgets.tabSpaces && (
            <button
              className={`toolbar-icon ${activePanel === "tabSpaces" ? "active" : ""}`}
              onClick={() => togglePanel("tabSpaces")}
              title="Tab Spaces"
            >
              <MdWorkspaces />
            </button>
          )}
          <button
            className={`toolbar-icon ${activePanel === "settings" ? "active" : ""}`}
            onClick={() => togglePanel("settings")}
            title="Settings"
          >
            <MdSettings />
          </button>
        </div>

        {settings.widgets.stickyNotes && <StickyNotes visible={notesVisible} />}
        {settings.widgets.pomodoro && (
          <Pomodoro visible={activePanel === "pomodoro"} onClose={() => setActivePanel(null)} />
        )}
        {settings.widgets.todo && (
          <TodoList visible={activePanel === "todo"} onClose={() => setActivePanel(null)} />
        )}
        {settings.widgets.screenTime && activePanel === "screenTime" && (
          <ScreenTime onClose={() => setActivePanel(null)} className="active" />
        )}
        {settings.widgets.tabSpaces && (
          <TabSpaces visible={activePanel === "tabSpaces"} onClose={() => setActivePanel(null)} />
        )}
        <Settings visible={activePanel === "settings"} onClose={() => setActivePanel(null)} />
      </div>
    </>
  );
}

export default App;
