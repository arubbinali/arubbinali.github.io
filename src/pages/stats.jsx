import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PrimaryMenu from "../components/PrimaryMenu";
import PrimaryHomeLink from "../components/PrimaryHomeLink";
import SecondaryBackground from "../components/SecondaryBackground";
import "./gateway.css";
import "./stats.css";
import "./stats-overrides.css";

const API = "https://visits.doaor.com/";
const RANGES = [
  ["24h", "24 hours", 86400],
  ["7d", "7 days", 604800],
  ["30d", "30 days", 2592000],
  ["all", "All time", Infinity],
];
const MODES = [["both", "Both"], ["views", "Views"], ["visits", "Visits"]];
const number = new Intl.NumberFormat("en-US");
const SEED_VISITS = 61;
const SEED_VIEWS = 192;

function previewHistory(counts, range) {
  const now = Math.floor(Date.now() / 1000);
  const visits = Math.max(SEED_VISITS, Number(counts?.visits) || 0);
  const views = Math.max(SEED_VIEWS, Number(counts?.pageLoads) || 0);
  const progress = [
    [96, 40, 120], [84, 42, 126], [72, 45, 137], [60, 47, 146],
    [48, 50, 158], [36, 53, 167], [24, 56, 176], [12, 59, 185], [0, visits, views],
  ].map(([hours, pointVisits, pointViews]) => ({ at: now - hours * 3600, visits: pointVisits, views: pointViews }));
  const seconds = RANGES.find(([key]) => key === range)?.[2] ?? Infinity;
  return progress.filter((point) => seconds === Infinity || point.at >= now - seconds);
}

function normalizeSeries(data, range) {
  const counts = {
    visits: Math.max(SEED_VISITS, Number(data?.visits) || 0),
    pageLoads: Math.max(SEED_VIEWS, Number(data?.pageLoads) || 0),
  };
  const supplied = Array.isArray(data?.series)
    ? data.series
      .map((point) => ({ at: Number(point.at), visits: Number(point.visits), views: Number(point.views) }))
      .filter((point) => Number.isFinite(point.at) && Number.isFinite(point.visits) && Number.isFinite(point.views))
      .sort((a, b) => a.at - b.at)
    : [];
  const points = supplied.length > 1 ? supplied : previewHistory(counts, range);
  const last = points.at(-1);
  if (!last || last.visits !== counts.visits || last.views !== counts.pageLoads) {
    points.push({ at: Math.floor(Date.now() / 1000), visits: counts.visits, views: counts.pageLoads });
  }
  return { counts, points };
}

function smoothPath(points) {
  if (!points.length) return "";
  if (points.length === 1) return `M${points[0].x},${points[0].y}`;
  let path = `M${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[index - 1] || points[index];
    const current = points[index];
    const next = points[index + 1];
    const after = points[index + 2] || next;
    const controlOne = { x: current.x + (next.x - previous.x) / 6, y: current.y + (next.y - previous.y) / 6 };
    const controlTwo = { x: next.x - (after.x - current.x) / 6, y: next.y - (after.y - current.y) / 6 };
    path += ` C${controlOne.x.toFixed(2)},${controlOne.y.toFixed(2)} ${controlTwo.x.toFixed(2)},${controlTwo.y.toFixed(2)} ${next.x.toFixed(2)},${next.y.toFixed(2)}`;
  }
  return path;
}

function tickValues(minimum, maximum, count = 5) {
  return Array.from({ length: count }, (_, index) => Math.round(minimum + ((maximum - minimum) * index) / (count - 1)));
}

function chartGeometry(points, mode, range) {
  const bounds = { left: 106, right: 1350, top: 112, bottom: 528 };
  if (!points.length) return { paths: {}, axes: { values: [], dates: [] }, points: {}, bounds };
  const firstAt = points[0].at;
  const lastAt = points.at(-1).at === firstAt ? firstAt + 1 : points.at(-1).at;
  const shownValues = points.flatMap((point) => mode === "both" ? [point.views, point.visits] : [point[mode]]);
  const rawMin = Math.min(...shownValues);
  const rawMax = Math.max(...shownValues);
  const spread = rawMax - rawMin;
  const minimum = mode === "both" ? 0 : Math.max(0, Math.floor(rawMin - Math.max(2, spread * .16)));
  const maximum = Math.ceil(rawMax + Math.max(3, spread * .14));
  const x = (at) => bounds.left + ((at - firstAt) / (lastAt - firstAt)) * (bounds.right - bounds.left);
  const y = (value) => bounds.bottom - ((value - minimum) / Math.max(1, maximum - minimum)) * (bounds.bottom - bounds.top);
  const viewPoints = points.map((point, index) => ({ x: x(point.at), y: y(point.views), value: point.views, index }));
  const visitPoints = points.map((point, index) => ({ x: x(point.at), y: y(point.visits), value: point.visits, index }));
  const dateFormatter = new Intl.DateTimeFormat("en-US", range === "24h" ? { hour: "numeric" } : { month: "short", day: "numeric" });
  const dates = Array.from({ length: 5 }, (_, index) => {
    const at = firstAt + ((lastAt - firstAt) * index) / 4;
    return { x: x(at), label: dateFormatter.format(new Date(at * 1000)) };
  });
  return {
    bounds,
    paths: { views: smoothPath(viewPoints), visits: smoothPath(visitPoints) },
    points: { views: viewPoints, visits: visitPoints },
    axes: {
      values: tickValues(minimum, maximum).map((value) => ({ value, y: y(value) })),
      dates,
    },
  };
}

function fullDate(at, range) {
  return new Intl.DateTimeFormat("en-US", range === "24h"
    ? { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }
    : { month: "long", day: "numeric", year: "numeric", hour: "numeric" }).format(new Date(at * 1000));
}

export default function Stats() {
  const [params] = useSearchParams();
  const requestedMetric = params.get("metric");
  const [mode, setMode] = useState(["views", "visits"].includes(requestedMetric) ? requestedMetric : "both");
  const [range, setRange] = useState("30d");
  const [counts, setCounts] = useState({ visits: SEED_VISITS, pageLoads: SEED_VIEWS });
  const [points, setPoints] = useState(() => previewHistory(counts, "30d"));
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const [hoverIndex, setHoverIndex] = useState(null);
  const chartRef = useRef(null);

  useEffect(() => { document.title = "Stats | doaor"; }, []);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setHoverIndex(null);
    fetch(`${API}?range=${range}`, { cache: "no-store", credentials: "include", signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error(); return response.json(); })
      .then((data) => {
        const normalized = normalizeSeries(data, range);
        setCounts(normalized.counts);
        setPoints(normalized.points);
        setRevision((value) => value + 1);
      })
      .catch(() => {
        let cached = { visits: SEED_VISITS, pageLoads: SEED_VIEWS };
        try {
          const stored = JSON.parse(sessionStorage.getItem("doaor-counter-preview"));
          if (Number.isSafeInteger(stored?.visits) && Number.isSafeInteger(stored?.pageLoads)) cached = stored;
        } catch { /* Keep the seeded preview when the counter is unavailable. */ }
        const normalized = normalizeSeries(cached, range);
        setCounts(normalized.counts);
        setPoints(normalized.points);
        setRevision((value) => value + 1);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [range]);

  const geometry = useMemo(() => chartGeometry(points, mode, range), [points, mode, range]);
  const period = RANGES.find(([key]) => key === range)?.[1];
  const hovered = hoverIndex === null ? null : points[hoverIndex];
  const hoverX = hoverIndex === null ? null : geometry.points.views?.[hoverIndex]?.x;
  const hoverY = hoverIndex === null ? null : Math.min(
    mode === "visits" ? Infinity : geometry.points.views?.[hoverIndex]?.y ?? Infinity,
    mode === "views" ? Infinity : geometry.points.visits?.[hoverIndex]?.y ?? Infinity,
  );
  const isVisible = (metric) => mode === "both" || mode === metric;
  const selectMode = (nextMode) => { setMode(nextMode); setHoverIndex(null); setRevision((value) => value + 1); };
  const handlePointerMove = (event) => {
    const rect = chartRef.current?.getBoundingClientRect();
    if (!rect || !points.length) return;
    const viewX = ((event.clientX - rect.left) / rect.width) * 1440;
    let nearest = 0;
    let distance = Infinity;
    geometry.points.views.forEach((point, index) => {
      const nextDistance = Math.abs(point.x - viewX);
      if (nextDistance < distance) { distance = nextDistance; nearest = index; }
    });
    setHoverIndex(nearest);
  };

  return <main className="stats-page">
    <div className="stats-background" aria-hidden="true"><SecondaryBackground /></div>
    <PrimaryHomeLink />
    <PrimaryMenu current="stats" />
    <section className="stats-shell">
      <div className="stats-heading">
        <p>DOAOR.COM / STATISTICS</p>
        <h1>A quiet look at<br /><span>who passed through.</span></h1>
      </div>
      <div className="stats-controls">
        <div className="stats-metrics" aria-label="Current totals">
          <button type="button" className={mode === "views" ? "is-focused" : ""} onClick={() => selectMode("views")}><small><i className="stats-key stats-key-views" />Views</small><strong>{number.format(counts.pageLoads)}</strong></button>
          <button type="button" className={mode === "visits" ? "is-focused" : ""} onClick={() => selectMode("visits")}><small><i className="stats-key stats-key-visits" />Visits</small><strong>{number.format(counts.visits)}</strong></button>
        </div>
        <div className="stats-ranges" aria-label="Chart time range">
          {RANGES.map(([key, label]) => <button type="button" key={key} aria-pressed={range === key} onClick={() => setRange(key)}>{label}</button>)}
        </div>
      </div>
      <figure ref={chartRef} className={`stats-chart ${loading ? "is-loading" : ""}`} aria-label={`${mode} traffic over ${period}`} onPointerMove={handlePointerMove} onPointerLeave={() => setHoverIndex(null)}>
        <div className="stats-chart-head">
          <div><span>Cumulative Traffic</span><strong>{period}</strong></div>
          <div className="stats-chart-modes" aria-label="Graph type">{MODES.map(([key, label]) => <button type="button" key={key} aria-pressed={mode === key} onClick={() => selectMode(key)}>{label}</button>)}</div>
        </div>
        <div className="stats-chart-stage" key={`${mode}-${range}-${revision}`}>
          <svg viewBox="0 0 1440 620" preserveAspectRatio="none" role="img">
            <defs>
              <filter id="stats-view-glow"><feGaussianBlur stdDeviation="7" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              <filter id="stats-visit-glow"><feGaussianBlur stdDeviation="6" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>
            <line className="stats-axis" x1={geometry.bounds.left} x2={geometry.bounds.left} y1={geometry.bounds.top} y2={geometry.bounds.bottom}/>
            <line className="stats-axis" x1={geometry.bounds.left} x2={geometry.bounds.right} y1={geometry.bounds.bottom} y2={geometry.bounds.bottom}/>
            {geometry.axes.values.map((tick) => <text className="stats-axis-label" key={tick.value} x="88" y={tick.y + 5}>{number.format(tick.value)}</text>)}
            {geometry.axes.dates.map((tick) => <g key={`${tick.x}-${tick.label}`}><line className="stats-axis-tick" x1={tick.x} x2={tick.x} y1={geometry.bounds.bottom} y2={geometry.bounds.bottom + 8}/><text className="stats-date-label" x={tick.x} y={geometry.bounds.bottom + 38}>{tick.label}</text></g>)}
            {isVisible("views") && geometry.paths.views && <><path className="stats-curve-glow stats-curve-glow-views" d={geometry.paths.views}/><path className="stats-curve stats-curve-views" d={geometry.paths.views}/></>}
            {isVisible("visits") && geometry.paths.visits && <><path className="stats-curve-glow stats-curve-glow-visits" d={geometry.paths.visits}/><path className="stats-curve stats-curve-visits" d={geometry.paths.visits}/></>}
            {hovered && <>
              <line className="stats-hover-line" x1="0" x2="0" y1={geometry.bounds.top} y2={geometry.bounds.bottom} style={{ transform: `translateX(${hoverX}px)` }}/>
              {isVisible("views") && (
                <circle className="stats-hover-dot stats-hover-dot-views" cx="0" cy="0" r="7" style={{ transform: `translate(${hoverX}px, ${geometry.points.views[hoverIndex].y}px)` }}/>
              )}
              {isVisible("visits") && (
                <circle className="stats-hover-dot stats-hover-dot-visits" cx="0" cy="0" r="7" style={{ transform: `translate(${hoverX}px, ${geometry.points.visits[hoverIndex].y}px)` }}/>
              )}
            </>}
          </svg>
        </div>
        <div className={`stats-tooltip ${hovered ? "is-visible" : ""} ${hoverX > 1130 ? "is-right" : ""}`} style={hovered ? { left: `${(hoverX / 1440) * 100}%`, top: `${(Math.max(120, hoverY) / 620) * 100}%` } : undefined} aria-hidden={!hovered}>
          {hovered && <><time>{fullDate(hovered.at, range)}</time>{isVisible("views") && <span><i className="stats-key stats-key-views" />Views <strong>{number.format(hovered.views)}</strong></span>}{isVisible("visits") && <span><i className="stats-key stats-key-visits" />Visits <strong>{number.format(hovered.visits)}</strong></span>}</>}
        </div>
        <figcaption>{isVisible("views") && <span><i className="stats-key stats-key-views" />Views</span>}{isVisible("visits") && <span><i className="stats-key stats-key-visits" />Visits</span>}</figcaption>
      </figure>
    </section>
  </main>;
}
