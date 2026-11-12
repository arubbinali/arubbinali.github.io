import React, { useEffect, useRef, useState } from "react";
import LightPillar from "../@/components/LightPillar";

const AURORA = {
  topColor: "#5227FF",
  bottomColor: "#FF9FFC",
  intensity: 1,
  glowAmount: 0.002,
  bloom: 0.5,
  pillarWidth: 3,
  pillarHeight: 0.4,
  pillarRotation: -20,
  twist: 0.4,
  detail: 6,
  rotationSpeed: 0.3,
  flow: 1,
  noiseIntensity: 0.5,
};

// Presets are selected by the page or settled homepage wheel selection.
export const LIGHT_PILLAR_PRESETS = {
  aurora: AURORA,

  ice: {
    topColor: "#22d3ee",
    bottomColor: "#e0f2fe",
    intensity: 1,
    glowAmount: 0.002,
    bloom: 0.6,
    pillarWidth: 2.5,
    pillarHeight: 0.4,
    pillarRotation: 40,
    twist: 0.6,
    detail: 6,
    rotationSpeed: 0.3,
    flow: 1,
    noiseIntensity: 0.5,
  },

  ember: {
    topColor: "#ff4d1a",
    bottomColor: "#ffd166",
    intensity: 1.1,
    glowAmount: 0.002,
    bloom: 0.5,
    pillarWidth: 3,
    pillarHeight: 0.4,
    pillarRotation: -40,
    twist: 0.4,
    detail: 6,
    rotationSpeed: 0.3,
    flow: 1,
    noiseIntensity: 0.5,
  },

  spectre: {
    topColor: "#c9c9d6",
    bottomColor: "#ffffff",
    intensity: 1,
    glowAmount: 0.0018,
    bloom: 0.35,
    pillarWidth: 2,
    pillarHeight: 0.4,
    pillarRotation: 60,
    twist: 0.4,
    detail: 6,
    rotationSpeed: 0.3,
    flow: 1,
    noiseIntensity: 0.5,
  },

  twister: {
    topColor: "#10b981",
    bottomColor: "#d9f99d",
    intensity: 1,
    glowAmount: 0.002,
    bloom: 0.5,
    pillarWidth: 3,
    pillarHeight: 0.8,
    pillarRotation: 0,
    twist: 1.05,
    detail: 6,
    rotationSpeed: 0.3,
    flow: 1,
    noiseIntensity: 0.5,
  },

  beam: {
    topColor: "#3b5bff",
    bottomColor: "#e0e7ff",
    intensity: 1.15,
    glowAmount: 0.0011,
    bloom: 0.7,
    pillarWidth: 3,
    pillarHeight: 0.4,
    pillarRotation: 20,
    twist: 0.4,
    detail: 6,
    rotationSpeed: 0.3,
    flow: 1,
    noiseIntensity: 0.5,
  },
};

const COLOR_KEYS = new Set(["topColor", "bottomColor"]);

const rotationDistance = (from, to) => ((to - from + 540) % 360) - 180;

const parseHex = (color) => {
  const value = color.replace("#", "");
  return [0, 2, 4].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16));
};

const mixColor = (from, to, progress) => {
  const start = parseHex(from);
  const end = parseHex(to);
  return `#${start.map((channel, index) => Math.round(channel + (end[index] - channel) * progress).toString(16).padStart(2, "0")).join("")}`;
};

const mixPreset = (from, to, progress) => Object.fromEntries(
  Object.keys(AURORA).map((key) => [
    key,
    COLOR_KEYS.has(key)
      ? mixColor(from[key], to[key], progress)
      : key === "pillarRotation"
        ? from[key] + rotationDistance(from[key], to[key]) * progress
      : from[key] + (to[key] - from[key]) * progress,
  ]),
);

const easeInOut = (value) => value < 0.5
  ? 4 * value * value * value
  : 1 - Math.pow(-2 * value + 2, 3) / 2;

export default function PrimaryBackground({ onAccentChange, preset = "aurora" }) {
  const [settings, setSettings] = useState(() => LIGHT_PILLAR_PRESETS[preset] || AURORA);
  const currentSettings = useRef(settings);
  const accentColor = mixColor(settings.topColor, settings.bottomColor, 0.5);

  useEffect(() => {
    onAccentChange?.(accentColor);
  }, [accentColor, onAccentChange]);

  useEffect(() => {
    const target = LIGHT_PILLAR_PRESETS[preset] || AURORA;
    if (target === currentSettings.current) return undefined;
    if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
      currentSettings.current = target;
      setSettings(target);
      return undefined;
    }
    let animationFrame = 0;
    const transitionDuration = 1500;
    const from = currentSettings.current;
    const startedAt = performance.now();
    const animate = (now) => {
      const progress = Math.min(1, (now - startedAt) / transitionDuration);
      const next = mixPreset(from, target, easeInOut(progress));
      const speedBoost = 9;
      next.rotationSpeed += Math.sin(Math.PI * progress) * speedBoost;
      currentSettings.current = next;
      setSettings(next);
      if (progress < 1) animationFrame = requestAnimationFrame(animate);
      else {
        currentSettings.current = target;
        setSettings(target);
      }
    };
    animationFrame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [preset]);

  return <>
    <div className="primary-background-fallback" aria-hidden="true" style={{background:`radial-gradient(ellipse at 52% 45%, ${settings.topColor}20, transparent 65%)`}} />
    <LightPillar
      {...settings}
      className="gateway-light-pillar"
      interactive={false}
      clickPulse
      intro
      quality="high"
      resolution={2}
      mixBlendMode="screen"
      fade={0.55}
    />
    <div className="gateway-shade" aria-hidden="true" />
    <div className="gateway-grain" aria-hidden="true" />
  </>;
}
