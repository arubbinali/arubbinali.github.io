import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { libraryResults } from "./LibrarySearch";
import SearchResults from "./SearchResults";
import "./gatewaySearch.css";

const destinations = [
  { title: "Light", path: "/main", excerpt: "Writing, reflection, and the library." },
  { title: "My Works", path: "/works/", excerpt: "Projects, experiments, and selected work." },
  { title: "Software", path: "/software", excerpt: "The doaorel desktop workspace." },
  { title: "Stats", path: "/stats", excerpt: "Views, visits, and activity over time." },
  { title: "About", path: "/about", excerpt: "A little context behind this space." },
  { title: "History", path: "/history", excerpt: "The development record." },
];

export default function GatewaySearch({ open, setOpen }) {
  const navigate = useNavigate();
  const shell = useRef(null);
  const input = useRef(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    const pages = destinations.filter(item => `${item.title} ${item.excerpt}`.toLowerCase().includes(term));
    const seen = new Set(pages.map(item => item.path));
    return [...pages, ...libraryResults(query, [], "/").filter(item => !seen.has(item.path))].slice(0, 9);
  }, [query]);
  useEffect(() => {
    const keyboard = event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault(); input.current?.focus(); setOpen(true);
      }
    };
    const outside = event => { if (!shell.current?.contains(event.target)) setOpen(false); };
    window.addEventListener("keydown", keyboard);
    document.addEventListener("pointerdown", outside);
    return () => { window.removeEventListener("keydown", keyboard); document.removeEventListener("pointerdown", outside); };
  }, [setOpen]);
  useEffect(() => { if (open) shell.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" }); }, [active, open]);
  useEffect(() => {
    const viewport = window.visualViewport;
    const update = () => shell.current?.style.setProperty('--search-viewport', `${viewport?.height || window.innerHeight}px`);
    update();
    viewport?.addEventListener('resize', update);
    return () => viewport?.removeEventListener('resize', update);
  }, []);
  const choose = result => {
    if (!result) return;
    setOpen(false);
    navigate(result.path, { state: { skipIntro: true, highlight: query.trim(), highlightNonce: Date.now() } });
  };
  return <div ref={shell} data-wheel-ignore className={`light-search-shell gateway-search ${open ? "has-results" : ""}`}
    onKeyDown={event => {
      if (event.key === 'Escape') { setOpen(false); input.current?.focus({preventScroll:true}); }
      if (event.key === 'Tab' && open) {
        const focusable = [...shell.current.querySelectorAll('input,button:not([tabindex="-1"])')];
        const first = focusable[0]; const last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    }}>
    <label className="light-search">
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.4"/><path d="m16 16 4 4" fill="none" stroke="currentColor" strokeWidth="1.4"/></svg>
      <input ref={input} type="search" placeholder="Find your way around" aria-label="Search the site" role="combobox" autoComplete="off"
        aria-controls="gateway-search-results" aria-expanded={open} aria-autocomplete="list"
        aria-activedescendant={open && results[active] ? `gateway-result-${active}` : undefined}
        value={query} onFocus={() => setOpen(true)} onClick={() => setOpen(true)} onChange={event => { setQuery(event.target.value); setActive(0); setOpen(true); }}
        onKeyDown={event => {
          if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); setOpen(false); }
          if (event.key === "Enter" && open) { event.preventDefault(); choose(results[active]); }
          if (["ArrowDown", "ArrowUp"].includes(event.key) && results.length) {
            event.preventDefault(); setOpen(true); setActive(index => (index + (event.key === "ArrowDown" ? 1 : -1) + results.length) % results.length);
          }
        }} />
      {query ? <button aria-label="Clear search" type="button" onClick={() => { setQuery(""); setActive(0); input.current.focus(); }}>×</button> : <kbd>Ctrl K</kbd>}
    </label>
    <SearchResults open={open} id="gateway-search-results" role="listbox">
      <div className="light-search-results-heading"><span>{query.trim() ? "Across the site" : "Go somewhere"}</span><small>{results.length}</small></div>
      {results.map((result, index) => <button key={result.path} tabIndex={-1} id={`gateway-result-${index}`} role="option" aria-selected={index === active}
        className="light-search-result is-available" style={{ "--result-index": index }} onPointerEnter={() => setActive(index)} onClick={() => choose(result)}>
        <strong>{result.title}<b aria-hidden="true">↗</b></strong><span>{result.excerpt}</span>
      </button>)}
      {!results.length && <p className="light-search-empty">Nothing here yet. Try “software”, “visits”, or a phrase from the library.</p>}
      <div className="gateway-search-help"><span>↑ ↓ to move</span><span>Enter to explore</span><span>Esc to close</span></div>
    </SearchResults>
  </div>;
}
