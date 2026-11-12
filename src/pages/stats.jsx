import React, { useCallback, useEffect, useRef, useState } from "react";
import PrimaryMenu from "../components/PrimaryMenu";
import PrimaryHomeLink from "../components/PrimaryHomeLink";
import PrimaryBackground from "../components/PrimaryBackground";
import MagicBento from "../@/components/MagicBento";
import TrafficChart, { AnimatedNumber } from "../components/TrafficChart";
import { fetchTraffic, normalizeTraffic, TRAFFIC_RANGES } from "../data/traffic";
import "./gateway.css";
import "./stats.css";
import "./stats-overrides.css";
import "./stats-experiment.css";

const RANGES = TRAFFIC_RANGES;
function StatsMagicBento({ counts, points, range, period, loading, mode, error, updated }) {
  const [accent, setAccent] = useState("#8ea1ff");
  const latest = useRef(accent);
  const timer = useRef(0);
  useEffect(() => {
    const receive = (event) => {
      latest.current = event.detail;
      if (timer.current) return;
      timer.current = window.setTimeout(() => {
        timer.current = 0;
        setAccent(latest.current);
      }, 70);
    };
    window.addEventListener("doaor:pillar-accent", receive);
    return () => {
      window.removeEventListener("doaor:pillar-accent", receive);
      window.clearTimeout(timer.current);
    };
  }, []);
  const items = [
    { content: <div className="stats-bento-summary"><span>Total views</span><strong><AnimatedNumber value={counts.pageLoads} /></strong><small>Every page load, including returns.</small></div> },
    { content: <div className="stats-bento-summary"><span>Total visits</span><strong><AnimatedNumber value={counts.visits} /></strong><small>One visit per browser session.</small></div> },
    { content: <TrafficChart label="Views" value={counts.pageLoads} points={points} metric="views" mode={mode} range={range} loading={loading} transitionKey={updated?.getTime()} />, colSpan: 2, rowSpan: 2 },
    { content: <TrafficChart label="Visits" value={counts.visits} points={points} metric="visits" mode={mode} range={range} loading={loading} transitionKey={updated?.getTime()} />, colSpan: 2, rowSpan: 2 },
    { content: <div className="stats-bento-summary"><span>During this window</span><strong><AnimatedNumber value={points.length > 1 ? Math.max(0, points.at(-1).views - points[0].views) : null} prefix="+" /></strong><small>Views between the first and last record.<br />{period}</small></div> },
    { content: <div className="stats-bento-summary"><span className="traffic-status"><i />{loading ? "Updating" : error ? "Connection unavailable" : "Connected"}</span><strong><AnimatedNumber value={points.length} /></strong><small>Recorded points{updated && <><br />Updated {updated.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}</>}</small></div> },
  ];
  return <section className="stats-magic-bento" aria-label="Traffic statistics">
    <MagicBento items={items} columns={4} rowHeight={200} gap={12} radius={20}
      glowColor={accent} enableBorderGlow enableSpotlight spotlightRadius={300} clickEffect intro />
  </section>;
}

export default function Stats() {
  const [range, setRange] = useState("all");
  const [counts, setCounts] = useState({ visits: null, pageLoads: null });
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("area");
  const [refresh, setRefresh] = useState(0);
  const [error, setError] = useState(false);
  const [updated, setUpdated] = useState(null);
  const [displayRange, setDisplayRange] = useState('all');
  const hasData = useRef(false);
  const broadcastAccent = useCallback((color) => {
    window.dispatchEvent(new CustomEvent("doaor:pillar-accent", { detail: color }));
  }, []);

  useEffect(() => { document.title = "Stats | doaor"; }, []);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    fetchTraffic(range, controller.signal)
      .then((normalized) => {
        if (controller.signal.aborted) return;
        setCounts(normalized.counts);
        setPoints(normalized.points);
        setDisplayRange(range);
        hasData.current = true;
        setUpdated(new Date());
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setError(true);
        let cached = null;
        try {
          const stored = JSON.parse(sessionStorage.getItem("doaor-counter-preview"));
          if (Number.isSafeInteger(stored?.visits) && Number.isSafeInteger(stored?.pageLoads)) cached = stored;
        } catch { /* No cached live total is available. */ }
        if (cached && !hasData.current) setCounts(normalizeTraffic(cached).counts);
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [range, refresh]);

  const period = RANGES.find(([key]) => key === displayRange)?.[1];
  return <main className="stats-page">
    <div className="stats-background" aria-hidden="true"><PrimaryBackground preset="beam" onAccentChange={broadcastAccent} /></div>
    <PrimaryHomeLink />
    <PrimaryMenu current="stats" />
    <section className="stats-shell">
      <div className="stats-heading">
        <h1>A quiet look at<br /><span>who passed through.</span></h1>
        <div className="stats-heading-note">The small signals of a living space. Explore how the story unfolds.</div>
      </div>
      <div className="traffic-toolbar">
        <div className="traffic-segment" role="group" aria-label="Traffic period">{RANGES.map(([key,label]) => <button type="button" key={key} aria-pressed={range === key} onClick={() => setRange(key)}>{label}</button>)}</div>
        <div className="traffic-segment" role="group" aria-label="Graph representation">{[["line","Line"],["area","Area"],["bars","Intervals"]].map(([key,label]) => <button type="button" key={key} aria-pressed={mode === key} onClick={() => setMode(key)}>{label}</button>)}</div>
        <button type="button" className="traffic-refresh" disabled={loading} onClick={() => setRefresh(value => value + 1)}>{loading ? "Updating…" : "↻ Refresh"}</button>
      </div>
      {error && <p className="traffic-error" role="status">Could not update this period. {hasData.current ? `Showing the last available ${period.toLowerCase()} history.` : 'Any totals shown are the last available values.'} Try Refresh to reconnect.</p>}
      <StatsMagicBento counts={counts} points={points} range={displayRange} period={period} loading={loading}
        mode={mode} error={error} updated={updated} />
    </section>
  </main>;
}
