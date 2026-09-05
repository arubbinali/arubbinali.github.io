import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./siteChrome.css";
import { ThemeParticleRain } from "./ThemeParticleRain";

const THEMES = [
  { id: "dark", label: "Dark", note: "The original" },
  { id: "light", label: "Light", note: "Paper and ink" },
  { id: "stillwater", label: "Stillwater", note: "Calm blue dusk" },
  { id: "sepia", label: "Sepia", note: "Warm parchment" },
  { id: "sage", label: "Sage", note: "Quiet forest" },
  { id: "aubergine", label: "Aubergine", note: "Soft violet night" },
];

const SETTINGS_LANGUAGES = [
  { id: "en", label: "English", available: true },
  { id: "ar", label: "العربية", available: false },
  { id: "zh", label: "中文", available: false },
  { id: "ja", label: "日本語", available: false },
];

export function SiteChrome({
  sections,
  currentEntryId = null,
  currentReaderId = null,
  currentView = "home",
  buttonLabel = "Structure",
  buttonTarget = null,
  onNavigate,
  showStructure = true,
  directoryPath = "/light",
  entryBasePath = "/light",
  structureRootLabel = "Directory",
  structureFeature = null,
  navigationCommands = null,
  pinnedCommand = null,
  includeReadingModes = true,
}) {
  const [structureOpen, setStructureOpen] = useState(false);
  const [structurePinned, setStructurePinned] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setTheme] = useState(() => window.localStorage.getItem("doaor-theme") || "dark");
  const [fontScale, setFontScale] = useState(104);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteClosing, setPaletteClosing] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [paletteKeyboardMoved, setPaletteKeyboardMoved] = useState(false);
  const [online, setOnline] = useState(() => navigator.onLine);
  const structureRef = useRef(null);
  const settingsRef = useRef(null);
  const paletteInputRef = useRef(null);
  const paletteCloseTimerRef = useRef(null);
  const paletteScrollRef = useRef({ element: null, top: 0 });
  const paletteReturnFocusRef = useRef(null);

  const openPalette = useCallback(() => {
    window.clearTimeout(paletteCloseTimerRef.current);
    const pageScroller = document.querySelector(".light-page");
    const scrollElement = pageScroller && pageScroller.scrollHeight > pageScroller.clientHeight
      ? pageScroller
      : document.scrollingElement;
    paletteScrollRef.current = { element: scrollElement, top: scrollElement?.scrollTop || 0 };
    paletteReturnFocusRef.current = document.activeElement;
    setPaletteIndex(0);
    setPaletteKeyboardMoved(false);
    setPaletteQuery("");
    setPaletteClosing(false);
    setPaletteOpen(true);
  }, []);

  const closePalette = useCallback((afterClose) => {
    if (!paletteOpen || paletteClosing) return;
    setPaletteClosing(true);
    window.clearTimeout(paletteCloseTimerRef.current);
    paletteCloseTimerRef.current = window.setTimeout(() => {
      setPaletteOpen(false);
      setPaletteClosing(false);
      setPaletteQuery("");
      paletteReturnFocusRef.current?.focus?.({ preventScroll: true });
      const { element, top } = paletteScrollRef.current;
      if (element && Math.abs(element.scrollTop - top) > 1) {
        element.scrollTo({ top, left: 0, behavior: "auto" });
      }
      afterClose?.();
    }, 360);
  }, [paletteClosing, paletteOpen]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("doaor-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty("--user-font-scale", `${fontScale}%`);
    window.localStorage.setItem("doaor-font-scale", String(fontScale));
  }, [fontScale]);

  useEffect(() => {
    const close = (event) => {
      if (!structureRef.current?.contains(event.target)) { setStructureOpen(false); setStructurePinned(false); }
      if (!settingsRef.current?.contains(event.target)) setSettingsOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update); window.addEventListener("offline", update);
    return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); };
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); paletteOpen ? closePalette() : openPalette(); return; }
      if (event.key === "Escape" && paletteOpen) { event.preventDefault(); closePalette(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closePalette, openPalette, paletteOpen]);

  useEffect(() => {
    if (!paletteOpen || paletteClosing) return undefined;
    const timer = window.setTimeout(() => paletteInputRef.current?.focus({ preventScroll: true }), 40);
    return () => window.clearTimeout(timer);
  }, [paletteClosing, paletteOpen]);

  useEffect(() => () => window.clearTimeout(paletteCloseTimerRef.current), []);

  const savedBookmarkKey = paletteOpen ? window.localStorage.getItem("doaor-bookmarks") || "[]" : "[]";
  const paletteCommands = useMemo(() => {
    const pages = sections.flatMap((section) => section.entries.filter((entry) => entry.id !== currentEntryId).map((entry) => ({ id: `page-${entry.id}`, group: section.title, label: entry.title, hint: "Open page", run: () => onNavigate(`${entryBasePath}/${entry.id}`) })));
    let savedIds = [];
    try { savedIds = JSON.parse(savedBookmarkKey) || []; } catch { savedIds = []; }
    const savedPages = [...new Set(savedIds.map((id) => id.split(":")[0]))].map((id) => sections.flatMap((section) => section.entries).find((entry) => entry.id === id)).filter((entry) => entry && entry.id !== currentEntryId).map((entry) => ({ id: `saved-${entry.id}`, group: "Saved readings", label: entry.title, hint: "Bookmarked on this device", run: () => onNavigate(`${entryBasePath}/${entry.id}`) }));
    const themes = THEMES.filter((choice) => choice.id !== theme).map((choice) => ({ id: `theme-${choice.id}`, group: "Themes", label: `${choice.label} theme`, hint: choice.note, run: () => setTheme(choice.id) }));
    const modes = includeReadingModes ? ["focus", "study", "sources"].map((mode) => ({ id: `mode-${mode}`, group: "Reading modes", label: `${mode[0].toUpperCase()}${mode.slice(1)} mode`, hint: "Change the reader", run: () => { window.localStorage.setItem("doaor-reading-mode", mode); window.dispatchEvent(new CustomEvent("doaor:reading-mode", { detail: mode })); } })) : [];
    const defaultNavigation = [
      { id: "nav-home", group: "Navigation", label: "Home", hint: "Root page", run: () => onNavigate("/") },
      { id: "nav-directory", group: "Navigation", label: "Directory", hint: "Browse every page", run: () => onNavigate(directoryPath) },
      { id: "nav-history", group: "Navigation", label: "Commit history", hint: "Published changes and GitHub commits", run: () => onNavigate("/history") },
      { id: "nav-about", group: "Navigation", label: "About", hint: "About doaor", run: () => onNavigate("/about") },
    ].filter((command) => !((currentView === "home" && command.id === "nav-home") || (currentView === "directory" && command.id === "nav-directory") || (currentView === "history" && command.id === "nav-history") || (currentView === "about" && command.id === "nav-about")));
    const navigation = navigationCommands || defaultNavigation;
    return [
      ...navigation,
      { id: "open-settings", group: "Actions", label: "Open settings", hint: "Theme, type, language", run: () => setSettingsOpen(true) },
      ...savedPages, ...pages, ...themes, ...modes,
    ];
  }, [currentEntryId, currentView, directoryPath, entryBasePath, includeReadingModes, navigationCommands, onNavigate, savedBookmarkKey, sections, theme]);

  const filteredCommands = useMemo(() => {
    const query = paletteQuery.trim().toLowerCase();
    if (!query) return [...(pinnedCommand ? [pinnedCommand] : []), ...paletteCommands].slice(0, 14);
    return paletteCommands.map((command) => ({ command, score: command.label.toLowerCase().startsWith(query) ? 0 : command.label.toLowerCase().includes(query) ? 1 : command.group.toLowerCase().includes(query) ? 2 : 9 })).filter(({ score }) => score < 9).sort((a, b) => a.score - b.score).map(({ command }) => command).slice(0, 18);
  }, [paletteCommands, paletteQuery, pinnedCommand]);

  useEffect(() => setPaletteIndex(0), [paletteQuery, paletteOpen]);

  const runPaletteCommand = (command) => { if (!command) return; closePalette(command.run); };

  const choosePath = (path) => {
    setStructureOpen(false);
    setStructurePinned(false);
    onNavigate(path);
  };

  const activateStructure = () => {
    const canHover = window.matchMedia?.("(hover: hover)").matches;
    if (buttonTarget && (canHover || structurePinned)) {
      onNavigate(buttonTarget);
      return;
    }
    setStructurePinned(true);
    setStructureOpen(true);
  };

  return (
    <>
      {createPortal(<ThemeParticleRain subdued={paletteOpen} />, document.body)}
      {showStructure && <nav
        className={`site-structure ${structureOpen ? "is-open" : ""}`}
        ref={structureRef}
        onMouseEnter={() => setStructureOpen(true)}
        onMouseLeave={() => { if (!structurePinned) setStructureOpen(false); }}
        onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) { setStructureOpen(false); setStructurePinned(false); } }}
        aria-label="Website structure"
      >
        <button
          className="site-structure-trigger"
          type="button"
          aria-expanded={structureOpen}
          onClick={activateStructure}
          onFocus={() => setStructureOpen(true)}
        >
          <span aria-hidden="true">⌘</span>
          {buttonLabel}
        </button>

        <div className="site-structure-panel" data-lenis-prevent tabIndex="0" onWheel={(event) => event.stopPropagation()}>
          <header>
            <span>Site map</span>
            <small>{currentView === "reader" ? "You are here" : "Choose a path"}</small>
          </header>

          {structureFeature && <button className="site-structure-destination is-featured" type="button" onClick={() => choosePath(structureFeature.path)}>
            <span>{structureFeature.symbol || "∞"}</span><strong>{structureFeature.label}</strong><i>{structureFeature.hint || "Open"}</i>
          </button>}

          <button
            className={`site-structure-destination ${currentView === "directory" ? "is-current" : ""} ${buttonTarget === "/light" ? "is-next" : ""}`}
            type="button"
            onClick={() => choosePath(directoryPath)}
          >
            <span>00</span><strong>{structureRootLabel}</strong><i>Overview</i>
          </button>

          <div className="site-structure-tree">
            {sections.map((section, sectionIndex) => (
              <section key={section.id}>
                <div className="site-structure-category">
                  <span>{String(sectionIndex + 1).padStart(2, "0")}</span>
                  <strong>{section.title}</strong>
                </div>
                <div className="site-structure-entries">
                  {section.entries.map((entry) => {
                    const isCurrent = currentEntryId === entry.id;
                    return (
                      <button className={isCurrent ? "is-current" : ""} key={entry.id} type="button" onClick={() => choosePath(`${entryBasePath}/${entry.id}`)}>
                        <i aria-hidden="true" />
                        <span>{entry.title}</span>
                        {isCurrent && <small>{entry.id === "signs" && currentReaderId ? currentReaderId : "Here"}</small>}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </nav>}

      {!showStructure && buttonTarget && (
        <button className="site-simple-back" type="button" onClick={() => onNavigate(buttonTarget)}>
          <span aria-hidden="true">⌘</span>{buttonLabel}
        </button>
      )}

      <aside
        className={`site-settings ${settingsOpen ? "is-open" : ""}`}
        ref={settingsRef}
        onMouseEnter={() => setSettingsOpen(true)}
        onMouseLeave={() => setSettingsOpen(false)}
      >
        <button className="site-settings-trigger" type="button" aria-label="Settings" aria-expanded={settingsOpen} onClick={() => setSettingsOpen(true)}>
          <svg className="site-settings-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7Zm7.43-2.53c.04-.32.07-.65.07-.97s-.03-.66-.07-.98l2.11-1.65a.5.5 0 0 0 .12-.64l-2-3.46a.5.5 0 0 0-.61-.22l-2.49 1a7.04 7.04 0 0 0-1.67-.98l-.38-2.65A.49.49 0 0 0 14 2h-4a.49.49 0 0 0-.49.42l-.38 2.65c-.61.25-1.17.59-1.67.98l-2.49-1a.5.5 0 0 0-.61.22l-2 3.46a.49.49 0 0 0 .12.64l2.11 1.65c-.04.32-.07.66-.07.98s.03.65.07.97l-2.11 1.65a.5.5 0 0 0-.12.64l2 3.46a.5.5 0 0 0 .61.22l2.49-1c.5.4 1.06.73 1.67.98l.38 2.65c.05.24.26.42.49.42h4c.24 0 .44-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.67-.98l2.49 1a.5.5 0 0 0 .61-.22l2-3.46a.5.5 0 0 0-.12-.64l-2.11-1.65Z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span>Settings</span>
        </button>
        <div className="site-settings-panel">
          <header><span>Settings</span><button type="button" onClick={() => setSettingsOpen(false)} aria-label="Close settings">×</button></header>
          <section className="site-settings-group">
            <div className="site-settings-heading"><span>Theme</span><small>Saved automatically</small></div>
            <div className="site-theme-grid">
              {THEMES.map((choice) => (
                <button className={theme === choice.id ? "is-selected" : ""} key={choice.id} type="button" onClick={() => setTheme(choice.id)}>
                  <i className={`theme-swatch theme-${choice.id}`} aria-hidden="true" />
                  <span><strong>{choice.label}</strong><small>{choice.note}</small></span>
                  <b aria-hidden="true">{theme === choice.id ? "●" : ""}</b>
                </button>
              ))}
            </div>
          </section>
          <section className="site-settings-group">
            <div className="site-settings-heading"><span>Font size</span><small>{Math.round(fontScale)}%</small></div>
            <div className="site-font-slider">
              <span aria-hidden="true">A</span>
              <input aria-label="Font size" type="range" min="82" max="125" step="0.1" value={fontScale} onChange={(event) => setFontScale(Number(event.target.value))} />
              <strong aria-hidden="true">A</strong>
            </div>
          </section>
          {!currentView.startsWith("works") && (
            <section className="site-settings-group">
              <div className="site-settings-heading"><span>Language</span><small>Translations</small></div>
              <div className="site-language-settings">
                {SETTINGS_LANGUAGES.map((choice) => <button className={choice.available ? "is-selected" : "is-locked"} key={choice.id} type="button" disabled={!choice.available}><span>{choice.label}</span><small>{choice.available ? "Active" : "Soon"}</small></button>)}
              </div>
            </section>
          )}
        </div>
      </aside>

      <button className={`site-command-trigger ${currentView === "reader" ? "is-reader" : ""}`} type="button" onClick={openPalette} aria-label="Open command palette"><span>⌘</span><b>K</b><em>Navigate</em></button>
      {!online && <div className="site-network-status" role="status"><i /> Offline library</div>}
      {paletteOpen && createPortal(<div className={`site-command-backdrop ${paletteClosing ? "is-closing" : ""}`} role="presentation" data-lenis-prevent onWheel={(event) => event.stopPropagation()} onMouseDown={(event) => { if (event.target === event.currentTarget) closePalette(); }}>
        <section className="site-command-palette" role="dialog" aria-modal="true" aria-label="Command palette">
          <label><span aria-hidden="true">⌕</span><input ref={paletteInputRef} value={paletteQuery} onChange={(event) => { setPaletteQuery(event.target.value); setPaletteKeyboardMoved(false); }} onKeyDown={(event) => { if (event.key === "ArrowDown") { event.preventDefault(); setPaletteKeyboardMoved(true); setPaletteIndex((index) => Math.min(index + 1, filteredCommands.length - 1)); } if (event.key === "ArrowUp") { event.preventDefault(); setPaletteKeyboardMoved(true); setPaletteIndex((index) => Math.max(index - 1, 0)); } if (event.key === "Enter") { event.preventDefault(); if (paletteQuery.trim() || paletteKeyboardMoved) runPaletteCommand(filteredCommands[paletteIndex]); } }} placeholder="Go anywhere, change a theme, enter a reading mode…" aria-label="Search commands"/><kbd>ESC</kbd></label>
          <div className="site-command-results" data-lenis-prevent>{filteredCommands.map((command, index) => <button className={index === paletteIndex ? "is-active" : ""} key={command.id} type="button" onMouseMove={() => setPaletteIndex(index)} onClick={() => runPaletteCommand(command)}><span><small>{command.group}</small><strong>{command.label}</strong></span><em>{command.hint}</em><i>↗</i></button>)}{!filteredCommands.length && <p>No matching command. Try a page title, theme, or reading mode.</p>}</div>
          <footer><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>↵</kbd> open</span></footer>
        </section>
      </div>, document.body)}
    </>
  );
}
