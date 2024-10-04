import React, { useState } from 'react';
import './App.css';
import BackgroundVideo from './components/BackgroundVideo.js';
import Text from './components/Maintext.js';
import Workspace from './components/workspace.js';
import ScreenTime from './components/ScreenTime.js';
import PersonalizationSidebar from './components/PersonalizationSidebar'; // Import the new component
import { MdAccessTimeFilled, MdSettings } from "react-icons/md"; // Import both icons
import icon from "./assets/android-chrome-512x512.png";

function App() {
  const [showScreenTime, setShowScreenTime] = useState(false);
  const [showPersonalization, setShowPersonalization] = useState(false); // State for personalization sidebar

  // Toggle Screen Time Component
  const toggleScreenTime = () => {
    setShowScreenTime(!showScreenTime);
  };

  // Toggle Personalization Sidebar
  const togglePersonalization = () => {
    setShowPersonalization(!showPersonalization);
  };

  return (
    <>
      <div className="app-container">
        {/* App Icon and Title */}
        <img
          src={icon}
          alt="Extension Icon"
          className="extension-icon"
        />
        <h1 className="Title">Orange Dash</h1>

        {/* Background Video and Main Content */}
        <BackgroundVideo />
        <Text />
        <Workspace />

        {/* Icon Bar */}
        <div className="icon-bar">
          {/* Screen Time Icon */}
          <MdAccessTimeFilled
            className="screen-time-icon"
            onClick={toggleScreenTime}
          />

          {/* Personalization Icon */}
          <MdSettings
            className="personalization-icon"
            onClick={togglePersonalization}
          />
        </div>

        {/* Conditionally Render ScreenTime Component */}
        {showScreenTime && (
          <ScreenTime
            onClose={toggleScreenTime}
            className={showScreenTime ? 'active' : ''}
          />
        )}

        {/* Conditionally Render PersonalizationSidebar Component */}
        {showPersonalization && (
          <PersonalizationSidebar
            onClose={togglePersonalization}
            className={showPersonalization ? 'active' : ''}
          />
        )}
      </div>
    </>
  );
}

export default App;