import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useNavigate, useLocation } from "react-router-dom";
import IntroAnimation from "../components/intro";
import "./light.css";

const READERS = [
  {
    id: "muslim",
    label: "Muslim",
    labelAr: "مسلم",
  },
  {
    id: "christian",
    label: "Christian",
    labelAr: "مسيحي",
  },
  {
    id: "jew",
    label: "Jew",
    labelAr: "يهودي",
  },
  {
    id: "atheist",
    label: "atheist",
    labelAr: "ملحد",
  },
];

const LANGUAGES = [
  { id: "en", label: "English" },
  { id: "ar", label: "العربية" },
];

const DIRECTORY = [
  {
    id: "introduction",
    title: "Introduction",
    titleAr: "مقدمة",
    eyebrow: "Begin here",
    eyebrowAr: "ابدأ هنا",
    entries: [
      {
        id: "signs",
        title: "The signs in the horizons",
        titleAr: "اياتنا في الافاق",
        description: "Qur'an 41:53, approached through four different ways of reading.",
        descriptionAr: "قراءة الاية ٤١:٥٣ من خلال أربع وجهات نظر مختلفة.",
        available: true,
      },
      {
        id: "first-question",
        title: "Before the first question",
        titleAr: "قبل السؤال الأول",
        description: "A short orientation to belief, evidence, and honest inquiry.",
        descriptionAr: "تمهيد قصير حول الإيمان والدليل والبحث الصادق.",
      },
    ],
  },
  {
    id: "refutations",
    title: "Refutations",
    titleAr: "ردود",
    eyebrow: "Claims, examined",
    eyebrowAr: "مراجعة الادعاءات",
    entries: [
      {
        id: "silent-universe",
        title: "The myth of a silent universe",
        titleAr: "خرافة الكون الصامت",
        description: "On signs, meaning, and whether reality speaks beyond itself.",
        descriptionAr: "عن الايات والمعنى، وهل يشير الواقع إلى ما وراءه.",
      },
      {
        id: "certainty-doubt",
        title: "Certainty and doubt",
        titleAr: "اليقين والشك",
        description: "What skepticism can reveal—and what it quietly assumes.",
        descriptionAr: "ما الذي يكشفه الشك، وما الذي يفترضه بصمت.",
      },
    ],
  },
  {
    id: "favorites",
    title: "My favorite",
    titleAr: "مختاراتي",
    eyebrow: "Kept close",
    eyebrowAr: "نصوص قريبة",
    entries: [
      {
        id: "wonder",
        title: "A note on wonder",
        titleAr: "ملاحظة عن الدهشة",
        description: "Small observations worth returning to slowly.",
        descriptionAr: "تأملات صغيرة تستحق العودة إليها ببطء.",
      },
      {
        id: "soul-remembers",
        title: "What the soul remembers",
        titleAr: "ما تتذكره الروح",
        description: "Fragments on recognition, longing, and return.",
        descriptionAr: "شذرات عن المعرفة والحنين والعودة.",
      },
    ],
  },
];

const MOTES = Array.from({ length: 52 }, (_, index) => ({
  id: index,
  x: (index * 37) % 97,
  delay: -((index * 0.71) % 9),
  duration: 6 + ((index * 13) % 31) / 10,
  size: 1 + (index % 3),
}));

function Chevron() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="m3 6 5 5 5-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="8.75" cy="8.75" r="5.75" fill="none" stroke="currentColor" strokeWidth="1.25" />
      <path d="m13 13 4 4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.25" />
    </svg>
  );
}

export default function Light() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showContent, setShowContent] = useState(() => Boolean(location.state?.skipIntro));
  const [view, setView] = useState("directory");
  const [viewTransitioning, setViewTransitioning] = useState(false);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [pickerHovered, setPickerHovered] = useState(false);
  const [hoveredReader, setHoveredReader] = useState(null);
  const [reader, setReader] = useState(null);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [languageHovered, setLanguageHovered] = useState(false);
  const [controlsHidden, setControlsHidden] = useState(false);
  const [content, setContent] = useState("");
  const pickerRef = useRef(null);
  const languageRef = useRef(null);
  const readerStageRef = useRef(null);
  const readingInnerRef = useRef(null);
  const controlsHiddenRef = useRef(false);
  const transitionTimerRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    const close = (event) => {
      if (!pickerRef.current?.contains(event.target)) setOpen(false);
      if (!languageRef.current?.contains(event.target)) setLanguageOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  useEffect(() => () => window.clearTimeout(transitionTimerRef.current), []);

  useEffect(() => {
    const updateControlsHidden = (hidden) => {
      controlsHiddenRef.current = hidden;
      setControlsHidden(hidden);
    };

    const handleScroll = () => {
      const scrollPosition = window.scrollY;

      if (scrollPosition > 2) {
        setOpen(false);
        setLanguageOpen(false);
        setPickerHovered(false);
        setLanguageHovered(false);
      }

      if (!reader || scrollPosition <= 2) {
        updateControlsHidden(false);
        return;
      }

      if (!controlsHiddenRef.current && readerStageRef.current && readingInnerRef.current) {
        const controlsBottom = readerStageRef.current.getBoundingClientRect().bottom;
        const articleTop = readingInnerRef.current.getBoundingClientRect().top;

        if (articleTop <= controlsBottom + 72) updateControlsHidden(true);
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [reader]);

  useEffect(() => {
    if (!reader) return;
    let active = true;
    setContent("");
    fetch(`/light/content/${language.id}/${reader.id}.md`)
      .then((response) => {
        if (!response.ok) throw new Error(`Unable to load ${response.url}`);
        return response.text();
      })
      .then((markdown) => active && setContent(markdown))
      .catch(() => active && setContent("# Content unavailable\n\nThis reading could not be loaded."));
    return () => { active = false; };
  }, [language.id, reader]);

  const chooseReader = (choice) => {
    setReader(choice);
    setOpen(false);
    setPickerHovered(false);
    setHoveredReader(null);
  };

  const transitionView = (nextView, callback) => {
    window.clearTimeout(transitionTimerRef.current);
    setOpen(false);
    setLanguageOpen(false);
    setPickerHovered(false);
    setLanguageHovered(false);
    setViewTransitioning(true);
    transitionTimerRef.current = window.setTimeout(() => {
      setView(nextView);
      callback?.();
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => setViewTransitioning(false)));
    }, 280);
  };

  const openReader = () => transitionView("reader", () => {
    setReader(null);
    setControlsHidden(false);
  });

  const returnToDirectory = () => {
    if (view === "directory") return;
    transitionView("directory", () => {
      setReader(null);
      setContent("");
      setControlsHidden(false);
    });
  };

  const goHome = () => {
    window.clearTimeout(transitionTimerRef.current);
    setViewTransitioning(true);
    transitionTimerRef.current = window.setTimeout(() => navigate("/", { state: { skipIntro: true } }), 320);
  };

  const changeLanguage = (choice) => {
    if (choice.id === language.id) {
      setLanguageOpen(false);
      setLanguageHovered(false);
      return;
    }
    window.clearTimeout(transitionTimerRef.current);
    setLanguageOpen(false);
    setLanguageHovered(false);
    setViewTransitioning(true);
    transitionTimerRef.current = window.setTimeout(() => {
      setLanguage(choice);
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => setViewTransitioning(false)));
    }, 220);
  };

  const activeGrammarReader = hoveredReader || reader;
  const article = activeGrammarReader?.id === "atheist" ? "an" : "a";
  const displayReader = (choice) => language.id === "ar" ? choice.labelAr : choice.label;
  const localize = (item, key) => language.id === "ar" ? item[`${key}Ar`] : item[key];
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleSections = DIRECTORY.map((section, sectionIndex) => ({
    ...section,
    order: sectionIndex + 1,
    entries: section.entries.filter((entry) => {
      if (!normalizedQuery) return true;
      return [section.title, section.titleAr, entry.title, entry.titleAr, entry.description, entry.descriptionAr]
        .join(" ")
        .toLocaleLowerCase()
        .includes(normalizedQuery);
    }),
  })).filter((section) => section.entries.length);

  return (
    <main className={`light-page ${view === "directory" ? "is-directory" : "is-reader"} ${viewTransitioning ? "is-view-transitioning" : ""} ${pickerHovered || languageHovered ? "is-considering" : ""} ${reader ? "has-reader" : ""} ${controlsHidden ? "controls-hidden" : ""} ${language.id === "ar" ? "is-arabic-ui" : ""}`}>
      {!showContent && <IntroAnimation onFinish={() => setShowContent(true)} />}

      <div className={`light-shell ${showContent ? "is-visible" : ""}`}>
        <div className="light-ambient" aria-hidden="true">
          {MOTES.map((mote) => (
            <i
              className="light-mote"
              key={mote.id}
              style={{
                "--mote-x": `${mote.x}%`,
                "--mote-delay": `${mote.delay}s`,
                "--mote-duration": `${mote.duration}s`,
                "--mote-size": `${mote.size}px`,
              }}
            />
          ))}
        </div>

        <section className="light-language-stage" aria-label="Choose a language">
          <div className="light-control-label">{language.id === "ar" ? "اللغة" : "Language"}</div>
          <div
            className={`light-picker light-language-picker ${languageOpen ? "is-open" : ""}`}
            ref={languageRef}
            onMouseEnter={() => {
              setLanguageOpen(true);
              setLanguageHovered(true);
            }}
            onMouseLeave={() => {
              setLanguageOpen(false);
              setLanguageHovered(false);
            }}
          >
            <button
              className="light-picker-trigger"
              type="button"
              aria-haspopup="listbox"
              aria-expanded={languageOpen}
              onClick={() => setLanguageOpen(true)}
            >
              <span>{language.label}</span>
              <Chevron />
            </button>
            <div className="light-options" role="listbox" aria-label="Language">
              <div className="light-particle-rain" aria-hidden="true">
                {MOTES.slice(0, 14).map((mote) => <i key={mote.id} style={{ "--rain-x": `${mote.x}%`, "--rain-delay": `${mote.delay}s` }} />)}
              </div>
              {LANGUAGES.map((choice, index) => (
                <button
                  className={`light-option ${language.id === choice.id ? "is-selected" : ""}`}
                  key={choice.id}
                  type="button"
                  role="option"
                  aria-selected={language.id === choice.id}
                  style={{ "--option-index": index }}
                  onClick={() => changeLanguage(choice)}
                >
                  <span>{choice.label}</span>
                  <i aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        </section>

        <button
          className="light-context-button"
          type="button"
          onClick={view === "reader" ? returnToDirectory : goHome}
        >
          <span aria-hidden="true">←</span>
          {view === "reader"
            ? (language.id === "ar" ? "الدليل" : "Directory")
            : (language.id === "ar" ? "الرئيسية" : "Home")}
        </button>

        <label className="light-search">
          <SearchIcon />
          <input
            type="search"
            value={query}
            onFocus={() => view === "reader" && returnToDirectory()}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={language.id === "ar" ? "ابحث في المكتبة" : "Search the directory"}
            aria-label={language.id === "ar" ? "ابحث في المكتبة" : "Search the directory"}
          />
          {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search">×</button>}
        </label>

        {view === "directory" && (
          <section className="light-directory" dir={language.id === "ar" ? "rtl" : "ltr"} key={language.id}>
            <header className="light-directory-intro">
              <p>{language.id === "ar" ? "مكتبة النور" : "The light library"}</p>
              <h1>{language.id === "ar" ? "أفكار تستحق أن تقرأ ببطء." : "Ideas worth reading slowly."}</h1>
              <span>{language.id === "ar" ? "مساحة للأسئلة والحجج والنصوص التي أعود إليها." : "A growing directory of questions, arguments, and pieces I return to."}</span>
            </header>

            <div className="light-directory-sections" key={`${language.id}-${normalizedQuery}`}>
              {visibleSections.map((section, sectionIndex) => (
                <section className="light-directory-section" key={section.id} style={{ "--section-index": sectionIndex }}>
                  <header>
                    <span>{localize(section, "eyebrow")}</span>
                    <h2>{localize(section, "title")}</h2>
                    <small>{String(section.order).padStart(2, "0")}</small>
                  </header>
                  <div className="light-directory-entries">
                    {section.entries.map((entry) => (
                      <button
                        className={`light-directory-entry ${entry.available ? "is-available" : ""}`}
                        key={entry.id}
                        type="button"
                        onClick={entry.available ? openReader : undefined}
                        aria-disabled={!entry.available}
                      >
                        <span className="light-entry-orbit" aria-hidden="true" />
                        <span className="light-entry-copy">
                          <strong>{localize(entry, "title")}</strong>
                          <small>{localize(entry, "description")}</small>
                        </span>
                        <span className="light-entry-meta">
                          {entry.available ? (language.id === "ar" ? "اقرأ" : "Read") : (language.id === "ar" ? "قريبا" : "Soon")}
                          <i aria-hidden="true">↗</i>
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {!visibleSections.length && (
              <div className="light-directory-empty">
                <span>·</span>
                <p>{language.id === "ar" ? "لا توجد نتائج بعد." : "Nothing here yet."}</p>
              </div>
            )}
          </section>
        )}

        {view === "reader" && <section className="light-reader-stage" aria-label="Choose a reading perspective" ref={readerStageRef}>
          <div className="light-question">
            {language.id === "ar" ? "أقرأ هذا بصفتي" : <>Reading this as <span key={article}>{article}</span></>}
          </div>
          <div
            className={`light-picker ${open ? "is-open" : ""}`}
            ref={pickerRef}
            onMouseEnter={() => {
              setOpen(true);
              setPickerHovered(true);
            }}
            onMouseLeave={() => {
              setOpen(false);
              setPickerHovered(false);
              setHoveredReader(null);
            }}
          >
            <button
              className="light-picker-trigger"
              type="button"
              aria-haspopup="listbox"
              aria-expanded={open}
              onClick={() => setOpen(true)}
            >
              <span>{reader ? displayReader(reader) : "..."}</span>
              <Chevron />
            </button>

            <div className="light-options" role="listbox" aria-label="Reading perspective">
              <div className="light-particle-rain" aria-hidden="true">
                {MOTES.slice(0, 14).map((mote) => <i key={mote.id} style={{ "--rain-x": `${mote.x}%`, "--rain-delay": `${mote.delay}s` }} />)}
              </div>
              {READERS.map((choice, index) => (
                <button
                  className={`light-option ${reader?.id === choice.id ? "is-selected" : ""}`}
                  key={choice.id}
                  type="button"
                  role="option"
                  aria-selected={reader?.id === choice.id}
                  style={{ "--option-index": index }}
                  onMouseEnter={() => setHoveredReader(choice)}
                  onFocus={() => {
                    setPickerHovered(true);
                    setHoveredReader(choice);
                  }}
                  onBlur={() => setHoveredReader(null)}
                  onClick={() => chooseReader(choice)}
                >
                  <span>{displayReader(choice)}</span>
                  <i aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        </section>}

        {view === "reader" && <section className={`light-reading ${reader ? "is-visible" : ""}`} aria-live="polite" aria-busy={reader && !content}>
          {reader && (
            <div
              className={`light-reading-inner ${language.id === "ar" ? "is-arabic" : ""}`}
              dir={language.id === "ar" ? "rtl" : "ltr"}
              key={`${reader.id}-${language.id}`}
              ref={readingInnerRef}
            >
              {content ? <ReactMarkdown>{content}</ReactMarkdown> : <div className="light-content-loading" aria-label="Loading" />}
            </div>
          )}
        </section>}

      </div>
    </main>
  );
}
