import React, { useEffect, useState } from "react";
import "./intro.css";

const IntroAnimation = ({ onFinish }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // animation delays for letters
    const letters = document.querySelectorAll(".intro-text span");
    letters.forEach((letter, index) => {
      letter.style.animationDelay = `${index * 0.3}s`;
    });

    // Play animation fully, then fade out
    const showTime = 3500; // how long the animation shows before fade out
    const fadeDuration = 1000; // fade-out duration
    const totalTime = showTime + fadeDuration;

    const fadeTimer = setTimeout(() => setFadeOut(true), showTime);
    const endTimer = setTimeout(() => onFinish && onFinish(), totalTime);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(endTimer);
    };
  }, [onFinish]);

  return (
    <div className={`intro-container ${fadeOut ? "fade-out" : ""}`}>
      <div className="intro-text">
        <span>d</span>
        <span>o</span>
        <span>a</span>
        <span>o</span>
        <span>r</span>
      </div>
      <div className="intro-subtext"></div>

      <audio autoPlay loop>
        <source src="/Mark.mp3" type="audio/mpeg" />
        Your browser does not support audio.
      </audio>
    </div>
  );
};

export default IntroAnimation;
