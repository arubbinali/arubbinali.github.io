import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Lenis from "lenis";
import { SiteChrome } from "../components/SiteChrome";
import { LibraryJournal } from "../components/ReaderExperience";
import { LIGHT_CONTENT, SITE_COMMITS } from "../generated/lightData";
import { DIRECTORY } from "./light";
import "../App.css";
import "./history.css";

export default function History() {
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [highlightedCommit, setHighlightedCommit] = useState(null);
  const navigationTimerRef = useRef(null);
  const searchRef = useRef(null);
  const pageRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => () => window.clearTimeout(navigationTimerRef.current), []);

  useEffect(() => {
    if (!pageRef.current || !contentRef.current) return undefined;
    const smoothScroll = new Lenis({
      wrapper: pageRef.current,
      content: contentRef.current,
      duration: 1.15,
      easing: (value) => Math.min(1, 1.001 - Math.pow(2, -10 * value)),
      smoothWheel: true,
      smoothTouch: false,
      prevent: (node) => {
        const prevented = node.closest?.("[data-lenis-prevent]");
        return Boolean(prevented && prevented !== pageRef.current);
      },
    });
    let frameId;
    const frame = (time) => { smoothScroll.raf(time);frameId = window.requestAnimationFrame(frame); };
    frameId = window.requestAnimationFrame(frame);
    return () => { window.cancelAnimationFrame(frameId);smoothScroll.destroy(); };
  }, []);

  const goRoute = (path, state = {}) => {
    if (leaving || path === "/history") return;
    setLeaving(true);
    navigationTimerRef.current = window.setTimeout(() => navigate(path, { state: { skipIntro: true, ...state } }), 460);
  };

  useEffect(() => {
    const closeSearch = (event) => {
      if (!searchRef.current?.contains(event.target)) setSearchFocused(false);
    };
    document.addEventListener("pointerdown", closeSearch);
    return () => document.removeEventListener("pointerdown", closeSearch);
  }, []);

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const entries = useMemo(() => DIRECTORY.flatMap((section) => section.entries.map((entry) => ({ ...entry, section: section.title }))), []);
  const searchResults = useMemo(() => {
    if (!normalizedQuery) return [];
    const results = [];

    SITE_COMMITS.forEach((commit) => {
      if (commit.message.toLocaleLowerCase().includes(normalizedQuery) || commit.hash.includes(normalizedQuery)) {
        results.push({ id: `commit-${commit.hash}`, heading: commit.message, excerpt: `${commit.hash} · ${new Date(commit.date).toLocaleString(undefined, { timeZone: "UTC", timeZoneName: "short" })}`, kind: "commit", hash: commit.hash });
      }
    });

    entries.forEach((entry) => {
      const entryText = `${entry.section} ${entry.title} ${entry.description}`.toLocaleLowerCase();
      const contentMatches = Object.entries(LIGHT_CONTENT).filter(([path, markdown]) => {
        const isEntry = entry.id === "signs" ? path.includes("/introduction/signs/") : path.endsWith(`/${entry.id}.md`);
        return path.startsWith("en/") && isEntry && markdown.toLocaleLowerCase().includes(normalizedQuery);
      });
      if (!entryText.includes(normalizedQuery) && !contentMatches.length) return;
      const [matchedPath, markdown = ""] = contentMatches[0] || [];
      const matchingLine = markdown.split(/\r?\n/).map((line) => line.replace(/^#+\s*|[*_>`]/g, "").trim()).find((line) => line.toLocaleLowerCase().includes(normalizedQuery));
      const readerId = entry.id === "signs" && matchedPath ? matchedPath.split("/").pop().replace(".md", "") : null;
      results.push({ id: `page-${entry.id}-${readerId || "default"}`, heading: `${entry.section} · ${entry.title}`, excerpt: matchingLine || entry.description, kind: "page", entryId: entry.id, readerId });
    });

    return results.slice(0, 10);
  }, [entries, normalizedQuery]);

  const openResult = (result) => {
    setQuery("");
    setSearchFocused(false);
    if (result.kind === "commit") {
      setHighlightedCommit(result.hash);
      window.setTimeout(() => document.getElementById(`commit-${result.hash}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 40);
      window.setTimeout(() => setHighlightedCommit(null), 2100);
      return;
    }
    goRoute(`/light/${result.entryId}${result.readerId ? `/${result.readerId}` : ""}`, { highlight: normalizedQuery });
  };

  return (
    <main className={`history-page main-content fade-in ${leaving ? "is-leaving" : ""}`} data-lenis-prevent ref={pageRef}>
      <SiteChrome
        sections={DIRECTORY}
        currentView="history"
        buttonLabel="Directory"
        buttonTarget="/light"
        onNavigate={goRoute}
        showStructure={false}
      />

      <div className={`light-search-shell history-search-shell ${searchFocused && normalizedQuery ? "has-results" : ""}`} ref={searchRef}>
        <label className="light-search">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.4"/><path d="m16 16 4 4" fill="none" stroke="currentColor" strokeWidth="1.4"/></svg>
          <input type="search" value={query} onFocus={() => setSearchFocused(true)} onChange={(event) => { setQuery(event.target.value);setSearchFocused(true); }} onKeyDown={(event) => { if (event.key === "Escape") { setQuery("");setSearchFocused(false);event.currentTarget.blur(); } }} placeholder="Search the library" aria-label="Search the library" role="combobox" aria-expanded={Boolean(searchFocused && normalizedQuery)} aria-controls="history-search-results" />
          {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search">×</button>}
        </label>
        {searchFocused && normalizedQuery && <div className="light-search-results" id="history-search-results" role="listbox" data-lenis-prevent>
          <div className="light-search-results-heading"><span>Search results</span><small>{searchResults.length}</small></div>
          {searchResults.map((result, index) => <button className="light-search-result is-available" key={result.id} type="button" role="option" aria-selected="false" style={{ "--result-index": index }} onClick={() => openResult(result)}><strong>{result.heading}</strong><span>{result.excerpt}</span></button>)}
          {!searchResults.length && <p className="light-search-empty">No matching passages yet.</p>}
        </div>}
      </div>

      <div className="history-scroll-content" ref={contentRef}>
        <div className="history-content">
          <header className="history-hero">
            <p>Development record</p>
            <h1>Commit history</h1>
            <span>Every published change, dated in UTC and linked directly to its commit on GitHub.</span>
          </header>

          <LibraryJournal commits={SITE_COMMITS} highlightedHash={highlightedCommit} standalone title="Repository timeline" />
        </div>
      </div>
    </main>
  );
}
