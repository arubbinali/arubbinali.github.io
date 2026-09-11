import React, { useEffect, useState } from "react";
import { ThemeParticleRain } from "./ThemeParticleRain";
import "./intro.css";

const IntroAnimation = ({ onFinish }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
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
      <ThemeParticleRain />
      <div className="intro-text">
        {[..."doaor"].map((letter, index) => <span key={`${letter}-${index}`} style={{ "--intro-letter-delay": `${index * 0.3}s`, "--intro-glow-delay": `${1.5 + index * 0.3}s` }}>{letter}</span>)}
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
