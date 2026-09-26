import React, { useEffect, useRef, useState } from "react";
import { ThinkingOrb } from "thinking-orbs";
import ThoughtLine from "../@/components/ThoughtLine";
import "./visitCounter.css";

const VISITS_API = "https://visits.doaor.com/";
const CACHE_KEY = "doaor-counter-preview";
const formatCount = (value) => new Intl.NumberFormat("en-US").format(value);

function cachedCounts() {
  try {
    const counts = JSON.parse(sessionStorage.getItem(CACHE_KEY));
    if (Number.isSafeInteger(counts?.visits) && Number.isSafeInteger(counts?.pageLoads)) {
      return counts;
    }
  } catch {
    // The network response will populate the counters.
  }
  return null;
}

function RollingCount({ value }) {
  const [shown, setShown] = useState(value);
  const [previous, setPrevious] = useState(null);
  const shownRef = useRef(value);

  useEffect(() => {
    if (value === shownRef.current) return undefined;
    setPrevious(shownRef.current);
    shownRef.current = value;
    setShown(value);
    const timer = window.setTimeout(() => setPrevious(null), 650);
    return () => window.clearTimeout(timer);
  }, [value]);

  return <strong className={`gateway-rolling-count ${previous !== null ? "is-rolling" : ""}`}>
    {previous !== null && <span className="gateway-count-previous">{formatCount(previous)}</span>}
    <span className="gateway-count-current" key={shown ?? "loading"}>{shown === null ? "--" : formatCount(shown)}</span>
  </strong>;
}

export default function VisitCounter() {
  const [counts, setCounts] = useState(cachedCounts);
  const [statsOpen, setStatsOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const isLiveSite = ["doaor.com", "www.doaor.com"].includes(window.location.hostname);
    const read = async (method) => {
      const response = await fetch(VISITS_API, {
        method,
        credentials: "include",
        cache: "no-store",
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Visit counters unavailable");
      const data = await response.json();
      if (!Number.isSafeInteger(data.visits) || !Number.isSafeInteger(data.pageLoads)) {
        throw new Error("Invalid visit counters");
      }
      const next = { visits: data.visits, pageLoads: data.pageLoads };
      try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(next)); } catch { /* Storage may be disabled. */ }
      setCounts(next);
    };
    const update = async () => {
      try {
        await read("GET");
        if (isLiveSite && !controller.signal.aborted) {
          await new Promise((resolve) => window.setTimeout(resolve, 300));
          if (!controller.signal.aborted) await read("POST");
        }
      } catch {
        // Leave the last known number visible if the API is unavailable.
      }
    };
    update();
    return () => controller.abort();
  }, []);

  return <div className={`gateway-visit-counters ${statsOpen ? "is-stats-open" : ""}`} aria-live="polite">
    <div className={`gateway-stats ${statsOpen ? "is-open" : ""}`}>
      <button type="button" className="gateway-stats-toggle" aria-expanded={statsOpen} aria-controls="gateway-stats-panel" onClick={() => setStatsOpen((open) => !open)}>
        <span>Stats</span>
        <svg aria-hidden="true" viewBox="0 0 12 12" fill="none"><path d="m4 2 4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <div id="gateway-stats-panel" className="gateway-stats-panel" aria-hidden={!statsOpen}>
        <div className="gateway-counter-values">
          <div className="gateway-visit-counter" aria-label={counts ? `${formatCount(counts.visits)} visits` : "Visits unavailable"}>
            <span>Visits</span>
            <RollingCount value={counts?.visits ?? null} />
          </div>
          <div className="gateway-visit-counter" aria-label={counts ? `${formatCount(counts.pageLoads)} views` : "Views unavailable"}>
            <span>Views</span>
            <RollingCount value={counts?.pageLoads ?? null} />
          </div>
        </div>
      </div>
    </div>
    <div className="gateway-breathing">
      <span className="gateway-thinking-orb" aria-hidden="true"><ThinkingOrb state="composing" size={20} theme="dark" /></span>
      <ThoughtLine label="Breathing" doneLabel="Breathing" working glyph="none" steps={[]} collapsible={false} showTimer={false} color="#f7f8f9" shimmer shimmerDuration={2.8} breathPeriod={1.6} breathDepth={0.45} fontSize={18} className="gateway-thought-line" />
    </div>
  </div>;
}
