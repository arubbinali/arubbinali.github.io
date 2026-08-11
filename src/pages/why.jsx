import React, { useState } from "react";
import "../App.css";
import IntroAnimation from "../components/intro";
import FuzzyText from "../components/FuzzyText";
import ScrollReveal from "../components/ScrollReveal";

function Why() {
  const [showContent, setShowContent] = useState(false);

  return (
    <div
      className="App"
      style={{
        position: "relative",
        height: "auto",
        overflow: "visible",
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
          position: "fixed",
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

      {/* content wrapper sits above fixed background */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Intro animation */}
        {!showContent && (
          <IntroAnimation onFinish={() => setShowContent(true)} />
        )}

        {/* Main content occupies full viewport and centers children */}
        <div
          className={`main-content ${showContent ? "fade-in" : "hidden"}`}
          style={{
            position: "relative",
            width: "100%",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Centered Text */}
          <div className="center-text" style={{ zIndex: 2 }}>
            <h1>
              <FuzzyText baseIntensity={0.2} hoverIntensity={0.5} enableHover>
                ?
              </FuzzyText>
            </h1>
            <p style={{ color: "#fff" }}>why'd you disobey</p>
          </div>
        </div>
      </div>

      {/* Scrollable content - starts at bottom of viewport + padding for scroll */}
      <div
        style={{
          padding: "clamp(.5rem, 5vw, 4rem)",
          paddingTop: "100vh",
          color: "#fff",
          lineHeight: 1.8,
          minHeight: "auto",
        }}
      >
        {/* ScrollReveal quote */}
        <div style={{ marginBottom: "clamp(20rem, 8vw, 6rem)" }}>
          <ScrollReveal
            baseOpacity={0.01}
            enableBlur
            baseRotation={5}
            blurStrength={40}
          >
            what you're looking for in life isn't here
            what you're looking for in life isn't here
            what you're looking for in life isn't here
          </ScrollReveal>
        </div>
        <div style={{ height: "clamp(10rem, 40vh, 60rem)" }} />
      </div>
    </div>
  );
}

export default Why;