import React, { createContext, useEffect, useLayoutEffect, useRef, useState } from "react";

export const DetailsRevealed = createContext(false);

// Animate the measured outer height, including on browsers without ::details-content.
export default function AnimatedDetails({ summary, children, className = "", ...props }) {
  const [expanded, setExpanded] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const detailsRef = useRef(null);
  const animationRef = useRef(null);
  const lastExpanded = useRef(false);

  useLayoutEffect(() => {
    if (lastExpanded.current === expanded) return;
    lastExpanded.current = expanded;
    const node = detailsRef.current;
    const start = node.getBoundingClientRect().height;
    animationRef.current?.cancel();
    node.open = true;
    node.style.height = "auto";
    const border = node.offsetHeight - node.clientHeight;
    const end = expanded ? node.getBoundingClientRect().height : node.querySelector("summary").offsetHeight + border;
    const finish = () => {
      node.open = expanded;
      node.style.height = "";
      animationRef.current?.cancel();
      animationRef.current = null;
    };
    if (!node.animate || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { finish(); return; }
    node.style.height = `${start}px`;
    const animation = node.animate([{ height: `${start}px` }, { height: `${end}px` }], {
      duration: 440, easing: "cubic-bezier(.22,1,.36,1)", fill: "both",
    });
    animationRef.current = animation;
    animation.onfinish = () => { if (animationRef.current === animation) finish(); };
  }, [expanded]);

  useEffect(() => () => animationRef.current?.cancel(), []);

  return <details {...props} ref={detailsRef} className={`${className} works-animated-details`} data-expanded={expanded}>
    <summary aria-expanded={expanded} onClick={(event) => {
      event.preventDefault();
      setRevealed(true);
      setExpanded((value) => !value);
    }}>{summary}</summary>
    <div className="works-disclosure-body" inert={!expanded}>
      <DetailsRevealed.Provider value={revealed}>{children}</DetailsRevealed.Provider>
    </div>
  </details>;
}
