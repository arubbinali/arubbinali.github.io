import React, { useEffect, useMemo, useRef, useState } from "react";
import { searchTimezones } from "./timezoneData";
import TRLIcon from "./TRLIcon";

function TimezoneSelector({ open, selectedIds, onAdd, onClose }) {
  const [query, setQuery] = useState("");
  const [rendered, setRendered] = useState(open);
  const [closing, setClosing] = useState(false);
  const inputRef = useRef(null);
  const panelRef = useRef(null);
  const results = useMemo(() => searchTimezones(query, selectedIds), [query, selectedIds]);

  useEffect(() => {
    if (open) {
      setRendered(true);
      setClosing(false);
      return undefined;
    }
    if (!rendered) return undefined;
    setClosing(true);
    const timer = window.setTimeout(() => {
      setRendered(false);
      setClosing(false);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [open, rendered]);

  useEffect(() => {
    if (!open) return undefined;
    setQuery("");
    window.setTimeout(() => inputRef.current?.focus(), 30);

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      const focusable = panelRef.current?.querySelectorAll("input, button");
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!rendered) return null;

  return (
    <div className={`trl-modal-layer ${closing ? "is-closing" : ""}`}>
      <button className="trl-modal-backdrop" type="button" onClick={onClose} aria-label="Close timezone selector" />
      <div className="trl-timezone-selector" ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="timezone-selector-title">
        <div className="trl-selector-heading">
          <div><p className="trl-kicker">World clock</p><h3 id="timezone-selector-title">Add timezone</h3></div>
          <button type="button" onClick={onClose} aria-label="Close"><TRLIcon name="close" /></button>
        </div>
        <label className="trl-search-box">
          <span className="trl-sr-only">Search city or country</span>
          <span aria-hidden="true">⌕</span>
          <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search city or country" />
          <kbd>esc</kbd>
        </label>
        <div className="trl-timezone-results">
          {results.length ? results.map((zone) => (
            <button key={zone.id} type="button" onClick={() => { onAdd(zone); onClose(); }}>
              <span><strong>{zone.city}</strong><small>{zone.country}</small></span>
              <span className="trl-zone-id">{(zone.timeZone || zone.id).replace(/_/g, " ")}</span>
              <TRLIcon name="plus" />
            </button>
          )) : <p className="trl-no-results">No matching timezone found.</p>}
        </div>
      </div>
    </div>
  );
}

export default TimezoneSelector;
