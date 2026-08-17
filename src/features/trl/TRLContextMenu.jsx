import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import TRLIcon from "./TRLIcon";

function TRLContextMenu({ menu, widgets, expandedWidget, onClose, onCreate, onHideAll, onShowAll, onToggle, onExpand, onCollapse, onDelete }) {
  const menuRef = useRef(null);
  const [position, setPosition] = useState({ left: menu.x, top: menu.y });
  const target = widgets.find((widget) => widget.id === menu.widgetId);

  useLayoutEffect(() => {
    const element = menuRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    setPosition({
      left: Math.max(10, Math.min(menu.x, window.innerWidth - rect.width - 10)),
      top: Math.max(10, Math.min(menu.y, window.innerHeight - rect.height - 10)),
    });
  }, [menu.x, menu.y]);

  useEffect(() => {
    const close = () => onClose();
    const keydown = (event) => { if (event.key === "Escape") close(); };
    window.addEventListener("pointerdown", close);
    window.addEventListener("blur", close);
    window.addEventListener("resize", close);
    window.addEventListener("keydown", keydown);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("blur", close);
      window.removeEventListener("resize", close);
      window.removeEventListener("keydown", keydown);
    };
  }, [onClose]);

  const run = (action) => (event) => {
    event.stopPropagation();
    action();
    onClose();
  };

  return (
    <div className="trl-context-menu" ref={menuRef} style={position} role="menu" onPointerDown={(event) => event.stopPropagation()}>
      {target ? (
        <>
          <div className="trl-context-title"><span>{target.title}</span><small>{target.custom ? "Custom widget" : "Core widget"}</small></div>
          <button type="button" role="menuitem" onClick={run(() => expandedWidget === target.id ? onCollapse() : onExpand(target.id))}><TRLIcon name={expandedWidget === target.id ? "close" : "expand"} /> {expandedWidget === target.id ? "Close expanded view" : "Expand widget"}</button>
          <button type="button" role="menuitem" onClick={run(() => onToggle(target.id, false))}><TRLIcon name="minus" /> Hide widget</button>
          {target.custom && <button className="is-danger" type="button" role="menuitem" onClick={run(() => onDelete(target.id))}><TRLIcon name="clear" /> Delete widget</button>}
        </>
      ) : (
        <>
          <div className="trl-context-title"><span>TRL workspace</span><small>Widget controls</small></div>
          <button type="button" role="menuitem" onClick={run(onCreate)}><TRLIcon name="plus" /> Create new widget</button>
          <button type="button" role="menuitem" onClick={run(onHideAll)}><TRLIcon name="minus" /> Hide all widgets</button>
          <button type="button" role="menuitem" onClick={run(onShowAll)}><TRLIcon name="check" /> Show all widgets</button>
        </>
      )}

      <div className="trl-context-divider" />
      <div className="trl-context-section-label">All widgets</div>
      <div className="trl-context-widget-list" data-lenis-prevent>
        {widgets.map((widget) => (
          <button key={widget.id} type="button" role="menuitemcheckbox" aria-checked={widget.visible} onClick={(event) => { event.stopPropagation(); onToggle(widget.id, !widget.visible); }}>
            <span className={`trl-context-check ${widget.visible ? "is-visible" : ""}`}><TRLIcon name={widget.visible ? "check" : "plus"} size={11} /></span>
            <span>{widget.title}</span>
            {widget.custom && <small>Custom</small>}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TRLContextMenu;
