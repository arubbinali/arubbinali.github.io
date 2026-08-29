import React from "react";
import "./themeParticleRain.css";

// Experimental and intentionally self-contained: remove this component from
// SiteChrome to revoke the enhanced page-wide particle treatment in one step.
const PARTICLES = Array.from({ length: 76 }, (_, index) => ({
  id: index,
  x: (index * 47 + 11) % 101,
  delay: -((index * 0.83) % 12),
  duration: 7.5 + ((index * 17) % 47) / 10,
  size: 1 + (index % 4) * 0.55,
  drift: -18 + ((index * 29) % 37),
}));

export function ThemeParticleRain() {
  return (
    <div className="theme-particle-rain" aria-hidden="true">
      {PARTICLES.map((particle) => (
        <i
          key={particle.id}
          style={{
            "--particle-x": `${particle.x}%`,
            "--particle-delay": `${particle.delay}s`,
            "--particle-duration": `${particle.duration}s`,
            "--particle-size": `${particle.size}px`,
            "--particle-drift": `${particle.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
