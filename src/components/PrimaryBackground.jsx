import React, { useState } from "react";
import ShapeWaves from "../@/components/ShapeWaves";

export default function PrimaryBackground() {
  const [videoReady, setVideoReady] = useState(false);
  const [shapeWavesAvailable, setShapeWavesAvailable] = useState(true);

  return <>
    <video className={`gateway-video ${videoReady ? "is-ready" : ""}`} autoPlay muted loop playsInline preload="auto" aria-hidden="true" onCanPlay={() => setVideoReady(true)}>
      <source src="/media/gateway-reel-mobile.mp4?v=4" type="video/mp4" media="(max-width: 720px)" />
      <source src="/media/gateway-reel.mp4?v=4" type="video/mp4" />
    </video>
    {shapeWavesAvailable && <ShapeWaves
      className="gateway-shape-waves"
      text="ارب"
      fontFamily={'"King Fahd Complex V2", "Uthmanic Hafs", "Traditional Arabic", serif'}
      fontWeight={400}
      textSize={0.3}
      shapes="circles"
      cellSize={4}
      dotSize={10000}
      color="#9f9e9e"
      hoverColor="#00ffee"
      backgroundColor="#000000"
      speed={0.4}
      scale={5}
      contrast={1}
      brightness={0.4}
      flow={0}
      direction={0}
      fade={0.5}
      interactive
      splashRadius={50}
      splashStrength={0.4}
      glow={0.35}
      intro
      introDuration={6}
      paused={false}
      onError={() => setShapeWavesAvailable(false)}
    />}
    <div className="gateway-shade" aria-hidden="true" />
    <div className="gateway-grain" aria-hidden="true" />
  </>;
}
