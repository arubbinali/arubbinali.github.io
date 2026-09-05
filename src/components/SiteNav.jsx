import React, { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./siteNav.css";

const MAIN_LINKS = [
  { key: "home", title: "Home", path: "/" },
  { key: "light", title: "Directory", path: "/light" },
  { key: "history", title: "Commit history", path: "/history" },
  { key: "about", title: "About", path: "/about" },
];

const PORTFOLIO_LINKS = [
  { key: "works-home", title: "Home", path: "/works/" },
  { key: "projects", title: "Projects", path: "/works/projects.html" },
  { key: "docs", title: "Docs", path: "/works/docs.html" },
  { key: "certifications", title: "Certifications", path: "/works/certifications.html" },
  { key: "learningsources", title: "Learning Sources", path: "/works/learningsources.html" },
  { key: "about-portfolio", title: "About", path: "/works/about.html" },
];

const PORTFOLIO_KEY_ALIASES = { home: "works-home", about: "about-portfolio" };

export default function SiteNav({ site = "main", currentKey = "", onNavigate }) {
  const navigate = useNavigate();
  const activeKey = site === "works" ? (PORTFOLIO_KEY_ALIASES[currentKey] ?? currentKey) : currentKey;
  const navId = useId();
  const toggleRef = useRef(null);
  const navRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState({ main:false, portfolio:false });
  const hoverTimers = useRef({});
  useEffect(() => () => Object.values(hoverTimers.current).forEach(clearTimeout), []);

  useEffect(() => {
    document.body.classList.add("has-site-nav");
    return () => document.body.classList.remove("has-site-nav");
  }, []);

  useEffect(() => {
    document.body.classList.toggle("is-considering", open);
    return () => document.body.classList.remove("is-considering");
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        setOpen(false);
        toggleRef.current?.focus({ preventScroll: true });
        return;
      }
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus({ preventScroll: true });
      }
      if (event.key !== "Tab") return;

      const controls = [
        toggleRef.current,
        ...navRef.current.querySelectorAll("button, a[href]"),
      ].filter((element) => element && !element.closest("[inert]"));
      const first = controls[0];
      const last = controls[controls.length - 1];
      const active = document.activeElement;

      if (!controls.includes(active) || (event.shiftKey ? active === first : active === last)) {
        event.preventDefault();
        (event.shiftKey ? last : first)?.focus();
      }
    };
    // Restore a visible focus target before the command palette records its return target.
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [open]);

  const go = (path) => {
    setOpen(false);
    if (onNavigate) onNavigate(path);
    else navigate(path);
  };

  const expandSection = (section) => {
    clearTimeout(hoverTimers.current[section]);
    setExpanded((prev) => ({ ...prev, [section]: true }));
  };
  const collapseSection = (section) => {
    clearTimeout(hoverTimers.current[section]);
    hoverTimers.current[section] = setTimeout(() => setExpanded((prev) => ({ ...prev, [section]:false })), 180);
  };
  const sectionEvents = (section) => ({
    onMouseEnter: () => expandSection(section),
    onMouseLeave: () => collapseSection(section),
    onFocus: () => expandSection(section),
    onBlur: (event) => { if (!event.currentTarget.contains(event.relatedTarget)) collapseSection(section); },
  });

  const renderLinks = (links, startIndex = 0) => (
    <div>
      {links.map((link, index) => (
        <a
          className={link.key === activeKey ? "is-current" : ""}
          aria-current={link.key === activeKey ? "page" : undefined}
          href={link.path}
          key={link.key}
          onClick={(event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
            event.preventDefault();
            if (link.key !== activeKey) go(link.path);
            else {
              setOpen(false);
              toggleRef.current?.focus({ preventScroll: true });
            }
          }}
        >
          <small>{String(index + 1 + startIndex).padStart(2, "0")}</small>
          <span>{link.title}</span>
        </a>
      ))}
    </div>
  );

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        className={`site-nav-toggle ${open ? "is-open" : ""}`}
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        aria-controls={navId}
        onClick={() => setOpen((value) => !value)}
      >
        <span />
        <span />
        <span />
      </button>
      <button
        type="button"
        className={`site-nav-backdrop ${open ? "is-open" : ""}`}
        aria-label="Close navigation"
        aria-hidden="true"
        tabIndex={-1}
        data-lenis-prevent
        onClick={() => {
          setOpen(false);
          toggleRef.current?.focus({ preventScroll: true });
        }}
      />
      <nav ref={navRef} id={navId} className={`site-nav ${open ? "is-open" : ""}`} aria-label="Site pages" aria-hidden={!open} inert={!open} data-lenis-prevent>
        <header>
          <small>doaor.com</small>
          <strong>Navigation</strong>
          <span>Every corner of doaor, one tap away.</span>
        </header>

        <div className="site-nav-sections">
          <div className={`site-nav-section ${expanded.main ? "is-expanded" : ""}`} {...sectionEvents("main")}>
            <button
              type="button"
              className="site-nav-section-header"
              onPointerDown={(event) => { if (event.pointerType === "mouse") event.preventDefault(); else expandSection("main"); }}
              aria-expanded={expanded.main}
              aria-controls={`${navId}-main`}
            >
              <span className="site-nav-section-title">The main site</span>
              <span className="site-nav-section-chevron" />
            </button>
            <div id={`${navId}-main`} className="site-nav-section-body" aria-hidden={!expanded.main} inert={!expanded.main}>
              {renderLinks(MAIN_LINKS, 0)}
            </div>
          </div>

          <div className={`site-nav-section ${expanded.portfolio ? "is-expanded" : ""}`} {...sectionEvents("portfolio")}>
            <button
              type="button"
              className="site-nav-section-header"
              onPointerDown={(event) => { if (event.pointerType === "mouse") event.preventDefault(); else expandSection("portfolio"); }}
              aria-expanded={expanded.portfolio}
              aria-controls={`${navId}-portfolio`}
            >
              <span className="site-nav-section-title">Portfolio</span>
              <span className="site-nav-section-chevron" />
            </button>
            <div id={`${navId}-portfolio`} className="site-nav-section-body" aria-hidden={!expanded.portfolio} inert={!expanded.portfolio}>
              {renderLinks(PORTFOLIO_LINKS, MAIN_LINKS.length)}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
