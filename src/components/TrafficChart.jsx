import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const number = new Intl.NumberFormat("en-US");
const date = new Intl.DateTimeFormat("en-US", { month:"short", day:"numeric", hour:"numeric", minute:"2-digit" });

export function AnimatedNumber({ value, prefix = "", fallback = "…" }) {
  const previous = useRef(Number.isFinite(value) ? value : 0);
  const [display, setDisplay] = useState(Number.isFinite(value) ? value : null);
  const reduced = useReducedMotion();
  const numberRef = useRef(null);
  useEffect(() => {
    const element = numberRef.current;
    if (!element) return undefined;
    const fit = () => {
      element.style.fontSize = '';
      const available = element.parentElement.clientWidth;
      if (element.scrollWidth > available) element.style.fontSize = `${parseFloat(getComputedStyle(element).fontSize) * available / element.scrollWidth}px`;
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(element.parentElement);
    return () => observer.disconnect();
  }, [display]);
  useEffect(() => {
    if (!Number.isFinite(value)) { setDisplay(null); return undefined; }
    if (reduced) { previous.current = value; setDisplay(value); return undefined; }
    const from = Number.isFinite(previous.current) ? previous.current : value;
    const started = performance.now();
    let frame;
    const draw = now => {
      const progress = Math.min(1, (now - started) / 700);
      const eased = 1 - Math.pow(1 - progress, 4);
      previous.current = from + (value - from) * eased;
      setDisplay(Math.round(previous.current));
      if (progress < 1) frame = requestAnimationFrame(draw);
      else previous.current = value;
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [value, reduced]);
  return <span ref={numberRef} className="traffic-number" aria-label={Number.isFinite(value) ? `${prefix}${number.format(value)}` : 'Loading'}>{display === null ? fallback : `${prefix}${number.format(display)}`}</span>;
}

function smoothCurve(points) {
  if (!points.length) return "";
  if (points.length === 1) return `M${points[0].x},${points[0].y}`;
  const slopes = points.slice(1).map((point,index) => (point.y - points[index].y) / Math.max(.000001,point.x-points[index].x));
  const tangents = points.map((_,index) => {
    if (!index) return slopes[0];
    if (index === points.length-1) return slopes.at(-1);
    const left=slopes[index-1],right=slopes[index];
    return left*right <= 0 ? 0 : 2*left*right/(left+right);
  });
  return points.reduce((path, point, index) => {
    if (!index) return `M${point.x},${point.y}`;
    const p1 = points[index - 1];
    const p2 = point;
    const step = (p2.x-p1.x)/3;
    const c1x = p1.x + step;
    const c2x = p2.x - step;
    const low = Math.min(p1.y, p2.y); const high = Math.max(p1.y, p2.y);
    const c1y = Math.max(low, Math.min(high, p1.y + tangents[index-1] * step));
    const c2y = Math.max(low, Math.min(high, p2.y - tangents[index] * step));
    return `${path} C${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`;
  }, "");
}

export default function TrafficChart({ label, value, points, metric, mode, range, loading, transitionKey }) {
  const [active, setActive] = useState(null);
  const reduced = useReducedMotion();
  const lastSelected = useRef(null);
  const series = useMemo(() => points.filter(p => Number.isFinite(p[metric])).map((p, i, all) => ({
    ...p, amount: mode === "bars" ? (i ? Math.max(0, p[metric] - all[i - 1][metric]) : 0) : p[metric],
  })), [points, metric, mode]);
  const max = useMemo(() => Math.max(1, ...series.map(p => p.amount)), [series]);
  const first = series[0]?.at || 0;
  const duration = Math.max(1, (series.at(-1)?.at || first) - first);
  const coords = useMemo(() => series.map(p => ({ x: 3 + (p.at - first) / duration * 94, y: 92 - p.amount / max * 82 })), [series, first, duration, max]);
  const line = useMemo(() => smoothCurve(coords), [coords]);
  const selected = active === null ? null : series[Math.min(active, series.length - 1)];
  if (selected) lastSelected.current = selected;
  const tooltipValue = selected || lastSelected.current;
  const position = active === null ? null : coords[Math.min(active, coords.length - 1)];
  const inspect = event => {
    const box = event.currentTarget.getBoundingClientRect();
    const target = Math.max(0, Math.min(100, (event.clientX - box.left) / box.width * 100));
    let closest = 0;
    coords.forEach((p, i) => { if (Math.abs(p.x - target) < Math.abs(coords[closest].x - target)) closest = i; });
    setActive(closest);
  };
  return <div className={`traffic-chart ${loading ? "is-updating" : ""}`} aria-busy={loading} style={{ "--chart-color": metric === "views" ? "#b7c2ff" : "#79d6e2" }}>
    <div className="traffic-chart-heading"><div><span className="traffic-key" />{label}<small>{mode === "bars" ? "New per recorded interval" : "Cumulative history"}</small></div><strong><AnimatedNumber value={value} /></strong></div>
    {series.length > 1 ? <>
      <div className="traffic-chart-frame">
        <div className="traffic-scale" aria-hidden="true"><span>{number.format(max)}</span><span>{number.format(Math.round(max / 2))}</span><span>0</span></div>
        <div className="traffic-plot" tabIndex={0} role="group" aria-label={`${label} chart. Use left and right arrows to inspect recorded values.`}
          onPointerMove={inspect} onPointerDown={inspect} onPointerLeave={() => setActive(null)} onBlur={() => setActive(null)}
          onKeyDown={event => { if (["ArrowLeft", "ArrowRight"].includes(event.key)) { event.preventDefault(); setActive(index => Math.max(0, Math.min(series.length - 1, (index ?? 0) + (event.key === "ArrowRight" ? 1 : -1)))); } if (event.key === "Escape") setActive(null); }}>
          <AnimatePresence initial={false}>
          <motion.svg key={`${range}-${mode}-${transitionKey}`} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:reduced ? 0 : .5}} viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={`${label}: ${number.format(series[0][metric])} to ${number.format(series.at(-1)[metric])}`}>
            <defs><linearGradient id={`traffic-${metric}-${range}-${mode}-${transitionKey}`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="var(--chart-color)" stopOpacity=".26"/><stop offset="1" stopColor="var(--chart-color)" stopOpacity="0"/></linearGradient></defs>
            {mode === "area" && <path d={`${line} L97,92 L3,92 Z`} fill={`url(#traffic-${metric}-${range}-${mode}-${transitionKey})`} />}
            {mode !== "bars" && <path className="traffic-line" d={line} />}
            {mode === "bars" && coords.slice(1).map((p, i) => {
              const previous = coords[i]; const width = Math.max(.05, (p.x - previous.x) * .75);
              return <rect key={series[i + 1].at} x={p.x - width} y={p.y} width={width} height={92 - p.y} fill="var(--chart-color)" opacity={active === i + 1 ? 1 : .55} />;
            })}
          </motion.svg>
          </AnimatePresence>
          <div className="traffic-crosshair" style={{ opacity:position ? 1 : 0, left:`${position?.x || 0}%` }} />
          <div className="traffic-point" style={{ opacity:position ? 1 : 0, left:`${position?.x || 0}%`, top:`${position?.y || 0}%` }} />
          <div className="traffic-inspector" style={{ opacity:selected ? 1 : 0, left:`clamp(0px, ${position?.x || 0}%, calc(100% - 204px))` }} aria-live="polite" aria-hidden={!selected}>
            {tooltipValue && <><time>{date.format(new Date(tooltipValue.at * 1000))}</time><strong>{mode === "bars" ? "+" : ""}{number.format(tooltipValue.amount)} <span>{label.toLowerCase()}</span></strong></>}
          </div>
        </div>
      </div>
      <div className="traffic-date-labels"><span>{date.format(new Date(first * 1000))}</span><span>{date.format(new Date(series.at(-1).at * 1000))}</span></div>
      <div className="traffic-chart-foot"><span>{mode === "bars" ? "Bar widths reflect time between records" : "Hover or use arrow keys to explore"}</span><span>{series.length} records</span></div>
    </> : <div className="stats-bento-graph__empty">{loading ? "Loading recorded history…" : "Not enough recorded history for this period."}</div>}
  </div>;
}
