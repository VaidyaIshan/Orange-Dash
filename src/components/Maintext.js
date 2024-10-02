import React, { useState, useEffect } from "react";
import "./css/Text.css";

function Text() {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");  // Added state for date

  // Update the time every minute (12-hour format without leading zero and AM/PM)
  useEffect(() => {
    const getTime = () => {
      const time = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
      const timeWithoutAMPM = time.replace(/(AM|PM)/, '').trim(); // Remove AM/PM and trim extra spaces
      setCurrentTime(timeWithoutAMPM);
    };

    getTime(); // Set the time immediately when the component is mounted
    const interval = setInterval(getTime, 60000); // Update time every minute

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  // Format and set the current date (e.g., "Monday, 30 September")
  useEffect(() => {
    const formatDate = () => {
      const options = { weekday: 'long', day: 'numeric', month: 'long' };
      const formattedDate = new Date().toLocaleDateString('en-GB', options);
      setCurrentDate(formattedDate); // Update state with the formatted date
    };

    formatDate(); // Initial call to set the current day and date
    const interval = setInterval(formatDate, 60000); // Update date every minute

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  return (
    <div className="text-container">
      {/* Display time and formatted date */}
      <h1 className="time">{currentTime}</h1>
      <h1 className="maintitle">{currentDate}</h1>
    </div>
  );
}

export default Text;