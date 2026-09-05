import React, { memo, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Lenis from "lenis";
import "../App.css";
import "./works.css";
import IntroAnimation from "../components/intro";
import SiteNav from "../components/SiteNav";
import SearchResults from "../components/SearchResults";
import AnimatedDetails, { DetailsRevealed } from "../components/AnimatedDetails";
import VirtualCode from "../components/VirtualCode";
import ShinyText from "../components/ShinyText";
import { SiteChrome } from "../components/SiteChrome";
import { WORKS_CODE_SNIPPETS } from "../generated/worksData";

const LEGACY_ROOT = "https://doaor.com/d";
const legacyAsset = (path) => `${LEGACY_ROOT}/${path.replace(/^\/+/, "")}`;

const WORKS_PAGES = [
  { id: "projects.html", key: "projects", title: "Projects", summary: "Selected work, prototypes, and deployed builds." },
  { id: "docs.html", key: "docs", title: "Docs", summary: "Source code and technical documentation." },
  { id: "certifications.html", key: "certifications", title: "Certifications", summary: "Professional credentials and learning milestones." },
  { id: "learningsources.html", key: "learningsources", title: "Learning Sources", summary: "The tools and places that shaped how I build." },
  { id: "about.html", key: "about", title: "About", summary: "About the portfolio and the person behind it." },
];

const WORKS_DIRECTORY = [
  { id: "portfolio", title: "Portfolio", entries: WORKS_PAGES.slice(0, 4) },
  { id: "profile", title: "Profile", entries: WORKS_PAGES.slice(4) },
];

const CERTIFICATIONS = [
  { id: "ibm", short: "IBM AI Dev", title: "IBM AI Developer Professional Certificate", issuer: "IBM · Coursera", date: "February 2026", image: legacyAsset("img/ibm.png"), href: "https://www.coursera.org/account/accomplishments/specialization/certificate/KZ08H9YHRFNF", body: "A beginner-friendly, career-focused program covering artificial intelligence, generative AI, Python, Flask, IBM Watson services, hands-on labs, chatbots, and practical AI-powered applications." },
  { id: "pcap", short: "PCAP", title: "PCAP – Certified Associate Python Programmer", issuer: "Python Institute", date: "August 2024", image: legacyAsset("img/pcap.png"), href: "https://www.credly.com/badges/fe90d652-5440-431e-ae78-8781988a27a7", body: "An intermediate Python credential focused on object-oriented programming, modules, exception handling, and advanced language features." },
  { id: "pcep", short: "PCEP", title: "PCEP – Certified Entry-Level Python Programmer", issuer: "Python Institute", date: "July 2023", image: legacyAsset("img/pcep.png"), href: "https://www.credly.com/badges/3c618000-5b62-40a0-96db-f98c1a3b77bd", body: "A foundational Python credential covering data types, functions, control flow, and exception handling." },
];

const LEARNING_GROUPS = [
  { title: "Languages", items: [["Python", "https://www.python.org"], ["Tkinter", "https://docs.python.org/3/library/tkinter.html"], ["CustomTkinter", "https://github.com/TomSchimansky/CustomTkinter"], ["SQL", "https://www.mysql.com"], ["HTML", "https://www.w3schools.com/html/"], ["CSS", "https://www.w3schools.com/css/"], ["JavaScript", "https://www.javascript.com"], ["Java", "https://www.java.com"], ["C", "https://en.wikipedia.org/wiki/C_programming_language"], ["C++", "https://en.wikipedia.org/wiki/C%2B%2B"]] },
  { title: "Websites & platforms", items: [["GitHub", "https://github.com"], ["Python Institute", "https://pythoninstitute.org"], ["Edube", "https://edube.org"], ["Stack Overflow", "https://stackoverflow.com"], ["GeeksforGeeks", "https://www.geeksforgeeks.org"], ["W3Schools", "https://www.w3schools.com"], ["Khan Academy", "https://www.khanacademy.org"], ["LeetCode", "https://leetcode.com"], ["Snakify", "https://snakify.org"], ["freeCodeCamp", "https://www.freecodecamp.org"], ["Discord", "https://discord.com"], ["Reddit", "https://reddit.com"]] },
  { title: "AI", items: [["ChatGPT", "https://openai.com/chatgpt"], ["Claude", "https://claude.ai"], ["Lovable", "https://www.lovable.dev"], ["Gemini", "https://gemini.google.com"]] },
  { title: "Editors & IDEs", items: [["Visual Studio Code", "https://code.visualstudio.com"], ["JetBrains", "https://www.jetbrains.com"]] },
];

const SEARCH_ITEMS = [
  ...WORKS_PAGES,
  ...CERTIFICATIONS.map((item) => ({ id: `certifications.html#${item.id}`, key: "certifications", title: item.title, summary: `${item.issuer}. ${item.body}` })),
  ...LEARNING_GROUPS.flatMap((group) => group.items.map(([title]) => ({ id: "learningsources.html", key: "learningsources", title, summary: group.title }))),
  { id: "projects.html#school", key: "projects", title: "School Site", summary: "My school's revamped website and its interface improvements." },
  { id: "projects.html#inheritance", key: "projects", title: "Islamic Inheritance Calculator", summary: "Run the original Python terminal application in the browser." },
  { id: "projects.html#mathlab", key: "projects", title: "Mathematical & Utility GUI", summary: "The original Tkinter calculator and utility suite." },
  { id: "projects.html#mysql", key: "projects", title: "SQL Query Executor", summary: "The original MySQL Query Executor and Visualizer prototype." },
  { id: "projects.html#bonus", key: "projects", title: "Bonus projects", summary: "Khan Academy JavaScript projects and this digital portfolio." },
];

function SearchIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.4"/><path d="m16 16 4 4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>; }

function WorksSearch({ currentKey, onNavigate, onFocusChange }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const shellRef = useRef(null);
  const normalized = query.trim().toLowerCase();
  const results = useMemo(() => normalized ? SEARCH_ITEMS.filter((item) => `${item.title} ${item.summary}`.toLowerCase().includes(normalized)).slice(0, 10) : [], [normalized]);
  useEffect(() => { const close = (event) => { if (!shellRef.current?.contains(event.target)) setFocused(false); }; document.addEventListener("pointerdown", close); return () => document.removeEventListener("pointerdown", close); }, []);
  useEffect(() => { if (onFocusChange) onFocusChange(focused); }, [focused, onFocusChange]);
  const open = (item) => {
    setFocused(false); setQuery("");
    const target = `/works/${item.id}`;
    if (item.key === currentKey) {
      const targetId = item.id.includes("#") ? item.id.split("#")[1] : "works-page-top";
      window.history.replaceState(window.history.state, "", `${window.location.pathname}#${targetId}`);
      requestAnimationFrame(() => document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "center" }));
      return;
    }
    onNavigate(target);
  };
  return <div className={`light-search-shell works-search-shell ${focused ? "has-results" : ""}`} ref={shellRef}
    onFocus={() => setFocused(true)}
    onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    onKeyDown={(event) => { if (event.key === "Escape") { setFocused(false); event.target.blur(); } }}>
    <label className="light-search"><SearchIcon/><input type="search" value={query} onClick={() => setFocused(true)} onChange={(event) => { setQuery(event.target.value); setFocused(true); }} placeholder="Search the portfolio" aria-label="Search the portfolio"/>{query && <button type="button" aria-label="Clear search" onClick={() => setQuery("")}>×</button>}</label>
    <SearchResults open={focused} className="light-search-results works-search-results">
      {!normalized && <button className="light-search-result is-available is-pinned" type="button" onClick={() => { setFocused(false); onNavigate("/light"); }}><strong>Light</strong><span>Open the writing and da'wah library.</span><small>∞</small></button>}
      {normalized && results.map((item, index) => <button className="light-search-result is-available" key={`${item.id}-${item.title}`} style={{ "--result-index": index }} type="button" onClick={() => open(item)}><strong>{item.title}</strong><span>{item.summary}</span><small>↗</small></button>)}
      {normalized && !results.length && <p className="light-search-empty">Nothing in this portfolio matches that yet.</p>}
    </SearchResults>
  </div>;
}

const DOC_GROUPS = [
  { id:"school-docs", icon:"project", eyebrow:"Web project", title:"My School's Revamped Website", note:"HTML, CSS, and JavaScript · 3,270 source lines", project:"/works/projects.html#school" },
  { id:"inheritance-docs", icon:"python", eyebrow:"Python project", title:"Islamic Inheritance Calculator", note:"Inheritance.py · 2,222 source lines", source:"https://github.com/arubbinali/github-projects/blob/main/Islamic%20Inheritance%20Calculator/Inheritance.py", project:"/works/projects.html#inheritance" },
  { id:"gui-docs", icon:"python", eyebrow:"Python · Tkinter", title:"Mathematical & Utility GUI", note:"MathLab GUI.py · 2,334 source lines", source:"https://github.com/arubbinali/github-projects/blob/main/Mathematical%20%26%20Utility%20GUI%20software/MathLab%20GUI.py", project:"/works/projects.html#mathlab" },
  { id:"mysql-docs", icon:"server", eyebrow:"Python · SQL", title:"MySQL Query Executor & Visualizer", note:"Four modules · 731 source lines", source:"https://github.com/arubbinali/github-projects/tree/main/MySQL%20Workbench%20(Prototype)", project:"/works/projects.html#mysql" },
  { id:"pcap-docs", icon:"certification", eyebrow:"Certification notes", title:"PCAP", note:"Associate Python notes · 6,257 source lines", source:"https://github.com/arubbinali/docs/blob/main/Python%20Institute/PCAP/PCAP.py", project:"/works/certifications.html#pcap" },
  { id:"pcep-docs", icon:"certification", eyebrow:"Certification notes", title:"PCEP", note:"Entry-level Python notes · 1,541 source lines", source:"https://github.com/arubbinali/docs/blob/main/Python%20Institute/PCEP/PCEP.py", project:"/works/certifications.html#pcep" },
];

function CodeLibrary({onNavigate}) {
  const openInternal=(event,path)=>{event.preventDefault();onNavigate(path);};
  return <div className="works-docs-layout">
    <aside className="works-docs-index"><small>On this page</small>{DOC_GROUPS.map((group,index)=><a key={group.id} href={'#'+group.id}><span>{String(index+1).padStart(2,"0")}</span>{group.title}</a>)}</aside>
    <div className="works-code-library">{DOC_GROUPS.map((group,groupIndex)=>{const snippets=WORKS_CODE_SNIPPETS.filter((item)=>item.section===group.id.replace(/-/g," "));return <React.Fragment key={group.id}>
      {(groupIndex===0||groupIndex===4)&&<header className={`works-docs-chapter ${groupIndex===4?"is-certifications":"is-projects"}`}><small>{groupIndex===0?"Original builds":"Certification notes"}</small><h2>{groupIndex===0?"Projects":"Certifications"}</h2><span>{groupIndex===0?"Source preserved project by project.":"Study notes retained with their original credentials."}</span></header>}
      <section className="works-code-group" id={group.id}><header><small>{group.eyebrow}</small><h2>{group.title}</h2><p>{group.note}</p></header>
        {snippets.map((item,index)=><AnimatedDetails className={`works-code-widget ${group.id==="school-docs"?"is-preview-only":""} ${item.code.split("\n").length>400?"is-large":""}`} key={item.id} style={{ "--card-index": groupIndex+index }} summary={<><span><small>{String(index+1).padStart(2,"0")} · Source file</small><strong>{item.title}</strong></span><em>{item.language}</em><i aria-hidden="true">+</i></>}><CodePane item={item} previewOnly={group.id==="school-docs"}/></AnimatedDetails>)}
        <div className="works-docs-actions">{group.source&&<a href={group.source} target="_blank" rel="noreferrer">GitHub source ↗</a>}<a href={group.project} onClick={(event)=>openInternal(event,group.project)}>{groupIndex<4?"View project":"View certification"} →</a></div>
      </section>
    </React.Fragment>})}</div>
  </div>;
}

const CODE_KEYWORDS = {
  python: new Set("and as assert async await break class continue def del elif else except False finally for from global if import in is lambda None nonlocal not or pass raise return True try while with yield self".split(" ")),
  javascript: new Set("async await break case catch class const continue debugger default delete do else export extends false finally for from function get if import in instanceof let new null of return set static super switch this throw true try typeof undefined var void while with yield".split(" ")),
  js: new Set("async await break case catch class const continue debugger default delete do else export extends false finally for from function get if import in instanceof let new null of return set static super switch this throw true try typeof undefined var void while with yield".split(" ")),
  css: new Set("important inherit initial unset auto none block flex grid relative absolute fixed sticky hidden visible solid transparent".split(" ")),
};

function highlightedLine(line, language, lineIndex) {
  const keywords=CODE_KEYWORDS[language]||CODE_KEYWORDS.javascript;
  const pattern=language==="html"?/(<!--[\s\S]*?-->|<\/?[A-Za-z][^>]*>|&[A-Za-z#0-9]+;)/g:language==="python"?/(#.*$|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][\w$]*\b)/g:/(\/\/.*$|\/\*.*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][\w$]*\b)/g;
  const pieces=[];let last=0;let match;
  while((match=pattern.exec(line))){if(match.index>last)pieces.push(line.slice(last,match.index));const token=match[0];let kind="";
    if(language==="html")kind=token.startsWith("<!--")?"comment":token.startsWith("<")?"tag":"entity";
    else if(token.startsWith("#")||token.startsWith("//")||token.startsWith("/*"))kind="comment";
    else if(/^['"`]/.test(token))kind="string";else if(/^\d/.test(token))kind="number";else if(keywords.has(token))kind="keyword";
    pieces.push(kind?<span className={`tok-${kind}`} key={`${lineIndex}-${match.index}`}>{token}</span>:token);last=pattern.lastIndex;
  }
  if(last<line.length)pieces.push(line.slice(last));return pieces;
}

const HighlightedCode = memo(function HighlightedCode({code,language}) { const lines=code.split("\n");return lines.map((line,index)=><React.Fragment key={index}>{highlightedLine(line,language,index)}{index<lines.length-1?"\n":null}</React.Fragment>); });

function CodePane({item,previewOnly}) {
  const paneRef=useRef(null);
  // Render once before measuring the opening height, then keep the code cached.
  const revealed = useContext(DetailsRevealed);
  useEffect(()=>{
    if(previewOnly||!revealed||!paneRef.current)return undefined;
    const pane=paneRef.current;const content=pane.querySelector(".works-code-scroll");
    const smoothScroll=new Lenis({wrapper:pane,content,duration:1.2,easing:(t)=>Math.min(1,1.001-Math.pow(2,-10*t)),orientation:"vertical",gestureOrientation:"vertical",smoothWheel:true,wheelMultiplier:1,smoothTouch:false,touchMultiplier:2,infinite:false});let frameId;const frame=(time)=>{smoothScroll.raf(time);frameId=requestAnimationFrame(frame);};frameId=requestAnimationFrame(frame);return()=>{cancelAnimationFrame(frameId);smoothScroll.destroy();};},[previewOnly,revealed]);
  return <div ref={paneRef} className="works-code-body" data-lenis-prevent={previewOnly?undefined:"true"} tabIndex="0">{revealed&&<div className="works-code-scroll"><div className="works-code-toolbar"><span>{item.title}</span><small>{item.code.split("\n").length.toLocaleString()} lines</small></div>{previewOnly&&<span className="works-preview-only">Preview only</span>}{previewOnly ? <pre><code className={`language-${item.language}`}><HighlightedCode code={item.code} language={item.language}/></code></pre> : <VirtualCode code={item.code} language={item.language} paneRef={paneRef} renderLine={highlightedLine}/>}</div>}</div>;
}

function PageFrame({ kicker, title, intro, children }) { return <main className="works-page" id="works-page-top"><header className="works-hero"><p>{kicker}</p><h1><span>{title}</span></h1><span>{intro}</span></header>{children}</main>; }

function AboutPage({onNavigate}) {
  const internal = (event, path) => { event.preventDefault(); onNavigate(path); };
  return <PageFrame kicker="About this website" title="About" intro="My portfolio, its history, and where it may go next."><section className="works-reading works-about-copy">
    <p>This website serves as my portfolio, showcasing all my solo &amp; group <a href="/works/projects.html" onClick={(event)=>internal(event,"/works/projects.html")}><strong>projects</strong></a>, <a href="/works/certifications.html" onClick={(event)=>internal(event,"/works/certifications.html")}><strong>certifications</strong></a> and <a href="/works/docs.html" onClick={(event)=>internal(event,"/works/docs.html")}><strong>docs</strong></a> I've worked on from 2017 to the present day. It is also my <strong>latest project</strong> and my <strong>second professional website</strong>, following my work on enhancing my <a href="/works/projects.html#school" onClick={(event)=>internal(event,"/works/projects.html#school")}>school's website</a>.</p>
    <p>While the site is primarily a portfolio at the moment, I am open to exploring different directions for its future purpose. If you have any suggestions, ideas, come across any bugs or have recommendations for improvements, feel free to get in touch.</p>
    <p className="works-contact-intro">Contact me via:</p>
    <div className="works-contact-grid"><a href="mailto:arubbinali@outlook.com"><small>Mail</small><strong>arubbinali@outlook.com</strong></a><span><small>Discord</small><strong>doaor</strong></span><a href="https://www.linkedin.com/in/arubbinali" target="_blank" rel="noreferrer"><small>LinkedIn</small><strong>arubbinali</strong></a></div>
  </section></PageFrame>;
}

function LearningPage() { return <PageFrame kicker="A learning trail" title="Learning Sources" intro="The languages, platforms, tools, and communities that have shaped how I build."><div className="works-learning-grid">{LEARNING_GROUPS.map((group, index) => <section className="works-learning-card" key={group.title} style={{ "--card-index": index }}><small>{String(index + 1).padStart(2, "0")}</small><h2>{group.title}</h2><div>{group.items.map(([label, href]) => <a href={href} target="_blank" rel="noreferrer" key={label}>{label}<i>↗</i></a>)}</div></section>)}</div></PageFrame>; }

function CertificationsPage({onNavigate}) { return <PageFrame kicker="Credentials, with context" title="Certifications" intro="A concise record of professional programs and verified Python foundations."><div className="works-cert-list">{CERTIFICATIONS.map((cert, index) => <article id={cert.id} key={cert.id} style={{ "--card-index": index }}><div className="works-cert-copy"><small>{cert.short} · {cert.date}</small><h2>{cert.title}</h2><p>{cert.body}</p><div className="works-docs-actions works-cert-actions"><a href={cert.href} target="_blank" rel="noreferrer">View credential ↗</a>{cert.id !== "ibm" && <a href={`/works/docs.html#${cert.id}-docs`} onClick={(event)=>{event.preventDefault();onNavigate(`/works/docs.html#${cert.id}-docs`)}}>Docs →</a>}</div></div><img src={cert.image} alt={`${cert.title} certificate`} loading="lazy"/></article>)}</div></PageFrame>; }

function ProjectVideo({src,title,poster}) { return <AnimatedDetails className="works-media-widget" summary={<><span><small>Original application</small><strong>{title}</strong></span><i>+</i></>}><div><video controls playsInline preload="metadata" poster={poster ? legacyAsset(`img/${poster}`) : undefined}><source src={legacyAsset(src)} type="video/mp4"/>Your browser does not support embedded video.</video></div></AnimatedDetails>; }

function ProjectFacts({children,duration}) { return <div className="works-project-facts">{children}<p><strong>Project duration</strong><span>{duration}</span></p></div>; }

function LegacyDetail({title,children}) { return <AnimatedDetails className="works-media-widget works-detail-widget" summary={<><span><small>Project details</small><strong>{title}</strong></span><i>+</i></>}><div>{children}</div></AnimatedDetails>; }

function ProjectsPage({onNavigate}) {
  const internal = (event, path) => { event.preventDefault(); onNavigate(path); };
  return <PageFrame kicker="Work, with its history intact" title="Projects" intro="A showcase of my original projects, their development history, demonstrations, and documentation."><div className="works-project-list">
    <article id="school">
      <small>01 · Website · approved 16 November 2024</small>
      <h2>My School's Revamped Website (Main Page)</h2>
      <p>I officially presented my <a href="https://pisjes.edu.sa/" target="_blank" rel="noreferrer">school</a>'s <strong>enhanced variant of its existing website</strong> to the school's <a href="https://www.linkedin.com/in/adnannasir/" target="_blank" rel="noreferrer">principal and web developer</a>. The project was approved on 16 November 2024.</p>
      <p>The complete main page is embedded below so it can be explored directly and compared with the school's website as it appeared on that date.</p>
      <div className="school-site-frame"><iframe src={legacyAsset("for%20site/move/main.html")} title="School website project" loading="lazy"/></div>
      <ProjectFacts duration="150+ hours · 2.5 months"><ul><li>Dark mode</li><li>Interactive navigation, buttons, and footer</li><li>Modern widget shadows and visual system</li><li>Smoother transitions and fluid animations</li><li>Color variants and enhanced typography</li></ul></ProjectFacts>
      <div className="works-actions"><a href={legacyAsset("for%20site/move/main.html")} target="_blank" rel="noreferrer">See Website ↗</a><a href="https://web.archive.org/web/20241116012342/https://pisjes.edu.sa/" target="_blank" rel="noreferrer">16 November 2024 archive ↗</a><a href="/works/docs.html#school-docs" onClick={(event)=>internal(event,"/works/docs.html#school-docs")}>Docs →</a></div>
    </article>
    <article id="inheritance">
      <small>02 · Python · November 2021 · Grade 9</small>
      <h2>Terminal-Based Islamic Inheritance Calculator</h2>
      <p>A <strong>terminal-based graphical inheritance calculator</strong> developed solely in <a href="https://www.python.org/" target="_blank" rel="noreferrer">Python</a>, designed to model inheritance distribution according to <a href="https://islamqa.info/en/answers/225165/rules-of-inheritance-in-islam" target="_blank" rel="noreferrer">Islamic jurisprudence laws</a>.</p>
      <p>I presented it as my first project at my school's annual science and art exhibition in November 2021, where it placed second.</p>
      <ProjectVideo src="vid/inheritance.mp4" poster="inheritance.webp" title="Original Inheritance Calculator"/>
      <div className="works-detail-grid"><LegacyDetail title="Input Details"><p>The program prompts you to indicate the following:</p><ul><li>13 inputs on relationship count (spouse, children, grandchildren, siblings, etc.)</li><li>Wealth</li><li>Zakat</li><li>Mehr</li><li>Loan</li><li>Will</li></ul></LegacyDetail><LegacyDetail title="Display Layouts"><p>The shares of the heirs are presented as:</p><ul><li>Text</li><li>Percentages and fractions of each heir's share</li><li>Tree structure</li><li>Table structure</li><li>Array format</li><li>Pie chart</li></ul></LegacyDetail><LegacyDetail title="Project Features"><ul><li>Complex validations and exceptions</li><li>Multiple libraries for a graphical, user-friendly terminal interface</li><li>Loading bars, colors, and emojis</li><li>Accurately implemented Islamic inheritance laws</li></ul></LegacyDetail></div>
      <ProjectFacts duration="90+ hours · 29 days"/>
      <div className="works-actions"><a href="/works/docs.html#inheritance-docs" onClick={(event)=>internal(event,"/works/docs.html#inheritance-docs")}>Docs →</a></div>
    </article>
    <article id="mathlab">
      <small>03 · Python · Tkinter · November 2023 · Grade 11</small>
      <h2>Mathematical & Utility GUI Software</h2>
      <p>A <strong>prototype GUI application</strong> developed in <a href="https://www.python.org/" target="_blank" rel="noreferrer">Python</a> with <a href="https://docs.python.org/3/library/tkinter.html" target="_blank" rel="noreferrer">Tkinter</a> and <a href="https://customtkinter.tomschimansky.com/" target="_blank" rel="noreferrer">CustomTkinter</a>, featuring mathematical calculators, time, utility, and miscellaneous modules.</p>
      <p>I presented it with <a href="https://github.com/shariqnauman/" target="_blank" rel="noreferrer">Shariq</a> and <a href="https://github.com/Badareharm/" target="_blank" rel="noreferrer">Ahmad</a> at my school's annual science and art exhibition in November 2023. It was my first GUI software project and placed second.</p>
      <div className="works-media-grid"><ProjectVideo src="vid/gui_main.mp4" poster="mathlabgui.webp" title="About the original application"/><ProjectVideo src="vid/gui_code.mp4" poster="mathlabgui.webp" title="Original code overview"/><ProjectVideo src="vid/mathlabgui.mp4" poster="mathlabgui.webp" title="Original MathLab GUI"/></div>
      <ProjectFacts duration="120+ hours · 2 months"/>
      <div className="works-actions"><a href="/works/docs.html#gui-docs" onClick={(event)=>internal(event,"/works/docs.html#gui-docs")}>Docs →</a></div>
    </article>
    <article id="mysql">
      <small>04 · Python · CustomTkinter · SQL · September 2024</small>
      <h2>MySQL Query Executor & Visualizer (GUI)</h2>
      <p>A graphical MySQL query executor developed in <a href="https://www.python.org/" target="_blank" rel="noreferrer">Python</a>, <a href="https://docs.python.org/3/library/tkinter.html" target="_blank" rel="noreferrer">Tkinter</a>, <a href="https://customtkinter.tomschimansky.com/" target="_blank" rel="noreferrer">CustomTkinter</a>, and <a href="https://www.mysql.com/" target="_blank" rel="noreferrer">SQL</a>. It includes Data Manipulation and Data Query Language executors, query history, and a table-schema viewer.</p>
      <p>This was a private group project completed with <a href="https://github.com/Badareharm/" target="_blank" rel="noreferrer">Ahmad</a> in September 2024.</p>
      <div className="works-media-grid"><ProjectVideo src="vid/dmlexecutor.mp4" poster="dbgui.webp" title="Original DML Executor"/><ProjectVideo src="vid/dqlexecutor.mp4" poster="dbgui.webp" title="Original DQL Executor"/><ProjectVideo src="vid/tabledescription.mp4" poster="dbgui.webp" title="Original Table Description"/></div>
      <ProjectFacts duration="100+ hours · 1.5 months"/>
      <div className="works-actions"><a href="/works/docs.html#mysql-docs" onClick={(event)=>internal(event,"/works/docs.html#mysql-docs")}>Docs →</a></div>
    </article>
    <article id="bonus">
      <small>05 · Archive · 2017—present</small>
      <h2>Bonus projects</h2>
      <h3 className="works-project-subtitle">A compilation of my mini Js projects on Khan Academy</h3>
      <p>I began learning <a href="https://www.javascript.com/" target="_blank" rel="noreferrer">JavaScript</a> (<a href="https://github.com/processing-js/processing-js" target="_blank" rel="noreferrer">ProcessingJS</a>) on <a href="https://www.khanacademy.org/" target="_blank" rel="noreferrer">Khan Academy</a> in 2017 and developed <strong>several mini-projects</strong> along the way. This project serves as the final <a href="https://www.khanacademy.org/computer-programming/a-compilation-of-my-mini-js-programs-2017-2020/6623482539327488" target="_blank" rel="noreferrer">compilation</a>, linking all my previous work into <strong>one central project</strong>.</p>
      <p>Compilation of my Khan Academy projects from <strong>2017 to 2020</strong>.</p>
      <h3 className="works-project-subtitle">My Digital Portfolio (This Website)</h3>
      <p>A compilation showcasing all my professional <strong>solo projects</strong>, <strong>group projects</strong>, <strong>certifications</strong> and <strong>docs</strong>. Learn more <a href="/works/about.html" onClick={(event)=>internal(event,"/works/about.html")}>about</a> the website.</p>
      <p>All showacased work on the website is from <strong>2017 to the present day</strong>.</p>
      <div className="works-actions"><a href="https://www.khanacademy.org/computer-programming/a-compilation-of-my-mini-js-programs-2017-2020/6623482539327488" target="_blank" rel="noreferrer">Open compilation ↗</a><a href="/works/about.html" onClick={(event)=>internal(event,"/works/about.html")}>About this portfolio →</a></div>
    </article>
  </div></PageFrame>;
}



function WorksFooter({onNavigate}) { return <footer className="works-footer"><div><strong>ارب</strong><p>Engineering, software, and a growing archive of work.</p></div><nav><small>Portfolio</small>{WORKS_PAGES.map((page)=><a href={`/works/${page.id}`} key={page.id} onClick={(e)=>{e.preventDefault();onNavigate(`/works/${page.id}`)}}>{page.title}</a>)}</nav><nav><small>Elsewhere</small><a href="/light" onClick={(e)=>{e.preventDefault();onNavigate("/light")}}>Light</a><a href="https://github.com/arubbinali" target="_blank" rel="noreferrer">GitHub</a><a href="https://www.linkedin.com/in/arubbinali" target="_blank" rel="noreferrer">LinkedIn</a></nav><div className="works-footer-end"><button type="button" onClick={()=>window.scrollTo({top:0,behavior:"smooth"})}>Back to top ↑</button><span>© {new Date().getFullYear()} Arub</span></div></footer>; }

function DocsPage({onNavigate}) { return <PageFrame kicker="Licensed code and notes" title="Docs" intro="The original project and certification source library—preserved in its project history, then organized into focused, expandable files."><CodeLibrary onNavigate={onNavigate}/></PageFrame>; }

const TERMINAL_PAGES = [
  ["Projects", "/works/projects.html"], ["Docs", "/works/docs.html"], ["Certifications", "/works/certifications.html"],
  ["Learning Sources", "/works/learningsources.html"], ["About", "/works/about.html"],
];

function TerminalResult({result,onNavigate}) {
  return <section className="works-portfolio-terminal-result"><h3>{result.title}</h3>{result.lines?.map((line,index)=><p key={`${line}-${index}`}>{line}</p>)}{result.items&&<ul>{result.items.map((item)=><li key={item}>{item}</li>)}</ul>}{result.links&&<div className="works-terminal-links">{result.links.map(([label,path])=><button key={path} type="button" onClick={()=>onNavigate(path)}>{label}<span>↗</span></button>)}</div>}</section>;
}

function PortfolioTerminal({onNavigate}) {
  const [open,setOpen]=useState(false),[expanded,setExpanded]=useState(false),[value,setValue]=useState("");
  const [entries,setEntries]=useState([{command:"",result:{title:"Welcome to Arub's Portfolio Terminal",lines:["Type help to see available commands."]}}]);
  const [commandHistory,setCommandHistory]=useState([]),[historyIndex,setHistoryIndex]=useState(-1);
  const inputRef=useRef(null),outputRef=useRef(null);
  useEffect(()=>{if(!open)return undefined;const timer=window.setTimeout(()=>inputRef.current?.focus({preventScroll:true}),180);return()=>window.clearTimeout(timer);},[open]);
  useEffect(()=>{if(open&&outputRef.current)outputRef.current.scrollTo({top:outputRef.current.scrollHeight,behavior:"smooth"});},[entries,open]);
  useEffect(()=>{const keydown=(event)=>{if(event.key==="Escape"&&open)setOpen(false);};window.addEventListener("keydown",keydown);return()=>window.removeEventListener("keydown",keydown);},[open]);
  const answer=(raw)=>{
    const command=raw.trim(); if(!command)return;
    const [name,...args]=command.split(/\s+/); const cmd=name.toLowerCase();
    if(cmd==="clear"){setEntries([{command:"",result:{title:"Terminal cleared",lines:["Type help to see available commands."]}}]);return;}
    let result;
    if(cmd==="help") result={title:"Available Commands",items:["help — show this command guide","projects — show detailed project info","docs — open technical documentation","certifs — show certifications","sources — show learning resources","about — information about me","contact — contact details and profiles","ls — list portfolio pages","time — current local date and time","whoami — identify this visitor","echo [text] — print text","clear — clear the terminal"]};
    else if(cmd==="projects") result={title:"Projects",items:["School website revamp — HTML, CSS, and JavaScript","Islamic Inheritance Calculator — original Python terminal application","Mathematical & Utility GUI — original Tkinter application","MySQL Query Executor & Visualizer — Python, Tkinter, and SQL","Khan Academy JavaScript archive","Digital portfolio"],links:[["Open Projects","/works/projects.html"]]};
    else if(cmd==="docs") result={title:"Documentation",lines:["The source library contains organized, expandable files for every original project and both Python certifications."],links:[["Open Docs","/works/docs.html"]]};
    else if(cmd==="certifications"||cmd==="certifs") result={title:"Certifications",items:["IBM AI Developer Professional Certificate — February 2026","PCAP — Certified Associate Python Programmer — August 2024","PCEP — Certified Entry-Level Python Programmer — July 2023"],links:[["Open Certifications","/works/certifications.html"]]};
    else if(cmd==="learning"||cmd==="sources") result={title:"Learning Sources",lines:["Languages, platforms, communities, editors, and AI tools that have shaped how I build."],links:[["Open Learning Sources","/works/learningsources.html"]]};
    else if(cmd==="about") result={title:"About",lines:["I'm Arub, an engineering student with a passion for creating digital experiences that are both functional and beautiful.","This portfolio records projects, certifications, and documentation from 2017 to the present day."],links:[["Open About","/works/about.html"]]};
    else if(cmd==="contact") result={title:"Contact",items:["Email — arubbinali@outlook.com","Discord — doaor","GitHub — arubbinali","LinkedIn — arubbinali"],links:[["Open About","/works/about.html"]]};
    else if(cmd==="time") result={title:"Current Date & Time",lines:[new Date().toLocaleString("en-US",{dateStyle:"full",timeStyle:"long"})]};
    else if(cmd==="whoami") result={title:"You Are",lines:["A visitor exploring Arub's digital portfolio.","Status — Curious Explorer · Access — Public Viewer"]};
    else if(cmd==="echo") result={title:"Echo",lines:[args.length?args.join(" "):"Usage: echo [text]"]};
    else if(cmd==="ls") result={title:"Portfolio Pages",links:TERMINAL_PAGES};
    else result={title:"Command Not Found",lines:[`Command not found: ${command}`,"Type help for available commands."]};
    setEntries((current)=>[...current,{command,result}]);
  };
  const submit=(event)=>{event.preventDefault();const command=value.trim();if(!command)return;setCommandHistory((current)=>[...current,command]);setHistoryIndex(-1);setValue("");answer(command);};
  const historyKey=(event)=>{if(!commandHistory.length)return;if(event.key==="ArrowUp"){event.preventDefault();const next=Math.min(historyIndex+1,commandHistory.length-1);setHistoryIndex(next);setValue(commandHistory[commandHistory.length-1-next]);}else if(event.key==="ArrowDown"){event.preventDefault();const next=historyIndex-1;setHistoryIndex(next);setValue(next<0?"":commandHistory[commandHistory.length-1-next]);}};
  return <>
    <button className="works-terminal-trigger" type="button" onClick={()=>setOpen(true)} aria-label="Open portfolio terminal"><span aria-hidden="true">›_</span><em>Terminal</em></button>
    <div className={`works-terminal-backdrop ${open?"is-open":""}`} aria-hidden={!open} inert={!open} data-lenis-prevent onMouseDown={(event)=>{if(event.target===event.currentTarget)setOpen(false)}}>
      <section className={`works-portfolio-terminal ${expanded?"is-expanded":""}`} role="dialog" aria-modal="true" aria-label="Portfolio terminal">
        <header><div><i/><i/><i/><strong>arub@portfolio:~</strong></div><nav><button type="button" onClick={()=>setExpanded((current)=>!current)} aria-label={expanded?"Restore terminal":"Expand terminal"}>{expanded?"↙":"↗"}</button><button type="button" onClick={()=>setOpen(false)} aria-label="Close terminal">×</button></nav></header>
        <div className="works-portfolio-terminal-output" ref={outputRef} data-lenis-prevent data-lenis-prevent-wheel>{entries.map((entry,index)=><React.Fragment key={`${entry.command}-${index}`}>{entry.command&&<p className="works-terminal-command"><span>$&gt;</span>{entry.command}</p>}<TerminalResult result={entry.result} onNavigate={(path)=>{setOpen(false);onNavigate(path)}}/></React.Fragment>)}</div>
        <form onSubmit={submit}><span>$&gt;</span><input ref={inputRef} value={value} onChange={(event)=>setValue(event.target.value)} onKeyDown={historyKey} autoComplete="off" spellCheck="false" aria-label="Terminal command" placeholder="type a command…"/></form>
      </section>
    </div>
  </>;
}

function WorksHome({onNavigate}) { return <div className="works-home-hub"><div className="works-home-core"><h1 className="main-home-ayah works-home-name" lang="ar" dir="rtl" aria-label="Arub"><ShinyText className="main-home-ayah-shine" text="ارب" speed={4}/></h1><span>Selected work · 2017—present</span></div><nav className="works-home-links" aria-label="Portfolio pages">{WORKS_PAGES.map((page,index)=><a className="works-home-node" href={`/works/${page.id}`} key={page.id} onClick={(event)=>{event.preventDefault();onNavigate(`/works/${page.id}`)}}><small>{String(index+1).padStart(2,"0")}</small><strong>{page.title}</strong><span>{page.summary}</span></a>)}</nav></div>; }

function pageKey(pathname) { const leaf = pathname.split("/").filter(Boolean).pop()?.toLowerCase() || ""; if (!leaf || leaf === "works" || leaf === "index.html" || leaf === "index") return "home"; return leaf.replace(/\.html$/, ""); }

export default function Works() {
  const location = useLocation();
  const navigate = useNavigate();
  const key = pageKey(location.pathname);
  const isHome = key === "home";
  const [showContent, setShowContent] = useState(() => !isHome || Boolean(location.state?.skipIntro));
  const [leaving, setLeaving] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const timerRef = useRef(null);
  useEffect(() => { setLeaving(false); setShowContent(!isHome || Boolean(location.state?.skipIntro)); window.scrollTo({ top: 0, behavior: "auto" }); if(location.hash){window.setTimeout(()=>document.getElementById(location.hash.slice(1))?.scrollIntoView({behavior:"smooth",block:"start"}),80);} }, [isHome, location.pathname, location.hash, location.state]);
  useEffect(() => () => window.clearTimeout(timerRef.current), []);
  useEffect(() => {
    if (!showContent || isHome) return undefined;
    const nodes = [...document.querySelectorAll(".works-project-list>article,.works-code-group,.works-docs-chapter,.works-code-widget,.works-media-widget,.works-project-facts,.works-actions,.school-site-frame,.works-learning-card,.works-cert-list>article,.works-contact-grid>*,.works-footer>*")];
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const animations = [];
    nodes.forEach((node) => node.classList.add("works-observe"));
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      // Temporary entrance animation: never replace the element's hover transitions.
      if (entry.target.animate) animations.push(entry.target.animate([
        { opacity: 0, transform: "translateY(18px)" },
        { opacity: 1, transform: "none" },
      ], { duration: 600, easing: "cubic-bezier(.22,1,.36,1)" }));
      observer.unobserve(entry.target);
    }), { threshold: .04, rootMargin: "0px 0px -3% 0px" });
    nodes.forEach((node) => observer.observe(node));
    return () => { observer.disconnect(); animations.forEach((animation) => animation.cancel()); };
  }, [key, showContent, isHome]);
  const enterRoute = (path) => { if (leaving || path === location.pathname) return; setLeaving(true); timerRef.current = window.setTimeout(() => navigate(path, { state: { skipIntro: true } }), 460); };
  const navigationCommands = WORKS_PAGES.filter((page) => page.key !== key).map((page) => ({ id: `works-${page.key}`, group: "Works", label: page.title, hint: page.summary, run: () => enterRoute(`/works/${page.id}`) }));
  if (!isHome) navigationCommands.unshift({ id: "works-home", group: "Works", label: "Home", hint: "Portfolio entrance", run: () => enterRoute("/works/") });
  const pinnedLight = { id: "works-light", group: "Beyond the portfolio", label: "Light", hint: "Writing and da'wah library", run: () => enterRoute("/light") };
  const page = key === "about" ? <AboutPage onNavigate={enterRoute}/> : key === "certifications" ? <CertificationsPage onNavigate={enterRoute}/> : key === "learningsources" ? <LearningPage/> : key === "docs" ? <DocsPage onNavigate={enterRoute}/> : key === "projects" ? <ProjectsPage onNavigate={enterRoute}/> : <WorksHome onNavigate={enterRoute}/>;
  return <div className={`App works-site ${isHome ? "works-home" : "works-subpage"}`} style={{ position: "relative", overflow: isHome ? "hidden" : "visible", backgroundColor: "var(--site-bg)", minHeight: "100vh", height: isHome ? "100vh" : "auto" }}>
    {isHome && !showContent && <IntroAnimation onFinish={() => setShowContent(true)}/>}
    {showContent && <>
      <SiteChrome sections={WORKS_DIRECTORY} currentEntryId={isHome ? null : `${key}.html`} currentView={isHome ? "works-home" : "works-page"} buttonLabel={isHome ? "Structure" : "Home"} buttonTarget={isHome ? null : "/works/"} onNavigate={enterRoute} showStructure={false} directoryPath="/works/" entryBasePath="/works" structureRootLabel="Home" structureFeature={{ symbol: "∞", label: "Light", hint: "Main site", path: "/light" }} navigationCommands={navigationCommands} pinnedCommand={pinnedLight} includeReadingModes={false}/>
      <SiteNav site="works" currentKey={key} onNavigate={enterRoute}/><PortfolioTerminal onNavigate={enterRoute}/>
    </>}
    <div className={`main-content works-stage ${showContent ? "fade-in" : "hidden"} ${leaving ? "is-leaving" : ""}`} data-search-focused={searchFocused}>
      <WorksSearch currentKey={key} onNavigate={enterRoute} onFocusChange={setSearchFocused}/>
      <div className="works-search-content search-focus-content">{page}{!isHome && <WorksFooter onNavigate={enterRoute}/>}</div>
    </div>
  </div>;
}
