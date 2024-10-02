import React from 'react';

import "./css/back.css";
import vid from "../assets/back.mp4"

function BackgroundVideo() {
    return (
        <div className="video-background">
            <video autoPlay muted loop id="bg-video">
                <source src={vid} type="video/mp4"/>
                Your browser does not support the video tag.
            </video>
        </div>
    );
}

export default BackgroundVideo;