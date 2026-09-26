import { ArrowUpRight, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Dialog } from "./Dialog";

export interface PaletteAction {
  id: string;
  title: string;
  detail: string;
  category?: string;
  run: () => void;
}
export function searchActions(actions: PaletteAction[], query: string) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return actions.filter(a => terms.every(term => `${a.title} ${a.detail} ${a.category ?? ""}`.toLowerCase().includes(term)))
    .sort((a, b) => Number(b.title.toLowerCase().startsWith(query.trim().toLowerCase())) - Number(a.title.toLowerCase().startsWith(query.trim().toLowerCase())))
    .slice(0, 30);
}
export function Palette({ actions, close }: { actions: PaletteAction[]; close: () => void }) {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const [closing, setClosing] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const found = searchActions(actions, query);
  const expanded = Boolean(query.trim());
  const selected = Math.min(index, Math.max(0, found.length - 1));
  // Retain exiting rows during the fade, but make them inert immediately.
  const previous = useRef<PaletteAction[]>([]);
  if (expanded) previous.current = found;
  const rows = expanded ? found : previous.current;
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => { document.getElementById(`palette-action-${selected}`)?.scrollIntoView({ block: "nearest" }); }, [selected]);
  const dismiss = (action?: PaletteAction) => {
    if (closing) return;
    setClosing(true);
    timer.current = setTimeout(() => { close(); action?.run(); }, 260);
  };
  return <Dialog title="Search Doaorel" className={`search-dialog ${expanded ? "has-query" : ""}`} closing={closing} onClose={() => dismiss()}>
    <div className="search-field">
      <Search size={19} aria-hidden="true" />
      <input ref={input} autoFocus value={query} placeholder="Find something…" aria-label="Search Doaorel"
        role="combobox" aria-autocomplete="list" aria-controls="palette-results" aria-expanded={expanded}
        aria-activedescendant={expanded && found[selected] ? `palette-action-${selected}` : undefined}
        onChange={e => { setQuery(e.target.value); setIndex(0); }}
        onKeyDown={e => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault(); if (found.length) setIndex((selected + (e.key === "ArrowDown" ? 1 : -1) + found.length) % found.length);
          }
          if (e.key === "Enter" && found[selected] && !e.nativeEvent.isComposing) { e.preventDefault(); dismiss(found[selected]); }
        }} />
      <button className={`search-clear ${query ? "visible" : ""}`} tabIndex={query ? 0 : -1} aria-label="Clear search" aria-hidden={!query}
        onClick={() => { setQuery(""); setIndex(0); input.current?.focus(); }}><X size={17}/></button>
      <button className="search-escape" onClick={() => dismiss()} aria-label="Close search">Esc</button>
    </div>
    <div className="search-results-reveal" aria-hidden={!expanded} inert={!expanded}>
      <div className="search-results-inner">
        <div id="palette-results" role="listbox" aria-label="Search results" className="palette-results">
          {rows.map((action, i) => <button role="option" aria-selected={i === selected} id={`palette-action-${i}`} key={action.id}
            className={i === selected ? "selected" : ""} tabIndex={-1} onMouseMove={() => setIndex(i)} onClick={() => dismiss(action)}>
            <span className="search-result-copy"><strong>{action.title}</strong><small>{action.detail}</small></span>
            <span className="search-category">{action.category ?? "Action"}</span><ArrowUpRight size={15}/>
          </button>)}
          {expanded && !found.length && <p className="search-empty">No matches. Try a project, application, or setting.</p>}
        </div>
        <footer>↑ ↓ to move <span>Enter to open · Esc to close</span></footer>
      </div>
    </div>
  </Dialog>;
}
