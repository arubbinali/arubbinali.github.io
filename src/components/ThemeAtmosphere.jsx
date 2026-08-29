import React from "react";
import "./themeAtmosphere.css";

// Experimental, self-contained background. SiteChrome has a single import and
// render point so this visual can be removed or swapped without touching pages.
const STARS = Array.from({ length: 38 }, (_, index) => ({
  id: index,
  x: (index * 43 + 7) % 101,
  y: (index * 61 + 13) % 97,
  size: 1 + (index % 4) * .45,
  delay: -((index * .79) % 8),
}));

export function ThemeAtmosphere({ subdued = false }) {
  return (
    <div className={`theme-atmosphere ${subdued ? "is-subdued" : ""}`} aria-hidden="true">
      <div className="theme-aurora theme-aurora-one" />
      <div className="theme-aurora theme-aurora-two" />
      <div className="theme-aurora theme-aurora-three" />
      <svg className="theme-constellation" viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice">
        <path d="M70 510 C190 410 250 470 360 345 S590 250 705 330 835 225 950 155" />
        <path d="M40 210 C170 290 255 150 390 205 S610 160 760 90 880 155 980 70" />
        <path d="M145 640 C275 535 405 625 525 500 S750 470 930 570" />
      </svg>
      <div className="theme-star-field">
        {STARS.map((star) => <i key={star.id} style={{ "--star-x": `${star.x}%`, "--star-y": `${star.y}%`, "--star-size": `${star.size}px`, "--star-delay": `${star.delay}s` }} />)}
      </div>
    </div>
  );
}
