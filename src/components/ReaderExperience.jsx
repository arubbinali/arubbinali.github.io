import React, { Fragment, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import "./readerExperience.css";

const REPOSITORY_URL = "https://github.com/arubbinali/arubbinali.github.io";

const GLOSSARY = {
  allah: "The Arabic proper name for God: the one Creator, without partner.",
  quraan: "The revealed scripture of Islam, recited in Arabic and preserved through mass transmission.",
  quran: "The revealed scripture of Islam, recited in Arabic and preserved through mass transmission.",
  tawhid: "The absolute oneness of Allah in His lordship, worship, names, and attributes.",
  hadith: "A transmitted report describing a saying, action, or approval of Prophet Muhammad.",
  isnad: "The chain of people through whom a report was transmitted.",
  sunnah: "The recorded teachings and practice of Prophet Muhammad.",
  shahada: "The testimony that none deserves worship except Allah and Muhammad is His messenger.",
};

export function glossify(children, path = "g") {
  return React.Children.map(children, (child, index) => {
    if (typeof child !== "string") {
      if (!React.isValidElement(child) || !child.props?.children) return child;
      return React.cloneElement(child, { ...child.props, children: glossify(child.props.children, `${path}-${index}`) });
    }
    const terms = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length).join("|");
    return child.split(new RegExp(`\\b(${terms})\\b`, "gi")).map((piece, pieceIndex) => {
      const definition = GLOSSARY[piece.toLowerCase()];
      return definition
        ? <span className="reader-glossary-term" data-definition={definition} key={`${path}-${index}-${pieceIndex}`} tabIndex="0">{piece}</span>
        : <Fragment key={`${path}-${index}-${pieceIndex}`}>{piece}</Fragment>;
    });
  });
}

function Commit({ commit, index, highlighted = false }) {
  return (
    <article className={highlighted ? "is-highlighted" : ""} id={`commit-${commit.hash}`} style={{ "--commit-index": index }}>
      <i />
      <div>
        <a href={`${REPOSITORY_URL}/commit/${commit.hash}`} target="_blank" rel="noreferrer">{commit.message}</a>
        <span>{new Date(commit.date).toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC", timeZoneName: "short" })}</span>
      </div>
      <a className="library-commit-hash" href={`${REPOSITORY_URL}/commit/${commit.hash}`} target="_blank" rel="noreferrer">{commit.hash}</a>
    </article>
  );
}

export function LibraryJournal({ commits, standalone = false, title = "Library journal", highlightedHash = null }) {
  const [expanded, setExpanded] = useState(standalone);
  const primary = commits.slice(0, 4);
  const history = commits.slice(4);
  return (
    <section className={`library-journal ${expanded ? "is-expanded" : ""}`} id="editorial-journal">
      <header>
        <div><small>Development history</small><h2>{title}</h2></div>
        <div className="library-journal-actions">
          <a href={REPOSITORY_URL} target="_blank" rel="noreferrer">GitHub repository ↗</a>
          {!standalone && history.length > 0 && <button type="button" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>{expanded ? "Show less" : "Full history"}</button>}
        </div>
      </header>
      <p className="library-journal-intro">A transparent record of what changed and when it changed. Select any commit to inspect the exact code changes on GitHub.</p>
      <div className="library-commit-list library-commit-primary">
        {primary.map((commit, index) => <Commit commit={commit} highlighted={highlightedHash === commit.hash} index={index} key={`${commit.hash}-${commit.date}`} />)}
        {!commits.length && <p>No published update records yet.</p>}
      </div>
      {history.length > 0 && <div className="library-commit-reveal" aria-hidden={!expanded}>
        <div className="library-commit-reveal-inner">
          <div className="library-commit-list library-commit-history">
            {history.map((commit, index) => <Commit commit={commit} highlighted={highlightedHash === commit.hash} index={index} key={`${commit.hash}-${commit.date}`} />)}
          </div>
        </div>
      </div>}
    </section>
  );
}

export function ReaderExperience({ entry, sections, onNavigate, content }) {
  const [progress, setProgress] = useState(0);
  const [headings, setHeadings] = useState([]);
  const related = useMemo(() => {
    const currentSection = sections.find((section) => section.entries.some((candidate) => candidate.id === entry.id));
    const nearby = currentSection?.entries.filter((candidate) => candidate.id !== entry.id) || [];
    const others = sections.flatMap((section) => section.entries).filter((candidate) => candidate.id !== entry.id && !nearby.some((item) => item.id === candidate.id));
    return [...nearby, ...others].slice(0, 3);
  }, [entry.id, sections]);

  useEffect(() => {
    const collect = () => setHeadings([...document.querySelectorAll(".light-reading-inner > h2")].map((node, index) => ({ id: `reader-section-${index}`, title: node.textContent, node })));
    const update = () => {
      const scrollContainer = document.querySelector(".light-page");
      if (!scrollContainer) return;
      const distance = Math.max(0, scrollContainer.scrollHeight - scrollContainer.clientHeight);
      setProgress(distance <= 1 ? 100 : Math.max(0, Math.min(100, (scrollContainer.scrollTop / distance) * 100)));
    };
    const timer = window.setTimeout(collect, 80);
    const scrollContainer = document.querySelector(".light-page");
    update();
    window.addEventListener("scroll", update, { passive: true });
    scrollContainer?.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.clearTimeout(timer); window.removeEventListener("scroll", update); scrollContainer?.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [content, entry.id]);

  return (
    <>
      {createPortal(<aside className="reader-progress" aria-label={`Reading progress ${Math.round(progress)} percent`}>
        <span>{String(Math.round(progress)).padStart(2,"0")}</span><div><i style={{ height: `${progress}%` }} />{headings.map((heading, index) => <button key={heading.id} type="button" aria-label={`Jump to ${heading.title}`} style={{ top: `${((index + 1) / (headings.length + 1)) * 100}%` }} onClick={() => heading.node.scrollIntoView({ behavior: "smooth", block: "start" })} />)}</div>
      </aside>, document.body)}
      <section className="reader-related" aria-label="Related readings">
        <header><small>Continue through the library</small><h2>Related paths</h2></header>
        <div>{related.map((item, index) => <button type="button" key={item.id} onClick={() => onNavigate(`/light/${item.id}`)}><span>{String(index + 1).padStart(2,"0")}</span><strong>{item.title}</strong><i>↗</i></button>)}</div>
      </section>
    </>
  );
}
