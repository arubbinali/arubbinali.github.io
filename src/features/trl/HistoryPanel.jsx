import React, { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { formatExpressionForDisplay } from "./numberFormatter";
import { copyText } from "./storage";
import TRLIcon from "./TRLIcon";

function HistoryPanel({ history, onReuse, onDelete, onClear }) {
  const [copiedId, setCopiedId] = useState("");
  const listRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!listRef.current || !contentRef.current) return undefined;
    const lenis = new Lenis({
      wrapper: listRef.current,
      content: contentRef.current,
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: .85,
    });
    let frameId;
    const raf = (time) => { lenis.raf(time); frameId = requestAnimationFrame(raf); };
    frameId = requestAnimationFrame(raf);
    return () => { cancelAnimationFrame(frameId); lenis.destroy(); };
  }, []);

  const copy = async (event, entry) => {
    event.stopPropagation();
    await copyText(`${entry.expression}\n${entry.display}`);
    setCopiedId(entry.id);
    window.setTimeout(() => setCopiedId(""), 1200);
  };

  return (
    <section className="trl-panel trl-history" aria-labelledby="history-title">
      <div className="trl-panel-heading trl-history-heading">
        <div>
          <p className="trl-kicker">Local workspace</p>
          <h2 id="history-title">History</h2>
        </div>
        {history.length > 0 && <button className="trl-text-action" type="button" onClick={onClear}>Clear all</button>}
      </div>
      <div className="trl-history-list" ref={listRef}>
        <div className="trl-history-content" ref={contentRef}>
          {history.length ? history.map((entry) => (
          <article key={entry.id} className="trl-history-row" onClick={() => onReuse(entry.expression)}>
            <button className="trl-history-reuse" type="button">
              <span>{formatExpressionForDisplay(entry.expression)}</span>
              <strong>{entry.display}</strong>
            </button>
            <div className="trl-history-actions">
              <button type="button" onClick={(event) => copy(event, entry)} aria-label="Copy full calculation">
                <TRLIcon name={copiedId === entry.id ? "check" : "copy"} />
              </button>
              <button type="button" onClick={(event) => { event.stopPropagation(); onDelete(entry.id); }} aria-label="Delete calculation">
                <TRLIcon name="close" />
              </button>
            </div>
          </article>
          )) : (
            <div className="trl-history-empty"><TRLIcon name="history" size={19} /><p>Your recent calculations will appear here.</p></div>
          )}
        </div>
      </div>
    </section>
  );
}

export default HistoryPanel;
