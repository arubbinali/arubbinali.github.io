import React, { useEffect, useState } from "react";
import { ThemeParticleRain } from "./ThemeParticleRain";
import "./intro.css";

const WORD = "doaorel";

const IntroAnimation = ({ onFinish, presentation = "default", force = false, letterStagger = 0.3, holdDuration = 3500, tagline = "" }) => {
  const [fadeOut, setFadeOut] = useState(false);
  const alreadySeen = !force && window.sessionStorage.getItem("doaor-intro-seen") === "true";

  useEffect(() => {
    if (alreadySeen) {
      onFinish?.();
      return undefined;
    }
    // Play animation fully, then fade out
    const showTime = holdDuration; // how long the animation shows before fade out
    const fadeDuration = 1000; // fade-out duration
    const totalTime = showTime + fadeDuration;

    const fadeTimer = setTimeout(() => setFadeOut(true), showTime);
    const endTimer = setTimeout(() => onFinish && onFinish(), totalTime);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(endTimer);
    };
  }, [alreadySeen, holdDuration, onFinish]);

  if (alreadySeen) return null;

  return (
    <div className={`intro-container intro-${presentation} ${fadeOut ? "fade-out" : ""}`}>
      <ThemeParticleRain />
      <div className="intro-text" role="img" aria-label={WORD}>
        {[...WORD].map((letter, index) => (
          <span
            className={index >= 5 ? "intro-accent" : ""}
            key={`${letter}-${index}`}
            style={{ "--intro-letter-delay": `${index * letterStagger}s` }}
          >
            {letter}
          </span>
        ))}
      </div>
      {tagline && <p className="intro-tagline" aria-label={tagline}>
        {[...tagline].map((character, index) => (
          <span key={`${character}-${index}`} aria-hidden="true" style={{ "--intro-tagline-delay": `${2.6 + index * 0.055}s` }}>{character === " " ? "\u00a0" : character}</span>
        ))}
      </p>}

      <audio autoPlay loop>
        <source src="/Mark.mp3" type="audio/mpeg" />
        Your browser does not support audio.
      </audio>
    </div>
  );
};

export default IntroAnimation;
