import React, { useEffect, useRef, useState } from "react";
import "./searchFocus.css";

// Keep the last results mounted briefly so dismissal can animate without stealing focus.
export default function SearchResults({ open, children, className = "light-search-results", ...props }) {
  const [present, setPresent] = useState(Boolean(open));
  const lastResults = useRef(children);
  useEffect(() => {
    if (open) {
      lastResults.current = children;
      setPresent(true);
      return undefined;
    }
    const timer = window.setTimeout(() => setPresent(false), 200);
    return () => window.clearTimeout(timer);
  }, [open, children]);

  if (!open && !present) return null;
  return <div {...props} className={`${className}${open ? "" : " is-closing"}`} aria-hidden={!open} inert={!open} data-lenis-prevent>
    {open ? children : lastResults.current}
  </div>;
}
