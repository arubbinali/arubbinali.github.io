import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import SiteNav from "../components/SiteNav";
import MetalWordmark from "../components/MetalWordmark";
import SecondaryBackground from "../components/SecondaryBackground";
import "./gateway.css";
import "./software.css";
import "./software-clarity.css";

const WORKSPACE_VIEWS = {
  Assistant: { label: "ASSISTANT", title: "Say what you\nwant to open.", description: "Ask doaorel to find an app, website, or bookmark. Review the actions before anything launches.", rows: [["Open Discord for me", "Find the installed app or website"], ["Open Gmail on my work account", "Use the right browser profile"], ["Open Notepad, then Calendar", "Review a multi-step plan first"]] },
  Memory: { label: "PROJECT MEMORY", title: "Save the thread\nof your work.", description: "A context capsule keeps the checkpoint and next objective beside your project.", rows: [["Current context", "Branch, latest commit, changed files"], ["Your notes", "Decisions and reminders for next time"], ["Next objective", "The first thing to do when you return"]] },
  Resume: { label: "RESUME", title: "Return with\na plan.", description: "Create a named workflow for your project, review its steps, and reopen the tools you need.", rows: [["Open your IDE", "Start in the selected project"], ["Open a terminal", "Use the right folder"], ["Run a saved command", "Review before you launch"]] },
};
const CAPABILITIES = [["01", "Ask to open it", "Find installed apps, sites, and bookmarks in natural language, then review what will happen before launching."], ["02", "Know the project", "See Git status, recent commits, local changes, health checks, and the tools connected to each project."], ["03", "Keep your place", "Save a context capsule, notes, commands, and a Resume workflow so the next session has a starting point."], ["04", "See your rhythm", "Review locally recorded launches, work sessions, and tracked app time, all without a required cloud account."]];

export default function Software() {
  const [view, setView] = useState("Assistant");
  const [visibleView, setVisibleView] = useState("Assistant");
  const [viewExiting, setViewExiting] = useState(false);
  const visibleViewRef = useRef("Assistant");
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [demoHeight, setDemoHeight] = useState(null);
  const demoBodyRef = useRef(null);
  const demoArticleRef = useRef(null);
  const noticeRef = useRef(null);
  const noticeTriggerRef = useRef(null);
  const selected = WORKSPACE_VIEWS[visibleView];
  useEffect(() => { const previous = document.title; document.title = "Software | doaor"; return () => { document.title = previous; }; }, []);
  useEffect(() => { if (noticeOpen) noticeRef.current?.focus(); }, [noticeOpen]);
  useLayoutEffect(() => {
    const body = demoBodyRef.current;
    const article = demoArticleRef.current;
    if (!body || !article) return undefined;
    const measure = () => {
      const minimum = parseFloat(window.getComputedStyle(body).minHeight) || 0;
      setDemoHeight(Math.max(minimum, article.scrollHeight));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(article);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [visibleView]);
  useEffect(() => {
    if (view === visibleViewRef.current) {
      setViewExiting(false);
      return undefined;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      visibleViewRef.current = view;
      setVisibleView(view);
      return undefined;
    }
    setViewExiting(true);
    let frame;
    const timer = window.setTimeout(() => {
      visibleViewRef.current = view;
      setVisibleView(view);
      frame = window.requestAnimationFrame(() => setViewExiting(false));
    }, 260);
    return () => { window.clearTimeout(timer); window.cancelAnimationFrame(frame); };
  }, [view]);
  const openNotice = (event) => { noticeTriggerRef.current = event.currentTarget; setNoticeOpen(true); };
  const closeNotice = () => {
    setNoticeOpen(false);
    requestAnimationFrame(() => noticeTriggerRef.current?.focus({ preventScroll: true }));
  };
  return <main className="software-page">
    <div className="software-secondary-background" aria-hidden="true"><SecondaryBackground /></div>
    <SiteNav currentKey="software" />
    <header className="software-header"><a href="/" aria-label="doaor home" className="software-wordmark"><MetalWordmark font={'700 1.45rem/1 Montserrat, sans-serif'} /></a></header>
    <section className="software-hero"><div className="software-hero-copy"><p className="software-kicker">DOAOREL SOFTWARE</p><h1>Less restarting.<br /><span>More returning.</span></h1><p>Ask for the tool you need. Save where you left off. Come back to your projects with the context and the next step already waiting.</p><div className="software-hero-actions"><button type="button" onClick={openNotice}>Get early access <span>→</span></button><a className="software-discord-link" href="https://discord.gg/MhAPygZpQQ" target="_blank" rel="noopener noreferrer">Join Discord <span>↗</span></a><small>Windows first<br />Private preview in progress</small></div><p className="software-discord-note">Join the Discord server for launch dates, early-access updates, and a look at what’s coming next.</p></div><div className="software-orbit" aria-hidden="true"><i /><i /><i /><b>↗</b></div></section>
    <section className="software-showcase" aria-labelledby="workspace-title"><div className="software-showcase-copy"><p className="software-kicker">INSIDE DOAOREL</p><h2 id="workspace-title">A workspace that remembers.</h2><p>These previews reflect workflows in the running desktop app: asking it to open something, saving project context, and setting up your return.</p><div className="software-view-tabs" role="tablist" aria-label="Workspace previews">{Object.keys(WORKSPACE_VIEWS).map((name) => <button type="button" role="tab" aria-selected={view === name} key={name} onClick={() => setView(name)}>{name}</button>)}</div></div><div className="software-demo" aria-live="polite"><div className="software-demo-bar"><span /><span /><span /><b>doaorel desktop · feature preview</b></div><div className="software-demo-body" ref={demoBodyRef} style={demoHeight === null ? undefined : { height: demoHeight }}><aside><small>WORKSPACE</small>{Object.keys(WORKSPACE_VIEWS).map((name) => <span className={view === name ? "is-current" : ""} key={name}>{name}</span>)}<hr /><small>MORE TO EXPLORE</small><span>Projects</span><span>Activity</span></aside><article ref={demoArticleRef} className={viewExiting ? "is-exiting" : ""}><p>{selected.label}</p><h3>{selected.title.split("\n").map((line) => <React.Fragment key={line}>{line}<br /></React.Fragment>)}</h3><strong>{selected.description}</strong><div className="software-demo-list">{selected.rows.map(([name, detail]) => <div className="software-demo-row" key={name}><b>{name.slice(0, 1)}</b><span>{name}<small>{detail}</small></span></div>)}</div></article></div></div></section>
    <section className="software-capabilities" aria-labelledby="capabilities-title"><div className="software-section-heading"><p className="software-kicker">THE WORKSPACE, IN PRACTICE</p><h2 id="capabilities-title">A little less friction<br />every time you return.</h2></div><div className="software-capability-grid">{CAPABILITIES.map(([number, title, body]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{body}</p></article>)}</div></section>
    <section className="software-flow"><div><p className="software-kicker">A SIMPLE LOOP</p><h2>Leave work<br />easier to resume.</h2></div><ol><li><span>01</span><div><h3>Choose the project</h3><p>Find it in your workspace and check its Git status, recent commits, health, and notes.</p></div></li><li><span>02</span><div><h3>Save your context</h3><p>Capture your checkpoint, current changes, and the next objective in a project memory capsule.</p></div></li><li><span>03</span><div><h3>Return with a plan</h3><p>Review a saved Resume workflow, then reopen the editor, terminal, or command you need.</p></div></li></ol></section>
    <section className="software-closing"><p className="software-kicker">COMING TO WINDOWS FIRST</p><h2>Make room for<br />the work itself.</h2><div className="software-closing-actions"><button type="button" onClick={openNotice}>Get early access <span>→</span></button><a className="software-discord-link" href="https://discord.gg/MhAPygZpQQ" target="_blank" rel="noopener noreferrer">Join Discord <span>↗</span></a></div></section>
    <div className={`software-notice ${noticeOpen ? "is-open" : ""}`} aria-hidden={!noticeOpen}><button className="software-notice-backdrop" tabIndex={-1} onClick={closeNotice} aria-label="Close early access notice" /><section ref={noticeRef} tabIndex={noticeOpen ? -1 : undefined} role="dialog" aria-modal="true" aria-labelledby="early-access-title"><p className="software-kicker">EARLY ACCESS</p><h2 id="early-access-title">Not quite ready to ship.</h2><p>The first public build is still in the works. When it is ready, this will become the download. No abrupt redirects or links to hunt down.</p><button type="button" onClick={closeNotice}>Sounds good <span>→</span></button></section></div>
  </main>;
}
