import React, { useEffect, useRef, useState } from "react";
import { readLocalValue, writeLocalValue } from "./storage";
import TRLIcon from "./TRLIcon";
import useFlipList from "./useFlipList";
import usePointerSort from "./usePointerSort";

const NOTES_KEY = "trl.notes.v1";

function readNotes() {
  const notes = readLocalValue(NOTES_KEY, []);
  return Array.isArray(notes) ? notes : [];
}

function emptyDraft() {
  return { id: "", title: "", body: "" };
}

function NotesPanel() {
  const [notes, setNotes] = useState(readNotes);
  const [draft, setDraft] = useState(emptyDraft);
  const [showDetails, setShowDetails] = useState(false);
  const titleRef = useRef(null);
  const { registerItem, capturePositions } = useFlipList(notes);

  useEffect(() => {
    if (draft.id) titleRef.current?.focus();
  }, [draft.id]);

  const persistNotes = (next) => {
    setNotes(next);
    writeLocalValue(NOTES_KEY, next);
  };

  const resetComposer = () => {
    setDraft(emptyDraft());
    setShowDetails(false);
  };

  const saveNote = () => {
    if (!draft.title.trim()) return;
    const note = {
      id: draft.id || window.crypto?.randomUUID?.() || `${Date.now()}`,
      title: draft.title.trim(),
      body: draft.body.trim(),
      updatedAt: new Date().toISOString(),
    };
    const next = draft.id
      ? notes.map((item) => item.id === draft.id ? note : item)
      : [note, ...notes];
    persistNotes(next.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
    resetComposer();
    window.setTimeout(() => titleRef.current?.focus(), 0);
  };

  const editNote = (note) => {
    setDraft({ id: note.id, title: note.title, body: note.body || "" });
    setShowDetails(true);
  };

  const deleteNote = (id) => {
    persistNotes(notes.filter((note) => note.id !== id));
    if (draft.id === id) resetComposer();
  };

  const moveDraggedNote = (activeId, targetId) => {
    capturePositions();
    setNotes((current) => {
      const fromIndex = current.findIndex((note) => note.id === activeId);
      const toIndex = current.findIndex((note) => note.id === targetId);
      if (fromIndex < 0 || toIndex < 0) return current;
      const next = [...current];
      const [dragged] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, dragged);
      writeLocalValue(NOTES_KEY, next);
      return next;
    });
  };

  const { draggingId, beginPointerSort, suppressClick } = usePointerSort({
    group: "notes",
    onMove: moveDraggedNote,
    ignoreSelector: ".trl-note-delete",
  });

  const onTitleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      saveNote();
    }
    if (event.key === "Escape" && draft.id) resetComposer();
  };

  const onDetailsKeyDown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      saveNote();
    }
  };

  return (
    <section className="trl-panel trl-notes" aria-labelledby="notes-title">
      <div className="trl-panel-heading trl-notes-heading">
        <div><p className="trl-kicker">Personal workspace</p><h2 id="notes-title">Notes</h2></div>
        <span className="trl-note-count">{notes.length} {notes.length === 1 ? "note" : "notes"}</span>
      </div>

      <div className={`trl-note-composer ${showDetails ? "has-details" : ""}`}>
        <div className="trl-note-composer-row">
          <label className="trl-sr-only" htmlFor="trl-note-title">Note</label>
          <input
            ref={titleRef}
            id="trl-note-title"
            value={draft.title}
            onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
            onKeyDown={onTitleKeyDown}
            placeholder="Type a note and press Enter…"
            maxLength="120"
          />
          <button
            className={`trl-note-details-toggle ${showDetails ? "is-open" : ""}`}
            type="button"
            onClick={() => setShowDetails((current) => !current)}
            aria-expanded={showDetails}
          >
            <TRLIcon name="plus" size={12} /> {showDetails ? "Hide detail" : "Add detail"}
          </button>
          <button className="trl-note-submit" type="button" onClick={saveNote} disabled={!draft.title.trim()} aria-label={draft.id ? "Update note" : "Add note"}>
            <TRLIcon name="arrow" size={15} />
          </button>
        </div>
        {showDetails && (
          <>
            <label className="trl-sr-only" htmlFor="trl-note-body">Optional note detail</label>
            <textarea
              id="trl-note-body"
              value={draft.body}
              onChange={(event) => setDraft((current) => ({ ...current, body: event.target.value }))}
              onKeyDown={onDetailsKeyDown}
              placeholder="Optional detail…"
              data-lenis-prevent
            />
            <div className="trl-note-composer-meta">
              <span>Detail is optional · ⌘ Enter saves</span>
              {draft.id && <button type="button" onClick={resetComposer}>Cancel edit</button>}
            </div>
          </>
        )}
      </div>

      <div className="trl-notes-list" data-lenis-prevent>
        {notes.length ? notes.map((note) => (
          <article
            className={`trl-note-row trl-sortable-item ${draggingId === note.id ? "is-dragging" : ""}`}
            key={note.id}
            ref={(node) => registerItem(note.id, node)}
            data-sortable-group="notes"
            data-sortable-id={note.id}
            onPointerDown={(event) => beginPointerSort(event, note.id)}
            title="Drag to reorder note"
          >
            <button type="button" onClick={(event) => { if (!suppressClick(event)) editNote(note); }}>
              <strong>{note.title}</strong>
              {note.body && <p>{note.body}</p>}
              <small>{new Intl.DateTimeFormat("en", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(note.updatedAt))}</small>
            </button>
            <button className="trl-note-delete" type="button" onClick={() => deleteNote(note.id)} aria-label={`Delete ${note.title}`}><TRLIcon name="close" /></button>
          </article>
        )) : (
          <button className="trl-notes-empty" type="button" onClick={() => titleRef.current?.focus()}>
            <TRLIcon name="plus" size={18} />
            <span>Your notes will appear here</span>
            <small>Type above and press Enter</small>
          </button>
        )}
      </div>
    </section>
  );
}

export default NotesPanel;
