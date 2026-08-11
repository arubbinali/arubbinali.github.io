import React, { useState } from "react";
import "../App.css";
import IntroAnimation from "../components/intro";

function Resume() {
  const [showContent, setShowContent] = useState(false);

  return (
    <div
      className="App"
      style={{
        position: "relative",
        overflow: "hidden",
        backgroundColor: "black",
        minHeight: "100vh",
      }}
    >
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
        }}
      >
        <source src="/videos/ograys.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Intro animation */}
      {!showContent && <IntroAnimation onFinish={() => setShowContent(true)} />}

      {/* Resume content */}
      <div
        className={`resume-content ${showContent ? "fade-in" : "hidden"}`}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          zIndex: 2,
        }}
      >
        {/* Your resume content goes here */}
        <div className="center-text">
          <h1>Resume</h1>
          {/* Add your resume content */}
        </div>
      </div>
    </div>
  );
}

export default Resume;
