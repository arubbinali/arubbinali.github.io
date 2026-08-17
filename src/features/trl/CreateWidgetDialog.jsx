import React, { useEffect, useRef, useState } from "react";

function CreateWidgetDialog({ open, onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setContent("");
    window.setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  if (!open) return null;

  const submit = (event) => {
    event.preventDefault();
    if (!title.trim()) return;
    onCreate({ title: title.trim(), content: content.trim() });
  };

  return (
    <div className="trl-create-layer" role="presentation">
      <button className="trl-create-backdrop" type="button" aria-label="Close widget creator" onClick={onClose} />
      <form className="trl-create-dialog" onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="trl-create-title">
        <p className="trl-kicker">Workspace</p>
        <h2 id="trl-create-title">Create a widget</h2>
        <label htmlFor="trl-widget-name">Widget name</label>
        <input ref={inputRef} id="trl-widget-name" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Weekly priorities" maxLength="48" />
        <label htmlFor="trl-widget-content">Starting content <span>optional</span></label>
        <textarea id="trl-widget-content" value={content} onChange={(event) => setContent(event.target.value)} placeholder="You can edit this inside the widget later." />
        <div className="trl-create-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button className="is-primary" type="submit" disabled={!title.trim()}>Create widget</button>
        </div>
      </form>
    </div>
  );
}

export default CreateWidgetDialog;
