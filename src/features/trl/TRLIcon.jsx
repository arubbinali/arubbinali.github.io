import React from "react";

const paths = {
  arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
  calculate: <><path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h2m4 0h2m-8 4h2m4 0h2"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  chevronDown: <path d="m8 10 4 4 4-4"/>,
  chevronUp: <path d="m8 14 4-4 4 4"/>,
  clear: <><path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13"/></>,
  clock: <><circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/></>,
  close: <><path d="m7 7 10 10M17 7 7 17"/></>,
  copy: <><rect x="8" y="8" width="11" height="11" rx="1"/><path d="M16 8V5H5v11h3"/></>,
  expand: <><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/><path d="m3 8 6-6m12 6-6-6M3 16l6 6m12-6-6 6"/></>,
  grip: <><path d="M9 7h.01M15 7h.01M9 12h.01M15 12h.01M9 17h.01M15 17h.01"/></>,
  history: <><path d="M4 12a8 8 0 1 0 2.3-5.7L4 8"/><path d="M4 4v4h4M12 8v5l3 2"/></>,
  minus: <path d="M6 12h12"/>,
  plus: <path d="M12 5v14M5 12h14"/>,
  terminal: <><path d="m5 7 4 4-4 4M11 16h8"/></>,
};

function TRLIcon({ name, size = 16, className = "" }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

export default TRLIcon;
