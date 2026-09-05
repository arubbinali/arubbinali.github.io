import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { LIGHT_CONTENT } from "../generated/lightData";
import SearchResults from "./SearchResults";
import "../pages/light.css";

const clean = (line) => line.replace(/^#+\s*|[*_>`]/g, "").trim();
const documents = Object.entries(LIGHT_CONTENT).filter(([path]) => path.startsWith("en/")).map(([path, markdown]) => {
  const slug = path.split("/").pop().replace(/\.md$/, "");
  const lines = markdown.split(/\r?\n/).map(clean).filter(Boolean);
  const heading = markdown.split(/\r?\n/).find((line) => /^#\s/.test(line));
  return { path: path.includes("/signs/") ? `/light/signs/${slug}` : `/light/${slug}`, title: heading ? clean(heading) : lines[0] || slug, lines };
});

export function libraryResults(query, sections = [], currentPath = "") {
  const term = query.trim().toLowerCase();
  if (!term) return [];
  const entries = sections.flatMap((section) => section.entries.map((entry) => ({ path: `/light/${entry.id}`, title: entry.title, lines: [entry.description || "", section.title] })));
  const pages = [
    { path:"/", title:"Home", lines:["The signs in the horizons and within ourselves."] },
    { path:"/about", title:"About", lines:["Engineering student, da'wah, and how to get in touch."] },
    { path:"/history", title:"Commit history", lines:["GitHub repository, development history and published changes."] },
    ...entries, ...documents,
  ];
  const seen = new Set();
  return pages.flatMap((page) => {
    const excerpt = page.lines.find((line) => line.toLowerCase().includes(term));
    if (page.path === currentPath || seen.has(page.path) || (!excerpt && !page.title.toLowerCase().includes(term))) return [];
    seen.add(page.path);
    const text = excerpt || page.lines[0] || page.title;
    const start = Math.max(0, text.toLowerCase().indexOf(term) - 65);
    return [{ ...page, excerpt: `${start ? "…" : ""}${text.slice(start, start + 230)}${text.length > start + 230 ? "…" : ""}` }];
  }).slice(0, 9);
}

export default function LibrarySearch({ sections, currentPath, onNavigate, onFocusChange }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(0);
  const shell = useRef(null);
  const id = useId();
  const results = useMemo(() => libraryResults(query, sections, currentPath), [query, sections, currentPath]);
  const open = focused && Boolean(query.trim());
  useEffect(() => { onFocusChange?.(focused); }, [focused, onFocusChange]);
  useEffect(() => {
    const close = (event) => { if (!shell.current?.contains(event.target)) setFocused(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  const choose = (result) => {
    if (!result) return;
    setFocused(false);
    onNavigate(result.path, { highlight:query.trim(), highlightNonce:Date.now() });
    setQuery("");
  };
  return <div className={`light-search-shell ${open ? "has-results" : ""}`} ref={shell}
    onFocus={() => setFocused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <label className="light-search">
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.4"/><path d="m16 16 4 4" fill="none" stroke="currentColor" strokeWidth="1.4"/></svg>
      <input type="search" role="combobox" aria-label="Search the library" placeholder="Search the library" value={query} aria-expanded={open} aria-controls={id} aria-autocomplete="list"
        aria-activedescendant={open && results[active] ? `${id}-${active}` : undefined}
        onClick={() => setFocused(true)} onChange={(event) => { setQuery(event.target.value);setFocused(true);setActive(0); }}
        onKeyDown={(event) => {
          if (event.key === "Escape") { setFocused(false);event.currentTarget.blur(); }
          if (event.key === "Enter" && open) { event.preventDefault();choose(results[active]); }
          if ((event.key === "ArrowDown" || event.key === "ArrowUp") && results.length) { event.preventDefault();setActive((index) => (index + (event.key === "ArrowDown" ? 1 : -1) + results.length) % results.length); }
        }}/>
      {query && <button type="button" aria-label="Clear search" onClick={() => { setQuery("");shell.current.querySelector("input").focus({preventScroll:true}); }}>×</button>}
    </label>
    <SearchResults open={open} id={id} role="listbox">
      <div className="light-search-results-heading"><span>Search results</span><small>{results.length}</small></div>
      {results.map((result, index) => {
        const match = result.excerpt.toLowerCase().indexOf(query.trim().toLowerCase());
        return <button key={result.path} id={`${id}-${index}`} role="option" aria-selected={active === index} className="light-search-result is-available" style={{"--result-index":index}} onPointerEnter={() => setActive(index)} onClick={() => choose(result)}>
          <strong>{result.title}</strong><span>{match < 0 ? result.excerpt : <>{result.excerpt.slice(0, match)}<u>{result.excerpt.slice(match, match + query.trim().length)}</u>{result.excerpt.slice(match + query.trim().length)}</>}</span>
        </button>;
      })}
      {!results.length && <p className="light-search-empty">No matching passages yet.</p>}
    </SearchResults>
  </div>;
}
