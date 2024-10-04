import React, { useState } from 'react';
import './css/PersonalizationSidebar.css'; // Create a separate CSS file for styling
import backVideo from '../assets/back.mp4'; // Default video if no custom background is selected

function PersonalizationSidebar({ onClose }) {
  const [backgroundFile, setBackgroundFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(backVideo); // Default video as preview

  // Handle File Change (Image or Video Upload)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl); // Set preview of the uploaded file
      setBackgroundFile(file); // Save the uploaded file
    }
  };

  // Save Custom Background
  const handleSave = () => {
    if (backgroundFile) {
      // Save custom background to Chrome storage or another persistence method
      chrome.storage.sync.set({ customBackground: previewUrl }, () => {
        console.log('Custom background saved!');
      });
    }
    onClose(); // Close the sidebar after saving
  };

  // Reset to Default Background
  const handleReset = () => {
    setPreviewUrl(backVideo); // Reset to default background
    chrome.storage.sync.remove('customBackground', () => {
      console.log('Background reset to default.');
    });
  };

  return (
    <div className="personalization-sidebar">
      {/* Close Button */}
      <button className="close-btn" onClick={onClose}>X</button>
      <h2>Personalize Background</h2>

      {/* File Upload Section */}
      <div className="file-upload">
        <input type="file" accept="image/*, video/*" onChange={handleFileChange} />
        <p>Choose an image or video for the background.</p>
      </div>

      {/* Preview Section */}
      <div className="preview-section">
        <h3>Preview:</h3>
        {previewUrl.endsWith('.mp4') ? (
          <video src={previewUrl} autoPlay loop muted className="preview-video" />
        ) : (
          <img src={previewUrl} alt="Background Preview" className="preview-image" />
        )}
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button onClick={handleSave} className="save-btn">Save</button>
        <button onClick={handleReset} className="reset-btn">Reset to Default</button>
      </div>
    </div>
  );
}

export default PersonalizationSidebar;