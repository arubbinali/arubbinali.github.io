import React, { useEffect, useRef, useState } from "react";
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
}) {
  const [structureOpen, setStructureOpen] = useState(false);
  const [structurePinned, setStructurePinned] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setTheme] = useState(() => window.localStorage.getItem("doaor-theme") || "light");
  const [fontScale, setFontScale] = useState(() => Number(window.localStorage.getItem("doaor-font-scale")) || 100);
  const structureRef = useRef(null);
  const settingsRef = useRef(null);

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
      <ThemeParticleRain />
      {showStructure && <nav
        className={`site-structure ${structureOpen ? "is-open" : ""}`}
        ref={structureRef}
        onMouseEnter={() => setStructureOpen(true)}
        onMouseLeave={() => { if (!structurePinned) setStructureOpen(false); }}
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

        <div className="site-structure-panel">
          <header>
            <span>Site map</span>
            <small>{currentView === "reader" ? "You are here" : "Choose a path"}</small>
          </header>

          <button
            className={`site-structure-destination ${currentView === "directory" ? "is-current" : ""} ${buttonTarget === "/light" ? "is-next" : ""}`}
            type="button"
            onClick={() => choosePath("/light")}
          >
            <span>00</span><strong>Directory</strong><i>Overview</i>
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
                      <button className={isCurrent ? "is-current" : ""} key={entry.id} type="button" onClick={() => choosePath(`/light/${entry.id}`)}>
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
        <button className="site-settings-trigger" type="button" aria-label="Settings" aria-expanded={settingsOpen} onClick={() => setSettingsOpen((value) => !value)}>
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
          <section className="site-settings-group">
            <div className="site-settings-heading"><span>Language</span><small>Translations</small></div>
            <div className="site-language-settings">
              {SETTINGS_LANGUAGES.map((choice) => <button className={choice.available ? "is-selected" : "is-locked"} key={choice.id} type="button" disabled={!choice.available}><span>{choice.label}</span><small>{choice.available ? "Active" : "Soon"}</small></button>)}
            </div>
          </section>
        </div>
      </aside>
    </>
  );
}
