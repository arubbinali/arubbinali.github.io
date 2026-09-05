import React, { useLayoutEffect, useMemo, useRef, useState } from "react";

export function codeWindow(scrollTop, viewportHeight, lineHeight, count) {
  const start = Math.max(0, Math.floor(scrollTop / lineHeight) - 20);
  return { start:Math.min(start, Math.max(0, count - 1)), end:Math.min(count, Math.ceil((scrollTop + viewportHeight) / lineHeight) + 20) };
}

// Keep the scrollbar's full range, but syntax-highlight only the visible window.
export default function VirtualCode({ code, language, paneRef, renderLine }) {
  const lines = useMemo(() => code.split("\n"), [code]);
  const longest = useMemo(() => lines.reduce((max, line) => Math.max(max, line.replace(/\t/g, "    ").length), 1), [lines]);
  const preRef = useRef(null);
  const [windowRange, setWindowRange] = useState({ start:0, end:80, lineHeight:20 });
  useLayoutEffect(() => {
    const pane = paneRef.current;
    const pre = preRef.current;
    let frame;
    const measure = () => {
      const style = getComputedStyle(pre);
      const lineHeight = parseFloat(style.lineHeight) || 20;
      const top = Math.max(0, pane.scrollTop - pre.offsetTop - parseFloat(style.paddingTop));
      const range = codeWindow(top, pane.clientHeight, lineHeight, lines.length);
      setWindowRange((old) => old.start === range.start && old.end === range.end && old.lineHeight === lineHeight ? old : { ...range, lineHeight });
    };
    const schedule = () => { cancelAnimationFrame(frame);frame = requestAnimationFrame(measure); };
    measure();
    pane.addEventListener("scroll", schedule, {passive:true});
    window.addEventListener("resize", schedule);
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
    observer?.observe(pane);
    observer?.observe(pre);
    return () => { cancelAnimationFrame(frame);pane.removeEventListener("scroll", schedule);window.removeEventListener("resize", schedule);observer?.disconnect(); };
  }, [lines.length, paneRef]);
  const { start, end, lineHeight } = windowRange;
  return <pre ref={preRef} className="works-virtual-code" style={{minWidth:`calc(${longest}ch + 2.8rem)`}}><code className={`language-${language}`}>
    <span aria-hidden="true" style={{display:"block",height:start * lineHeight}}/>
    {lines.slice(start, end).map((line, index) => <span className="works-code-line" key={start + index} style={{display:"block",height:lineHeight}}>{renderLine(line, language, start + index) || "\u00a0"}</span>)}
    <span aria-hidden="true" style={{display:"block",height:Math.max(0, lines.length - end) * lineHeight}}/>
  </code></pre>;
}
