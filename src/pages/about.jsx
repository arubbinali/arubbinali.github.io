import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";
import IntroAnimation from "../components/intro";
import ShinyText from "../components/ShinyText"; // ✅ import animation

function About() {
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

      {/* ✅ Intro animation */}
      {!showContent && <IntroAnimation onFinish={() => setShowContent(true)} />}

      {/* ✅ About content */}
      <div
        className={`about-content ${showContent ? "fade-in" : "hidden"}`}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
        }}
      >

        {/* Centered Text */}
        <div className="center-text" style={{ zIndex: 2 }}>
          <h1>
            <ShinyText text="About This Site" speed={4} />
          </h1>
          <p>
            <ShinyText text="This website will soon feature additional content currently in development." speed={5} />
          </p>

          <p>
            Back to{" "}
            <Link to="/" className="temp-link">
              <ShinyText text="Main" speed={4} />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;
