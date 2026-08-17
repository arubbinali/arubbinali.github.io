import React from "react";

function CustomWidgetPanel({ widget, onChange }) {
  return (
    <section className="trl-panel trl-custom-widget" aria-labelledby={`${widget.id}-title`}>
      <div className="trl-panel-heading">
        <div><p className="trl-kicker">Personal widget</p><h2 id={`${widget.id}-title`}>{widget.title}</h2></div>
        <span className="trl-panel-index">Custom</span>
      </div>
      <label className="trl-sr-only" htmlFor={`${widget.id}-content`}>{widget.title} content</label>
      <textarea
        id={`${widget.id}-content`}
        value={widget.content}
        onChange={(event) => onChange(widget.id, event.target.value)}
        placeholder="Write anything here…"
        data-lenis-prevent
      />
      <small>Saved automatically on this device</small>
    </section>
  );
}

export default CustomWidgetPanel;
