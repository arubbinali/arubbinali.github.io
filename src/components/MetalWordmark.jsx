import React from "react";
import "./metalWordmark.css";

/** Plain white site wordmark, sized by the page that contains it. */
export default function MetalWordmark({
  children = "doaor",
  className = "",
  font = '700 1.45rem/1 "Montserrat Alternates", "Century Gothic", sans-serif',
  color = "#fff",
}) {
  return (
    <span
      className={`metal-wordmark is-plain ${className}`.trim()}
      role="img"
      aria-label={children}
    >
      <span className="metal-wordmark-plain" style={{ font, color }} aria-hidden="true">
        {children}
      </span>
    </span>
  );
}
