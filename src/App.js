import React, { useState } from 'react';
import './App.css';
import BackgroundVideo from './components/BackgroundVideo.js';
import Text from './components/Maintext.js';
import Workspace from './components/workspace.js';
import icon from "./assets/android-chrome-512x512.png";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <div>
      
<img src={icon} alt="Extension Icon" className="extension-icon" />
<h1 className="Title">Orange Dash</h1>
        <BackgroundVideo />
        <Text />
        <Workspace />
        <Sidebar/>
      </div>
    </>
  );
}

export default App;