import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useNavigate, useLocation } from "react-router-dom";
import IntroAnimation from "../components/intro";
import "./light.css";

const READERS = [
  { id: "muslim", label: "Muslim", labelAr: "مسلم", labelZh: "穆斯林", labelJa: "ムスリム" },
  { id: "christian", label: "Christian", labelAr: "مسيحي", labelZh: "基督徒", labelJa: "キリスト教徒" },
  { id: "jew", label: "Jew", labelAr: "يهودي", labelZh: "犹太教徒", labelJa: "ユダヤ教徒" },
  { id: "atheist", label: "atheist", labelAr: "ملحد", labelZh: "无神论者", labelJa: "無神論者" },
];

const LANGUAGES = [
  { id: "en", label: "English", available: true },
  { id: "ar", label: "العربية", available: false },
  { id: "zh", label: "中文", available: false },
  { id: "ja", label: "日本語", available: false },
];

const UI_COPY = {
  en: { language: "Language", home: "Home", directory: "Directory", search: "Search the library", results: "Search results", empty: "No matching passages yet.", soon: "Soon", read: "Read", library: "The light library", intro: "Ideas worth reading slowly.", introNote: "A growing directory of questions, arguments, and pieces I return to.", reading: "Reading this as", overview: "Overview" },
  ar: { language: "اللغة", home: "الرئيسية", directory: "الدليل", search: "ابحث في المكتبة", results: "نتائج البحث", empty: "لا توجد نتائج.", soon: "قريبا", read: "اقرأ", library: "مكتبة النور", intro: "أفكار تستحق أن تقرأ ببطء.", introNote: "مساحة للأسئلة والحجج والنصوص التي أعود إليها.", reading: "أقرأ هذا بصفتي", overview: "نظرة عامة" },
  zh: { language: "语言", home: "主页", directory: "目录", search: "搜索资料库", results: "搜索结果", empty: "没有找到相关内容。", soon: "即将推出", read: "阅读", library: "光之资料库", intro: "值得慢慢阅读的思想。", introNote: "一个不断扩展的问题、论证与文章目录。", reading: "以此身份阅读", overview: "概览" },
  ja: { language: "言語", home: "ホーム", directory: "目次", search: "ライブラリを検索", results: "検索結果", empty: "一致する文章はありません。", soon: "近日公開", read: "読む", library: "光のライブラリ", intro: "ゆっくり読む価値のある思想。", introNote: "問い、論証、そして何度も読み返す文章の目次。", reading: "この立場で読む", overview: "概要" },
};

const DIRECTORY = [
  {
    id: "introduction",
    title: "Introduction",
    titleAr: "مقدمة",
    eyebrow: "Begin here",
    eyebrowAr: "ابدأ هنا",
    entries: [
      { id: "signs", title: "The signs in the horizons", titleAr: "اياتنا في الافاق", description: "Qur'an 41:53, approached through four different ways of reading.", descriptionAr: "قراءة الاية ٤١:٥٣ من خلال أربع وجهات نظر مختلفة.", available: true },
    ],
  },
  {
    id: "new-to-islaam",
    title: "New to Islaam",
    titleAr: "جديد في الإسلام",
    eyebrow: "A clear beginning",
    eyebrowAr: "بداية واضحة",
    entries: [
      { id: "become-muslim", title: "How to become Muslim? What to do next?", titleAr: "كيف تصبح مسلما؟ وماذا بعد؟", description: "The testimony of faith and the first steps that follow it.", descriptionAr: "شهادة الإيمان والخطوات الأولى التي تليها.", available: true },
      { id: "five-pillars", title: "The 5 pillars of islam", titleAr: "أركان الإسلام الخمسة", description: "The essential acts that shape a Muslim life.", descriptionAr: "العبادات الأساسية التي تشكل حياة المسلم.", available: true },
    ],
  },
  {
    id: "refutations",
    title: "Refutations",
    titleAr: "ردود",
    eyebrow: "Claims, examined",
    eyebrowAr: "مراجعة الادعاءات",
    entries: [
      { id: "aisha-six", title: "Aisha 6", titleAr: "عائشة ٦", description: "A careful examination of the claim, its sources, and its historical context.", descriptionAr: "دراسة متأنية للادعاء ومصادره وسياقه التاريخي.", available: true },
      { id: "isis-alqaeda", title: "ISIS/Al Qaeda", titleAr: "داعش والقاعدة", description: "What their violence represents—and what Islam actually teaches.", descriptionAr: "ما الذي يمثله عنفهم، وما الذي يعلمه الإسلام بالفعل.", available: true },
    ],
  },
  {
    id: "proofs",
    title: "Proofs",
    titleAr: "ادلة",
    eyebrow: "Evidence, gathered",
    eyebrowAr: "الأدلة",
    entries: [
      { id: "creator", title: "Existence of a creator; Allaah", titleAr: "وجود الخالق؛ الله", description: "Why existence, order, and dependence point to the Creator.", descriptionAr: "كيف يشير الوجود والنظام والافتقار إلى الخالق.", available: true },
      { id: "quraan-word", title: "The Quraan is the word of Allaah", titleAr: "القرآن كلام الله", description: "A beginning look at the case for the divine origin of the Quraan.", descriptionAr: "نظرة أولية في أدلة المصدر الإلهي للقرآن.", available: true },
    ],
  },
  {
    id: "closed-heart",
    title: "Too chad to be wrong",
    titleAr: "أنا معاد للإسلام / أعتقد أنني لا يمكن أن أكون مخطئا / أنكر المنطق",
    eyebrow: "A word between us",
    eyebrowAr: "كلمة بيننا",
    entries: [
      { id: "open-your-heart", title: "May the one who created you open your heart, will work especially on this page for you soon", titleAr: "أسأل من خلقك أن يفتح قلبك يا صديقي، سأعمل على هذه الصفحة قريبا.", description: "Belief does not alter truth: 1 + 1 remains 2.", descriptionAr: "أسأل من خلقك أن يفتح قلبك يا صديقي، سأعمل على هذه الصفحة قريبا.", available: true },
    ],
  },
];

const DIRECTORY_LOCALE = {
  zh: {
    introduction: { title: "介绍", eyebrow: "从这里开始" },
    signs: { title: "天地与自身中的迹象", description: "从四种不同的阅读视角理解《古兰经》41:53。" },
    "new-to-islaam": { title: "初识伊斯兰", eyebrow: "清晰的起点" },
    "become-muslim": { title: "如何成为穆斯林？接下来该做什么？", description: "信仰作证，以及之后最初的几步。" },
    "five-pillars": { title: "伊斯兰的五大支柱", description: "塑造穆斯林生活的基本功修。" },
    refutations: { title: "回应质疑", eyebrow: "审视主张" },
    "aisha-six": { title: "阿伊莎六岁", description: "谨慎考察这一主张、其来源与历史背景。" },
    "isis-alqaeda": { title: "ISIS／基地组织", description: "他们的暴力代表什么，以及伊斯兰真正教导什么。" },
    proofs: { title: "证据", eyebrow: "汇集证据" },
    creator: { title: "造物主——安拉的存在", description: "存在、秩序与依赖为何指向造物主。" },
    "quraan-word": { title: "《古兰经》是安拉的言语", description: "初步考察《古兰经》神圣来源的证据。" },
    "closed-heart": { title: "我是仇视伊斯兰者／我不可能错／我否认逻辑", eyebrow: "我们之间的一句话" },
    "open-your-heart": { title: "愿创造你的主开启你的心，我的朋友；此页即将完善。", description: "愿创造你的主开启你的心，我的朋友；此页即将完善。" },
  },
  ja: {
    introduction: { title: "はじめに", eyebrow: "ここから始める" },
    signs: { title: "地平線と自らの内にあるしるし", description: "クルアーン41章53節を四つの読み方から考えます。" },
    "new-to-islaam": { title: "イスラームを知り始めた方へ", eyebrow: "明確な出発点" },
    "become-muslim": { title: "ムスリムになるには？その次にすることは？", description: "信仰告白と、その後の最初の歩み。" },
    "five-pillars": { title: "イスラームの五柱", description: "ムスリムの生き方を形づくる基本の崇拝。" },
    refutations: { title: "反論への回答", eyebrow: "主張を検討する" },
    "aisha-six": { title: "アーイシャは6歳だったのか", description: "主張、史料、歴史的背景を丁寧に検討します。" },
    "isis-alqaeda": { title: "ISIS／アルカーイダ", description: "彼らの暴力が何を意味し、イスラームが実際に何を教えるか。" },
    proofs: { title: "証明", eyebrow: "証拠を集める" },
    creator: { title: "創造主アッラーの存在", description: "存在、秩序、依存が創造主を指し示す理由。" },
    "quraan-word": { title: "クルアーンはアッラーの言葉", description: "クルアーンの神的起源を示す根拠への導入。" },
    "closed-heart": { title: "私はイスラーム嫌悪者だ／自分が間違うはずがない／論理を否定する", eyebrow: "私たちの間の一言" },
    "open-your-heart": { title: "あなたを創造された御方が心を開いてくださいますように、友よ。この頁は近日整えます。", description: "あなたを創造された御方が心を開いてくださいますように、友よ。この頁は近日整えます。" },
  },
};

const MOTES = Array.from({ length: 52 }, (_, index) => ({
  id: index,
  x: (index * 37) % 97,
  delay: -((index * 0.71) % 9),
  duration: 6 + ((index * 13) % 31) / 10,
  size: 1 + (index % 3),
}));

const INTRO_ENTRY = DIRECTORY[0].entries[0];
const ALL_ENTRIES = DIRECTORY.flatMap((section) => section.entries);
const ENTRY_CATEGORY = Object.fromEntries(DIRECTORY.flatMap((section) => section.entries.map((entry) => [entry.id, section.id])));

function contentPath(languageId, entry, readerId) {
  const category = ENTRY_CATEGORY[entry.id];
  if (entry.id === INTRO_ENTRY.id) return `/light/content/${languageId}/${category}/${entry.id}/${readerId}.md`;
  return `/light/content/${languageId}/${category}/${entry.id}.md`;
}

function directoryText(item, key, languageId) {
  if (DIRECTORY_LOCALE[languageId]?.[item.id]?.[key]) return DIRECTORY_LOCALE[languageId][item.id][key];
  if (languageId === "ar") return item[`${key}Ar`] || item[key];
  return item[key];
}

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

function cleanMarkdownLine(line) {
  return line
    .replace(/^>\s?/, "")
    .replace(/^[-*+]\s+/, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`~]/g, "")
    .trim();
}

function excerptAround(text, query, radius = 92) {
  const lowerText = text.toLocaleLowerCase();
  const index = lowerText.indexOf(query);
  if (index < 0 || text.length <= radius * 2) return text;
  const start = Math.max(0, index - radius);
  const end = Math.min(text.length, index + query.length + radius);
  return `${start > 0 ? "…" : ""}${text.slice(start, end).trim()}${end < text.length ? "…" : ""}`;
}

function HighlightedText({ text, query }) {
  if (!query) return text;
  const lowerText = text.toLocaleLowerCase();
  const pieces = [];
  let cursor = 0;
  let matchIndex = lowerText.indexOf(query, cursor);

  while (matchIndex >= 0) {
    if (matchIndex > cursor) pieces.push(text.slice(cursor, matchIndex));
    pieces.push(<u key={`${matchIndex}-${cursor}`}>{text.slice(matchIndex, matchIndex + query.length)}</u>);
    cursor = matchIndex + query.length;
    matchIndex = lowerText.indexOf(query, cursor);
  }
  if (cursor < text.length) pieces.push(text.slice(cursor));
  return pieces;
}

export default function Light() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showContent, setShowContent] = useState(() => Boolean(location.state?.skipIntro));
  const [view, setView] = useState("directory");
  const [viewTransitioning, setViewTransitioning] = useState(false);
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchDocuments, setSearchDocuments] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [pickerHovered, setPickerHovered] = useState(false);
  const [hoveredReader, setHoveredReader] = useState(null);
  const [reader, setReader] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(INTRO_ENTRY);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [languageHovered, setLanguageHovered] = useState(false);
  const [controlsHidden, setControlsHidden] = useState(false);
  const [content, setContent] = useState("");
  const [hoveredSection, setHoveredSection] = useState(null);
  const pickerRef = useRef(null);
  const languageRef = useRef(null);
  const searchRef = useRef(null);
  const readerStageRef = useRef(null);
  const readingInnerRef = useRef(null);
  const controlsHiddenRef = useRef(false);
  const transitionTimerRef = useRef(null);
  const isIntroduction = selectedEntry.id === INTRO_ENTRY.id;
  const writeupReady = view === "reader" && (!isIntroduction || Boolean(reader));
  const ui = UI_COPY[language.id];

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    const close = (event) => {
      if (!pickerRef.current?.contains(event.target)) setOpen(false);
      if (!languageRef.current?.contains(event.target)) setLanguageOpen(false);
      if (!searchRef.current?.contains(event.target)) setSearchFocused(false);
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
      if (view === "directory") {
        updateControlsHidden(scrollPosition > 110);
        return;
      }
      if (!writeupReady || scrollPosition <= 2) {
        updateControlsHidden(false);
        return;
      }
      if (readingInnerRef.current) {
        const controlsBottom = readerStageRef.current?.getBoundingClientRect().bottom || 92;
        const articleTop = readingInnerRef.current.getBoundingClientRect().top;
        updateControlsHidden(articleTop <= controlsBottom + 72);
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [reader, view, writeupReady]);

  useEffect(() => {
    if (view !== "reader" || (isIntroduction && !reader)) return;
    let active = true;
    setContent("");
    fetch(contentPath(language.id, selectedEntry, reader?.id || READERS[0].id))
      .then((response) => {
        if (!response.ok) throw new Error(`Unable to load ${response.url}`);
        return response.text();
      })
      .then((markdown) => active && setContent(markdown))
      .catch(() => active && setContent("# Content unavailable\n\nThis reading could not be loaded."));
    return () => { active = false; };
  }, [language.id, reader, selectedEntry, view, isIntroduction]);

  useEffect(() => {
    let active = true;
    setSearchLoading(true);
    const documents = ALL_ENTRIES.flatMap((entry) => entry.id === INTRO_ENTRY.id
      ? READERS.map((choice) => ({ entry, choice }))
      : [{ entry, choice: READERS[0] }]);
    Promise.all(documents.map(({ entry, choice }) =>
      fetch(contentPath(language.id, entry, choice.id))
        .then((response) => response.ok ? response.text() : "")
        .then((markdown) => ({ entry, choice, markdown }))
    )).then((documents) => {
      if (active) setSearchDocuments(documents);
    }).finally(() => {
      if (active) setSearchLoading(false);
    });
    return () => { active = false; };
  }, [language.id]);

  const chooseReader = (choice) => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    controlsHiddenRef.current = false;
    setControlsHidden(false);
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

  const openReader = (entry = INTRO_ENTRY) => transitionView("reader", () => {
    setSelectedEntry(entry);
    setReader(null);
    setContent("");
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
    if (!choice.available) return;
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
  const displayReader = (choice) => choice[`label${language.id === "en" ? "" : language.id.charAt(0).toUpperCase() + language.id.slice(1)}`] || choice.label;
  const localize = (item, key) => directoryText(item, key, language.id);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleSections = DIRECTORY.map((section, sectionIndex) => ({
    ...section,
    order: sectionIndex + 1,
    entries: section.entries,
  }));

  const searchResults = useMemo(() => {
    if (!normalizedQuery) return [];
    const results = [];

    DIRECTORY.forEach((section) => {
      section.entries.forEach((entry) => {
        const title = directoryText(entry, "title", language.id);
        const description = directoryText(entry, "description", language.id);
        const category = directoryText(section, "title", language.id);
        const matchedText = [title, description].find((value) => value.toLocaleLowerCase().includes(normalizedQuery));
        if (matchedText) {
          results.push({
            id: `directory-${section.id}-${entry.id}`,
            heading: `${category} · ${title}`,
            excerpt: excerptAround(matchedText, normalizedQuery),
            available: Boolean(entry.available),
            kind: "directory",
            entryId: entry.id,
          });
        }
      });
    });

    searchDocuments.forEach(({ entry, choice, markdown }) => {
      let pageTitle = directoryText(entry, "title", language.id);
      let sectionTitle = entry.id === INTRO_ENTRY.id
        ? (choice[`label${language.id === "en" ? "" : language.id.charAt(0).toUpperCase() + language.id.slice(1)}`] || choice.label)
        : ui.overview;
      let documentHits = 0;

      markdown.split(/\r?\n/).forEach((rawLine, lineIndex) => {
        const headingMatch = rawLine.match(/^(#{1,3})\s+(.+)/);
        if (headingMatch) {
          const headingText = cleanMarkdownLine(headingMatch[2]);
          if (headingMatch[1].length === 1) pageTitle = headingText;
          else sectionTitle = headingText;
          return;
        }

        const line = cleanMarkdownLine(rawLine);
        if (!line || line.length < 12 || !line.toLocaleLowerCase().includes(normalizedQuery) || documentHits >= 2) return;
        results.push({
          id: `writeup-${entry.id}-${choice.id}-${lineIndex}`,
          heading: `${pageTitle} · ${sectionTitle}`,
          excerpt: excerptAround(line, normalizedQuery),
          available: true,
          kind: "writeup",
          readerId: choice.id,
          entryId: entry.id,
        });
        documentHits += 1;
      });
    });

    return results.slice(0, 9);
  }, [language.id, normalizedQuery, searchDocuments, ui.overview]);

  const openSearchResult = (result) => {
    if (!result.available) return;
    setQuery("");
    setSearchFocused(false);

    if (result.kind === "writeup") {
      const selectedReader = READERS.find((choice) => choice.id === result.readerId);
      const resultEntry = ALL_ENTRIES.find((entry) => entry.id === result.entryId) || INTRO_ENTRY;
      if (!selectedReader) return;
      if (view === "reader") {
        setSelectedEntry(resultEntry);
        setReader(resultEntry.id === INTRO_ENTRY.id ? selectedReader : null);
        setControlsHidden(false);
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      } else {
        transitionView("reader", () => {
          setSelectedEntry(resultEntry);
          setReader(resultEntry.id === INTRO_ENTRY.id ? selectedReader : null);
          setControlsHidden(false);
        });
      }
      return;
    }

    const resultEntry = ALL_ENTRIES.find((entry) => entry.id === result.entryId) || INTRO_ENTRY;
    openReader(resultEntry);
  };

  return (
    <main className={`light-page ${view === "directory" ? "is-directory" : "is-reader"} ${viewTransitioning ? "is-view-transitioning" : ""} ${pickerHovered || languageHovered || searchFocused ? "is-considering" : ""} ${searchFocused ? "is-searching" : ""} ${reader ? "has-reader" : ""} ${view === "reader" && !isIntroduction ? "is-standard-writeup" : ""} ${controlsHidden ? "controls-hidden" : ""} ${language.id === "ar" ? "is-arabic-ui" : ""}`}>
      {!showContent && <IntroAnimation onFinish={() => setShowContent(true)} />}

      <div className={`light-shell ${showContent ? "is-visible" : ""}`}>
        <div className="light-ambient" aria-hidden="true">
          {MOTES.map((mote) => (
            <i className="light-mote" key={mote.id} style={{ "--mote-x": `${mote.x}%`, "--mote-delay": `${mote.delay}s`, "--mote-duration": `${mote.duration}s`, "--mote-size": `${mote.size}px` }} />
          ))}
        </div>

        <section className="light-language-stage" aria-label="Choose a language">
          <div className="light-control-label">{ui.language}</div>
          <div className={`light-picker light-language-picker ${languageOpen ? "is-open" : ""}`} ref={languageRef} onMouseEnter={() => { setLanguageOpen(true); setLanguageHovered(true); }} onMouseLeave={() => { setLanguageOpen(false); setLanguageHovered(false); }}>
            <button className="light-picker-trigger" type="button" aria-haspopup="listbox" aria-expanded={languageOpen} onClick={() => setLanguageOpen(true)}>
              <span>{language.label}</span>
              <Chevron />
            </button>
            <div className="light-options" role="listbox" aria-label="Language">
              <div className="light-particle-rain" aria-hidden="true">
                {MOTES.slice(0, 14).map((mote) => <i key={mote.id} style={{ "--rain-x": `${mote.x}%`, "--rain-delay": `${mote.delay}s` }} />)}
              </div>
              {LANGUAGES.map((choice, index) => (
                <button className={`light-option ${language.id === choice.id ? "is-selected" : ""} ${!choice.available ? "is-coming-soon" : ""}`} key={choice.id} type="button" role="option" aria-selected={language.id === choice.id} aria-disabled={!choice.available} style={{ "--option-index": index }} onClick={() => changeLanguage(choice)}>
                  <span className="light-option-label">{choice.label}</span>
                  {!choice.available && <span className="light-option-soon">Soon</span>}
                  <i aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        </section>

        <button className="light-context-button" type="button" onClick={view === "reader" ? returnToDirectory : goHome}>
          <span aria-hidden="true">←</span>
          {view === "reader" ? ui.directory : ui.home}
        </button>

        <div className={`light-search-shell ${searchFocused && normalizedQuery ? "has-results" : ""}`} ref={searchRef}>
          <label className="light-search">
            <SearchIcon />
            <input
              type="search"
              value={query}
              onFocus={() => setSearchFocused(true)}
              onChange={(event) => { setQuery(event.target.value); setSearchFocused(true); }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setQuery("");
                  setSearchFocused(false);
                  event.currentTarget.blur();
                }
              }}
              placeholder={ui.search}
              aria-label={ui.search}
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={Boolean(searchFocused && normalizedQuery)}
              aria-controls="light-search-results"
            />
            {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search">×</button>}
          </label>

          {searchFocused && normalizedQuery && (
            <div className="light-search-results" id="light-search-results" role="listbox" data-lenis-prevent key={`${language.id}-${normalizedQuery}`}>
              <div className="light-search-results-heading">
                <span>{ui.results}</span>
                <small>{searchLoading ? "…" : searchResults.length}</small>
              </div>
              {!searchLoading && searchResults.map((result, resultIndex) => (
                <button
                  className={`light-search-result ${result.available ? "is-available" : ""}`}
                  key={result.id}
                  type="button"
                  role="option"
                  aria-selected="false"
                  aria-disabled={!result.available}
                  style={{ "--result-index": resultIndex }}
                  onClick={() => openSearchResult(result)}
                >
                  <strong>{result.heading}</strong>
                  <span><HighlightedText text={result.excerpt} query={normalizedQuery} /></span>
                  {!result.available && <small>{ui.soon}</small>}
                </button>
              ))}
              {!searchLoading && !searchResults.length && (
                <p className="light-search-empty">{ui.empty}</p>
              )}
            </div>
          )}
        </div>

        {view === "directory" && (
          <section className="light-directory" dir={language.id === "ar" ? "rtl" : "ltr"} key={language.id}>
            <header className="light-directory-intro">
              <p>{ui.library}</p>
              <h1>{ui.intro}</h1>
              <span>{ui.introNote}</span>
            </header>

            <div className="light-directory-accordion" key={language.id}>
              {visibleSections.map((section, sectionIndex) => {
                const isExpanded = hoveredSection === section.id;
                return (
                  <div
                    className={`light-directory-accordion-item ${isExpanded ? "is-expanded" : ""}`}
                    key={section.id}
                    style={{ "--section-index": sectionIndex }}
                    onMouseEnter={() => setHoveredSection(section.id)}
                    onMouseLeave={() => setHoveredSection(null)}
                  >
                    <header className="light-directory-accordion-header">
                      <span className="light-directory-accordion-eyebrow">{localize(section, "eyebrow")}</span>
                      <div className="light-directory-accordion-title-row">
                        <h2>{localize(section, "title")}</h2>
                        <span className="light-directory-accordion-count">{section.entries.length}</span>
                        <span className="light-directory-accordion-chevron" aria-hidden="true">
                          <Chevron />
                        </span>
                      </div>
                    </header>

                    <div className="light-directory-accordion-body">
                      <div className="light-directory-accordion-inner">
                        {section.entries.map((entry, entryIndex) => (
                          <button
                            className={`light-directory-entry ${entry.available ? "is-available" : ""}`}
                            key={entry.id}
                            type="button"
                            onClick={entry.available ? () => openReader(entry) : undefined}
                            aria-disabled={!entry.available}
                            style={{ "--entry-index": entryIndex }}
                          >
                            <span className="light-entry-orbit" aria-hidden="true" />
                            <span className="light-entry-copy">
                              <strong>{localize(entry, "title")}</strong>
                              <small>{localize(entry, "description")}</small>
                            </span>
                            <span className="light-entry-meta">
                              {entry.available ? ui.read : ui.soon}
                              <i aria-hidden="true">↗</i>
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {!visibleSections.length && (
              <div className="light-directory-empty">
                <span>·</span>
                <p>{ui.empty}</p>
              </div>
            )}
          </section>
        )}

        {view === "reader" && isIntroduction && <section className="light-reader-stage" aria-label="Choose a reading perspective" ref={readerStageRef}>
          <div className="light-question">
            {language.id === "en" ? <>{ui.reading} <span key={article}>{article}</span></> : ui.reading}
          </div>
          <div className={`light-picker ${open ? "is-open" : ""}`} ref={pickerRef} onMouseEnter={() => { setOpen(true); setPickerHovered(true); }} onMouseLeave={() => { setOpen(false); setPickerHovered(false); setHoveredReader(null); }}>
            <button className="light-picker-trigger" type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(true)}>
              <span>{reader ? displayReader(reader) : "..."}</span>
              <Chevron />
            </button>
            <div className="light-options" role="listbox" aria-label="Reading perspective">
              <div className="light-particle-rain" aria-hidden="true">
                {MOTES.slice(0, 14).map((mote) => <i key={mote.id} style={{ "--rain-x": `${mote.x}%`, "--rain-delay": `${mote.delay}s` }} />)}
              </div>
              {READERS.map((choice, index) => (
                <button className={`light-option ${reader?.id === choice.id ? "is-selected" : ""}`} key={choice.id} type="button" role="option" aria-selected={reader?.id === choice.id} style={{ "--option-index": index }} onMouseEnter={() => setHoveredReader(choice)} onFocus={() => { setPickerHovered(true); setHoveredReader(choice); }} onBlur={() => setHoveredReader(null)} onClick={() => chooseReader(choice)}>
                  <span>{displayReader(choice)}</span>
                  <i aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        </section>}

        {view === "reader" && <section className={`light-reading ${writeupReady ? "is-visible" : ""}`} aria-live="polite" aria-busy={writeupReady && !content}>
          {writeupReady && (
            <div className={`light-reading-inner ${language.id === "ar" ? "is-arabic" : ""}`} dir={language.id === "ar" ? "rtl" : "ltr"} key={`${selectedEntry.id}-${reader?.id || "standard"}-${language.id}`} ref={readingInnerRef}>
              {content ? <ReactMarkdown>{content}</ReactMarkdown> : <div className="light-content-loading" aria-label="Loading" />}
            </div>
          )}
        </section>}

      </div>
    </main>
  );
}
