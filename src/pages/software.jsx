import React, { useEffect, useRef, useState } from "react";
import SiteNav from "../components/SiteNav";
import MetalWordmark from "../components/MetalWordmark";
import "./software.css";

const FEATURES = [
  ["01", "Your projects, together", "Discover projects in the folders you choose. Keep their languages, repositories, commands, and notes together, regardless of which IDE you use."],
  ["02", "A place to resume", "Return to a project with its recent activity and saved context. Choose whether Resume opens your IDE, terminal, command, or development URL."],
  ["03", "Your existing tools", "Use the editors and terminals you already know. Set a preferred IDE for each project and keep useful commands close at hand."],
  ["04", "Context that stays local", "Inspect Git information and keep project notes and activity on your computer. Core functionality is designed to work offline, without an account."],
];

export default function Software() {
  const download = useRef(null);
  const notice = useRef(null);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  useEffect(() => { const previous = document.title; document.title = "Software — doaor"; return () => { document.title = previous; }; }, []);
  useEffect(() => {
    if (noticeOpen) notice.current?.focus();
  }, [noticeOpen]);
  const closeNotice = () => { setNoticeOpen(false); requestAnimationFrame(() => download.current?.focus()); };
  return <main className="software-page">
    <SiteNav currentKey="software"/>
    <header className="software-header"><a href="/" className="software-wordmark"><MetalWordmark font={'700 1.45rem/1 "Montserrat Alternates", "Century Gothic", sans-serif'} /></a></header>
    <section className="software-hero">
      <div className="software-hero-copy"><p className="software-eyebrow">DOAOR DESKTOP WORKSPACE</p><h1>Your work.<br/><span>Ready when you are.</span></h1><p className="software-lede">A calmer home for the projects, tools, and loose ends you need to pick work back up without the usual reset.</p><div className="software-download-row"><button ref={download} className="software-download" onClick={() => setNoticeOpen(true)}>Get early access <span aria-hidden="true">→</span></button><span>Windows first<br/><small>Private preview in progress</small></span></div></div>
      <div className="software-window" aria-label="Software preview"><div className="software-window-bar"><i/><i/><i/><span>doaor / workspace</span></div><div className="software-window-body"><aside><b>WORKSPACE</b><span className="is-active">Projects</span><span>Recent activity</span><span>Saved commands</span></aside><div className="software-window-main"><p>WELCOME BACK</p><h2>Resume without<br/>reconstructing.</h2><div><span>r/rrd</span><em>Continue →</em></div><div><span>portfolio</span><em>Open in VS Code →</em></div></div></div></div>
    </section>
    <section className="software-description" aria-labelledby="software-workflow"><p className="software-eyebrow">BUILT AROUND CONTINUITY</p><h2 id="software-workflow">The details you need,<br/>still where you left them.</h2><p>Select a capability to preview the role it will play in your everyday flow.</p></section>
    <section className="software-features" aria-label="Planned capabilities">{FEATURES.map(([number,title,description], index) => <button type="button" className={activeFeature === index ? "is-active" : ""} key={number} onClick={() => setActiveFeature(index)}><span>{number}</span><div><h3>{title}</h3><p>{description}</p><small>{activeFeature === index ? "Currently exploring" : "Explore capability"} <b>→</b></small></div></button>)}</section>
    <section className="software-status"><div><p className="software-eyebrow">FIRST RELEASE</p><h2>Built for the<br/>way you actually work.</h2><p>Projects, IDE preferences, Git context, commands, local activity, and Resume are coming together in the first desktop workflow.</p></div><ol><li><span>01</span><div><b>Choose a project</b><p>See the useful context at a glance.</p></div></li><li><span>02</span><div><b>Pick up the thread</b><p>Open the right tool or run the next command.</p></div></li><li><span>03</span><div><b>Leave a clear return point</b><p>Come back with less friction.</p></div></li></ol></section>
    <div className={`software-notice ${noticeOpen ? "is-open" : ""}`} aria-hidden={!noticeOpen}><button className="software-notice-backdrop" tabIndex={-1} onClick={closeNotice} aria-label="Close early access notice"/><section ref={notice} tabIndex={noticeOpen ? -1 : undefined} role="dialog" aria-modal="true" aria-labelledby="early-access-title"><p className="software-eyebrow">EARLY ACCESS</p><h2 id="early-access-title">Not quite ready to ship.</h2><p>The first public build is still in the works. This button will become the download when it is ready—no surprise detours.</p><button type="button" onClick={closeNotice}>Sounds good <span>→</span></button></section></div>
  </main>;
}
