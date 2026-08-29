import React from "react";
import "./themeParticleRain.css";

// Experimental and intentionally self-contained: remove this component from
// SiteChrome to revoke the enhanced page-wide particle treatment in one step.
const PARTICLES = Array.from({ length: 104 }, (_, index) => ({
  id: index,
  x: (index * 47 + 11) % 101,
  delay: -((index * 0.83) % 12),
  duration: 10.5 + ((index * 17) % 63) / 10,
  size: 1.15 + (index % 4) * 0.62,
  drift: -18 + ((index * 29) % 37),
  midDrift: -10 + ((index * 19) % 23),
  blur: index % 7 === 0 ? 0.75 : index % 3 === 0 ? 0.28 : 0,
  peak: 0.46 + (index % 6) * 0.075,
  stretch: 0.82 + (index % 5) * 0.09,
}));

export function ThemeParticleRain({ subdued = false }) {
  return (
    <div className={`theme-particle-rain ${subdued ? "is-subdued" : ""}`} aria-hidden="true">
      {PARTICLES.map((particle) => (
        <i
          key={particle.id}
          style={{
            "--particle-x": `${particle.x}%`,
            "--particle-delay": `${particle.delay}s`,
            "--particle-duration": `${particle.duration}s`,
            "--particle-size": `${particle.size}px`,
            "--particle-drift": `${particle.drift}px`,
            "--particle-mid-drift": `${particle.midDrift}px`,
            "--particle-blur": `${particle.blur}px`,
            "--particle-peak": particle.peak,
            "--particle-soft": particle.peak * 0.62,
            "--particle-width": `${particle.size * particle.stretch}px`,
          }}
        />
      ))}
    </div>
  );
}
