import React from "react";
import TRLIcon from "./TRLIcon";

function WidgetFrame({ id, title, layout, active, expanded, hiding, entering, onActivate, onContextMenu, onCollapse, children }) {
  const position = layout || { x: 0, y: 0, width: 400, height: 300 };

  return (
    <div
      className={`trl-widget-shell ${active ? "is-active" : ""} ${expanded ? "is-expanded" : ""} ${hiding ? "is-hiding" : ""} ${entering ? "is-entering" : ""}`}
      data-widget={id}
      style={{ left: position.x, top: position.y, width: position.width, height: position.height, zIndex: expanded ? 70 : undefined }}
      onClick={() => onActivate(id)}
      onContextMenu={(event) => onContextMenu(event, id)}
      aria-label={`${title} widget${active ? ", focused" : ", click to focus"}`}
    >
      {expanded && <button className="trl-collapse-widget" type="button" onClick={(event) => { event.stopPropagation(); onCollapse(); }} aria-label={`Close expanded ${title}`}><TRLIcon name="close" /></button>}
      <div className="trl-widget-content">{children}</div>
    </div>
  );
}

export default WidgetFrame;
