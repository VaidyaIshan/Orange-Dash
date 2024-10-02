import React, { useState } from 'react';
import './App.css';
import BackgroundVideo from './components/BackgroundVideo.js';
import Text from './components/Maintext.js';
import Workspace from './components/workspace.js';
import ScreenTime from './components/ScreenTime.js';
import { MdAccessTimeFilled } from "react-icons/md";
import icon from "./assets/android-chrome-512x512.png";

function App() {
  const [showScreenTime, setShowScreenTime] = useState(false);

  const toggleScreenTime = () => {
    setShowScreenTime(!showScreenTime);
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

        <MdAccessTimeFilled
          className="screen-time-icon"
          onClick={toggleScreenTime}
        />

        {/* Conditionally render the ScreenTime component */}
        {showScreenTime && (
          <ScreenTime
            onClose={toggleScreenTime}
            className={showScreenTime ? 'active' : ''}
          />
        )}
      </div>
    </>
  );
}

export default App;