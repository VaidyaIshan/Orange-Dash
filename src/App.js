import React, { useState } from 'react';
import './App.css';
import BackgroundVideo from './components/BackgroundVideo.js';
import Text from './components/Maintext.js';
import Workspace from './components/workspace.js';
import ScreenTime from './components/ScreenTime.js'; // Import ScreenTime component
import icon from "./assets/android-chrome-512x512.png";
import { MdAccessTimeFilled } from "react-icons/md"; // Import the time icon

function App() {
  const [showScreenTime, setShowScreenTime] = useState(false); // State to toggle screen time

  const toggleScreenTime = () => {
    setShowScreenTime(!showScreenTime); // Toggle screen time visibility
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

        {/* Screen time icon at the top right corner */}
        <MdAccessTimeFilled
          className="screen-time-icon"
          onClick={toggleScreenTime} // Toggle screen time when icon is clicked
        />

        {/* Conditionally render the ScreenTime component */}
        {showScreenTime && <ScreenTime />}
      </div>
    </>
  );
}

export default App;