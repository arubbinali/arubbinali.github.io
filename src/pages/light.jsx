import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import { useNavigate, useLocation } from "react-router-dom";
import Lenis from "lenis";
import IntroAnimation from "../components/intro";
import { SiteChrome } from "../components/SiteChrome";
import { glossify, ReaderExperience } from "../components/ReaderExperience";
import { LIGHT_CONTENT, SITE_COMMITS } from "../generated/lightData";
import "./light.css";

const READERS = [
  { id: "muslim", label: "Muslim", labelAr: "مسلم", labelZh: "穆斯林", labelJa: "ムスリム" },
  { id: "christian", label: "Christian", labelAr: "مسيحي", labelZh: "基督徒", labelJa: "キリスト教徒" },
  { id: "jew", label: "Jew", labelAr: "يهودي", labelZh: "犹太教徒", labelJa: "ユダヤ教徒" },
  { id: "buddhist", label: "Buddhist", labelAr: "بوذي", labelZh: "佛教徒", labelJa: "仏教徒" },
  { id: "atheist", label: "atheist", labelAr: "ملحد", labelZh: "无神论者", labelJa: "無神論者" },
  { id: "agnostic", label: "agnostic", labelAr: "لاأدري", labelZh: "不可知论者", labelJa: "不可知論者" },
];

const ACTIVE_LANGUAGE = { id: "en", label: "English", available: true };

const UI_COPY = {
  en: { language: "Language", home: "Home", directory: "Directory", search: "Search the library", results: "Search results", empty: "No matching passages yet.", soon: "Soon", read: "Read", library: "The light library", intro: "Ideas worth reading slowly.", introNote: "A growing directory of questions, arguments, and pieces I return to.", progressNote: "I have not yet started to work on any of the write ups, do reach out if you can help, id really appreciate it :)", contribute: "Reach out", reading: "Reading this as", overview: "Overview" },
  ar: { language: "اللغة", home: "الرئيسية", directory: "الدليل", search: "ابحث في المكتبة", results: "نتائج البحث", empty: "لا توجد نتائج.", soon: "قريبا", read: "اقرأ", library: "مكتبة النور", intro: "أفكار تستحق أن تقرأ ببطء.", introNote: "مساحة للأسئلة والحجج والنصوص التي أعود إليها.", reading: "أقرأ هذا بصفتي", overview: "نظرة عامة" },
  zh: { language: "语言", home: "主页", directory: "目录", search: "搜索资料库", results: "搜索结果", empty: "没有找到相关内容。", soon: "即将推出", read: "阅读", library: "光之资料库", intro: "值得慢慢阅读的思想。", introNote: "一个不断扩展的问题、论证与文章目录。", reading: "以此身份阅读", overview: "概览" },
  ja: { language: "言語", home: "ホーム", directory: "目次", search: "ライブラリを検索", results: "検索結果", empty: "一致する文章はありません。", soon: "近日公開", read: "読む", library: "光のライブラリ", intro: "ゆっくり読む価値のある思想。", introNote: "問い、論証、そして何度も読み返す文章の目次。", reading: "この立場で読む", overview: "概要" },
};

export const DIRECTORY = [
  {
    id: "introduction",
    title: "Introduction",
    titleAr: "مقدمة",
    eyebrow: "Begin here",
    eyebrowAr: "ابدأ هنا",
    entries: [
      { id: "signs", title: "The signs in the horizons", titleAr: "اياتنا في الافاق", description: "Qur'an 41:53, approached through six different ways of reading.", descriptionAr: "قراءة الاية ٤١:٥٣ من خلال ست وجهات نظر مختلفة.", available: true },
    ],
  },
  {
    id: "new-to-islaam",
    title: "New to Islam",
    titleAr: "جديد في الإسلام",
    eyebrow: "A clear beginning",
    eyebrowAr: "بداية واضحة",
    entries: [
      { id: "become-muslim", title: "How to become Muslim?", titleAr: "كيف تصبح مسلما؟", description: "The testimony of faith and how to enter Islam.", descriptionAr: "شهادة الإيمان وكيفية الدخول في الإسلام.", available: true },
      { id: "what-next", title: "What next?", titleAr: "وماذا بعد؟", description: "A clear path for the first steps after becoming Muslim.", descriptionAr: "طريق واضح للخطوات الأولى بعد الإسلام.", available: true },
      { id: "five-pillars", title: "The 5 pillars of islam", titleAr: "أركان الإسلام الخمسة", description: "The essential acts that shape a Muslim life.", descriptionAr: "العبادات الأساسية التي تشكل حياة المسلم.", available: true },
    ],
  },
  {
    id: "proofs",
    title: "Proofs",
    titleAr: "ادلة",
    eyebrow: "Evidence, gathered",
    eyebrowAr: "الأدلة",
    entries: [
      { id: "creator", title: "Existence of a creator; Allah", titleAr: "وجود الخالق؛ الله", description: "Why existence, order, and dependence point to the Creator.", descriptionAr: "كيف يشير الوجود والنظام والافتقار إلى الخالق.", available: true },
      { id: "quraan-word", title: "The Quraan is the word of Allah", titleAr: "القرآن كلام الله", description: "A beginning look at the case for the divine origin of the Quraan.", descriptionAr: "نظرة أولية في أدلة المصدر الإلهي للقرآن.", available: true },
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
    id: "sources",
    title: "Sources",
    titleAr: "المصادر",
    eyebrow: "Read further",
    eyebrowAr: "للمزيد",
    entries: [
      { id: "sources", title: "Sources and references", titleAr: "المصادر والمراجع", description: "The references, texts, and works used throughout this library.", descriptionAr: "المراجع والنصوص المستخدمة في هذه المكتبة.", available: true },
    ],
  },
  {
    id: "closed-heart",
    title: "Too chad to be wrong",
    titleAr: "أنا معاد للإسلام / أعتقد أنني لا يمكن أن أكون مخطئا / أنكر المنطق",
    eyebrow: "A word between us",
    eyebrowAr: "كلمة بيننا",
    entries: [
      { id: "open-your-heart", title: "May your creator open your heart to the truth, will work especially on this page for you soon", titleAr: "أسأل من خلقك أن يفتح قلبك يا صديقي، سأعمل على هذه الصفحة قريبا.", description: "Soon", descriptionAr: "قريبا", available: true },
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

function contentKey(languageId, entry, readerId) {
  const category = ENTRY_CATEGORY[entry.id];
  if (entry.id === INTRO_ENTRY.id) return `${languageId}/${category}/${entry.id}/${readerId}.md`;
  return `${languageId}/${category}/${entry.id}.md`;
}

async function loadMarkdown(languageId, entry, readerId) {
  const key = contentKey(languageId, entry, readerId);
  const fallback = LIGHT_CONTENT[key];
  try {
    const response = await fetch(contentPath(languageId, entry, readerId), { cache: "no-cache" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const markdown = await response.text();
    if (/^\s*<!doctype html/i.test(markdown)) throw new Error("HTML fallback returned for Markdown");
    return markdown || fallback || "";
  } catch {
    return fallback || "";
  }
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

const MARKDOWN_COMPONENTS = {
  p: ({ children }) => <p>{glossify(children)}</p>,
  li: ({ children }) => <li>{glossify(children)}</li>,
  h2: ({ children }) => <h2>{glossify(children)}</h2>,
  h3: ({ children }) => <h3>{glossify(children)}</h3>,
};

export default function Light() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeParts = location.pathname.split("/").filter(Boolean);
  const routeEntry = ALL_ENTRIES.find((entry) => entry.id === routeParts[1]);
  const routeReader = READERS.find((choice) => choice.id === routeParts[2]);
  const [showContent, setShowContent] = useState(() => Boolean(location.state?.skipIntro));
  const [view, setView] = useState(routeEntry ? "reader" : "directory");
  const [viewTransitioning, setViewTransitioning] = useState(false);
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchDocuments, setSearchDocuments] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [pickerHovered, setPickerHovered] = useState(false);
  const [hoveredReader, setHoveredReader] = useState(null);
  const [reader, setReader] = useState(routeEntry?.id === INTRO_ENTRY.id ? routeReader || null : null);
  const [selectedEntry, setSelectedEntry] = useState(routeEntry || INTRO_ENTRY);
  const language = ACTIVE_LANGUAGE;
  const [controlsHidden, setControlsHidden] = useState(false);
  const [content, setContent] = useState("");
  const [hoveredSection, setHoveredSection] = useState(null);
  const [readingMode, setReadingMode] = useState(() => window.localStorage.getItem("doaor-reading-mode") || "study");
  const pickerRef = useRef(null);
  const lightPageRef = useRef(null);
  const searchRef = useRef(null);
  const readerStageRef = useRef(null);
  const readingInnerRef = useRef(null);
  const controlsHiddenRef = useRef(false);

  useEffect(() => {
    document.documentElement.classList.add("light-scroll-owned");
    document.body.classList.add("light-scroll-owned");
    return () => {
      document.documentElement.classList.remove("light-scroll-owned");
      document.body.classList.remove("light-scroll-owned");
    };
  }, []);
  const transitionTimerRef = useRef(null);
  const isIntroduction = selectedEntry.id === INTRO_ENTRY.id;
  const writeupReady = view === "reader" && (!isIntroduction || Boolean(reader));
  const ui = UI_COPY[language.id];

  useEffect(() => {
    lightPageRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
    const close = (event) => {
      if (!pickerRef.current?.contains(event.target)) setOpen(false);
      if (!searchRef.current?.contains(event.target)) setSearchFocused(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  useEffect(() => {
    const wrapper = lightPageRef.current;
    const scrollContent = wrapper?.querySelector(".light-shell");
    if (!wrapper || !scrollContent) return undefined;
    const smoothScroll = new Lenis({
      wrapper,
      content: scrollContent,
      duration: 1.15,
      easing: (value) => Math.min(1, 1.001 - Math.pow(2, -10 * value)),
      smoothWheel: true,
      smoothTouch: false,
      prevent: (node) => {
        const prevented = node.closest?.("[data-lenis-prevent]");
        return Boolean(prevented && prevented !== wrapper);
      },
    });
    let frameId;
    const frame = (time) => { smoothScroll.raf(time); frameId = window.requestAnimationFrame(frame); };
    frameId = window.requestAnimationFrame(frame);
    return () => { window.cancelAnimationFrame(frameId); smoothScroll.destroy(); };
  }, []);

  useEffect(() => () => window.clearTimeout(transitionTimerRef.current), []);

  useEffect(() => {
    const changeMode = (event) => setReadingMode(event.detail || "study");
    window.addEventListener("doaor:reading-mode", changeMode);
    return () => window.removeEventListener("doaor:reading-mode", changeMode);
  }, []);

  useEffect(() => {
    const parts = location.pathname.split("/").filter(Boolean);
    const entry = ALL_ENTRIES.find((item) => item.id === parts[1]);
    if (!entry) {
      setView("directory");
      setSelectedEntry(INTRO_ENTRY);
      setReader(null);
      return;
    }
    setView("reader");
    setSelectedEntry(entry);
    setReader(entry.id === INTRO_ENTRY.id ? READERS.find((choice) => choice.id === parts[2]) || null : null);
    setControlsHidden(false);
  }, [location.pathname]);

  useEffect(() => {
    const updateControlsHidden = (hidden) => {
      controlsHiddenRef.current = hidden;
      setControlsHidden(hidden);
    };
    const handleScroll = () => {
      const scrollPosition = lightPageRef.current?.scrollTop || 0;
      if (scrollPosition > 2) {
        setOpen(false);
        setPickerHovered(false);
      }
      if (view === "directory") {
        updateControlsHidden(scrollPosition > 110);
        return;
      }
      if (!writeupReady || scrollPosition <= 2) {
        updateControlsHidden(false);
        return;
      }
      if (isIntroduction && readingInnerRef.current && readerStageRef.current) {
        const controlsBottom = readerStageRef.current.getBoundingClientRect().bottom;
        const articleTop = readingInnerRef.current.getBoundingClientRect().top;
        updateControlsHidden(articleTop <= controlsBottom + 36);
        return;
      }
      if (readingInnerRef.current) {
        const controlsBottom = readerStageRef.current?.getBoundingClientRect().bottom || 92;
        const articleTop = readingInnerRef.current.getBoundingClientRect().top;
        updateControlsHidden(articleTop <= controlsBottom + 16);
      }
    };
    handleScroll();
    const scrollTarget = lightPageRef.current;
    scrollTarget?.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollTarget?.removeEventListener("scroll", handleScroll);
  }, [isIntroduction, reader, view, writeupReady]);

  useEffect(() => {
    if (view !== "reader" || (isIntroduction && !reader)) return;
    let active = true;
    setContent("");
    loadMarkdown(language.id, selectedEntry, reader?.id || READERS[0].id)
      .then((markdown) => active && setContent(markdown))
      .catch(() => active && setContent("# This page is being restored\n\nPlease return to the directory and try again."));
    return () => { active = false; };
  }, [language.id, reader, selectedEntry, view, isIntroduction]);

  useEffect(() => {
    let active = true;
    setSearchLoading(true);
    const documents = ALL_ENTRIES.flatMap((entry) => entry.id === INTRO_ENTRY.id
      ? READERS.map((choice) => ({ entry, choice }))
      : [{ entry, choice: READERS[0] }]);
    Promise.all(documents.map(({ entry, choice }) =>
      loadMarkdown(language.id, entry, choice.id)
        .then((markdown) => ({ entry, choice, markdown }))
    )).then((documents) => {
      if (active) setSearchDocuments(documents);
    }).finally(() => {
      if (active) setSearchLoading(false);
    });
    return () => { active = false; };
  }, [language.id]);

  const chooseReader = (choice) => {
    controlsHiddenRef.current = false;
    setControlsHidden(false);
    setOpen(false);
    setPickerHovered(false);
    setHoveredReader(null);
    transitionView("reader", () => {
      setReader(choice);
      navigate(`/light/${INTRO_ENTRY.id}/${choice.id}`, { state: { skipIntro: true }, replace: true });
    });
  };

  const transitionView = (nextView, callback) => {
    window.clearTimeout(transitionTimerRef.current);
    setOpen(false);
    setPickerHovered(false);
    setViewTransitioning(true);
    transitionTimerRef.current = window.setTimeout(() => {
      setView(nextView);
      callback?.();
      lightPageRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => setViewTransitioning(false)));
    }, 460);
  };

  const openReader = (entry = INTRO_ENTRY, selectedReader = null, highlight = null) => transitionView("reader", () => {
    setSelectedEntry(entry);
    setReader(entry.id === INTRO_ENTRY.id ? selectedReader : null);
    setContent("");
    setControlsHidden(false);
    navigate(`/light/${entry.id}${selectedReader ? `/${selectedReader.id}` : ""}`, { state: { skipIntro: true, highlight } });
  });

  const returnToDirectory = () => {
    if (view === "directory") return;
    transitionView("directory", () => {
      setReader(null);
      setContent("");
      setControlsHidden(false);
      navigate("/light", { state: { skipIntro: true } });
    });
  };

  const goHome = () => {
    window.clearTimeout(transitionTimerRef.current);
    setViewTransitioning(true);
    transitionTimerRef.current = window.setTimeout(() => navigate("/", { state: { skipIntro: true } }), 460);
  };

  const navigateFromStructure = (path) => {
    if (path === "/") {
      goHome();
      return;
    }
    if (!path.startsWith("/light")) {
      window.clearTimeout(transitionTimerRef.current);
      setViewTransitioning(true);
      transitionTimerRef.current = window.setTimeout(() => navigate(path, { state: { skipIntro: true } }), 460);
      return;
    }
    if (path === "/light") {
      if (view === "directory") return;
      returnToDirectory();
      return;
    }
    const parts = path.split("/").filter(Boolean);
    const entry = ALL_ENTRIES.find((item) => item.id === parts[1]);
    const selectedReader = READERS.find((choice) => choice.id === parts[2]);
    if (!entry || (entry.id === selectedEntry.id && selectedReader?.id === reader?.id)) return;
    transitionView("reader", () => {
      setContent("");
      setControlsHidden(false);
      navigate(path, { state: { skipIntro: true } });
    });
  };

  const activeGrammarReader = hoveredReader || reader;
  const article = ["atheist", "agnostic"].includes(activeGrammarReader?.id) ? "an" : "a";
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

    const historyTerms = "commit history github repository development history library journal updates changes";
    const matchingCommit = SITE_COMMITS.find((commit) => commit.message.toLocaleLowerCase().includes(normalizedQuery));
    if (historyTerms.includes(normalizedQuery) || matchingCommit) {
      results.push({
        id: "page-commit-history",
        heading: "Commit history",
        excerpt: matchingCommit?.message || "A dated record of the site's published changes, with links to every commit on GitHub.",
        available: true,
        kind: "history",
      });
    }

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
          lineText: line,
        });
        documentHits += 1;
      });
    });

    return results.slice(0, 9);
  }, [language.id, normalizedQuery, searchDocuments, ui.overview]);

  const openSearchResult = (result) => {
    if (!result.available) return;
    const arrivalQuery = query.trim();
    setQuery("");
    setSearchFocused(false);

    if (result.kind === "history") {
      window.clearTimeout(transitionTimerRef.current);
      setViewTransitioning(true);
      transitionTimerRef.current = window.setTimeout(() => navigate("/history", { state: { skipIntro: true } }), 460);
      return;
    }

    if (result.kind === "writeup") {
      const selectedReader = READERS.find((choice) => choice.id === result.readerId);
      const resultEntry = ALL_ENTRIES.find((entry) => entry.id === result.entryId) || INTRO_ENTRY;
      if (!selectedReader) return;
      transitionView("reader", () => {
        setSelectedEntry(resultEntry);
        setReader(resultEntry.id === INTRO_ENTRY.id ? selectedReader : null);
        setControlsHidden(false);
        navigate(`/light/${resultEntry.id}${resultEntry.id === INTRO_ENTRY.id ? `/${selectedReader.id}` : ""}`, { state: { skipIntro: true, highlight: arrivalQuery, highlightContext: result.lineText || "" } });
      });
      return;
    }

    const resultEntry = ALL_ENTRIES.find((entry) => entry.id === result.entryId) || INTRO_ENTRY;
    openReader(resultEntry, null, arrivalQuery);
  };

  useEffect(() => {
    const highlight = location.state?.highlight?.trim();
    if (!content || !highlight || !readingInnerRef.current) return;
    const timer = window.setTimeout(() => {
      const root = readingInnerRef.current;
      if (!root) return;
      const context = location.state?.highlightContext?.trim().toLocaleLowerCase();
      const blocks = [...root.querySelectorAll("h1,h2,h3,p,li")];
      const target = (context && blocks.find((block) => block.textContent.toLocaleLowerCase().includes(context)))
        || blocks.find((block) => block.textContent.toLocaleLowerCase().includes(highlight.toLocaleLowerCase()));
      if (!target) return;
      const walker = document.createTreeWalker(target, window.NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node) {
        const index = node.nodeValue.toLocaleLowerCase().indexOf(highlight.toLocaleLowerCase());
        if (index >= 0) {
          const range = document.createRange();
          range.setStart(node, index);
          range.setEnd(node, index + highlight.length);
          const mark = document.createElement("mark");
          mark.className = "light-arrival-highlight";
          range.surroundContents(mark);
          mark.scrollIntoView({ behavior: "smooth", block: "center" });
          break;
        }
        node = walker.nextNode();
      }
    }, 180);
    return () => window.clearTimeout(timer);
  }, [content, location.state]);

  return (
    <main ref={lightPageRef} data-lenis-prevent className={`light-page reading-mode-${readingMode} ${view === "directory" ? "is-directory" : "is-reader"} ${viewTransitioning ? "is-view-transitioning" : ""} ${pickerHovered || searchFocused ? "is-considering" : ""} ${searchFocused ? "is-searching" : ""} ${reader ? "has-reader" : ""} ${view === "reader" && !isIntroduction ? "is-standard-writeup" : ""} ${controlsHidden ? "controls-hidden" : ""}`}>
      {!showContent && <IntroAnimation onFinish={() => setShowContent(true)} />}

      <div className={`light-shell ${showContent ? "is-visible" : ""}`}>
        <SiteChrome
          sections={DIRECTORY}
          currentEntryId={view === "reader" ? selectedEntry.id : null}
          currentReaderId={reader?.id || null}
          currentView={view}
          buttonLabel={view === "reader" ? ui.directory : ui.home}
          buttonTarget={view === "reader" ? "/light" : "/"}
          onNavigate={navigateFromStructure}
          showStructure={false}
        />
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
            <div className="light-search-results" id="light-search-results" role="listbox" data-lenis-prevent>
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
              {ui.progressNote && <aside className="light-directory-progress">
                <span>{ui.progressNote}</span>
                <button type="button" onClick={() => navigateFromStructure("/about")}>{ui.contribute || "Contact"}<i aria-hidden="true">↗</i></button>
              </aside>}
            </header>

            <div className="light-directory-accordion" key={language.id}>
              {visibleSections.map((section, sectionIndex) => {
                const isExpanded = hoveredSection === section.id;
                return (
                  <div
                    className={`light-directory-accordion-item ${isExpanded ? "is-expanded" : ""}`}
                    key={section.id}
                    style={{ "--section-index": sectionIndex }}
                  >
                    <header className="light-directory-accordion-header" role="button" tabIndex="0" aria-expanded={isExpanded} onClick={() => setHoveredSection((current) => current === section.id ? null : section.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setHoveredSection((current) => current === section.id ? null : section.id); } }}>
                      <span className="light-directory-accordion-eyebrow">{localize(section, "eyebrow")}</span>
                      <div className="light-directory-accordion-title-row">
                        <span className="light-directory-accordion-order">{String(section.order).padStart(2, "0")}</span>
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

            <button className="light-directory-history-link" type="button" onClick={() => navigateFromStructure("/history")}>
              <strong>View commit history</strong>
              <i aria-hidden="true">↗</i>
            </button>

            {!visibleSections.length && (
              <div className="light-directory-empty">
                <span>·</span>
                <p>{ui.empty}</p>
              </div>
            )}
          </section>
        )}

        {view === "reader" && isIntroduction && createPortal(<section className={`light-reader-stage ${reader ? "is-docked" : ""} ${viewTransitioning ? "is-view-transitioning" : ""} ${controlsHidden ? "is-scroll-hidden" : ""} ${searchFocused ? "is-search-dimmed" : ""}`} aria-label="Choose a reading perspective" ref={readerStageRef}>
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
        </section>, document.body)}

        {view === "reader" && <section className={`light-reading ${writeupReady ? "is-visible" : ""}`} aria-live="polite" aria-busy={writeupReady && !content}>
          {writeupReady && (
            <div className={`light-reading-inner ${language.id === "ar" ? "is-arabic" : ""}`} dir={language.id === "ar" ? "rtl" : "ltr"} key={`${selectedEntry.id}-${reader?.id || "standard"}-${language.id}`} ref={readingInnerRef}>
              {content ? <ReactMarkdown components={MARKDOWN_COMPONENTS}>{content}</ReactMarkdown> : <div className="light-content-loading" aria-label="Loading" />}
              {content && <ReaderExperience entry={selectedEntry} sections={DIRECTORY} onNavigate={navigateFromStructure} content={content} />}
            </div>
          )}
        </section>}

      </div>
    </main>
  );
}
