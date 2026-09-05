import React, { memo, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import "../App.css";
import IntroAnimation from "../components/intro";
import SiteNav from "../components/SiteNav";

const translationIds = {
  English: "131",
  Chinese: "56",
  Japanese: "35",
  Urdu: "234",
  Tamil: "229",
  Korean: "36",
  Malay: "39",
  Hindi: "122",
  Sinhala: "228",
  Malayalam: "37",
  Russian: "45",
  French: "31",
  German: "27",
  Bosnian: "25",
  Cantonese: "56",
  "Bengali (Bangla)": "213",
  Hebrew: "233",
  "Kabyle (Amazigh)": "236",
};

const QuranEmbed = memo(function QuranEmbed({
  src,
  width,
  allow,
  frameborder,
  style,
  language,
}) {
  const embedUrl = new URL(src, window.location.origin);
  embedUrl.searchParams.set("translations", translationIds[language]);
  const verse = embedUrl.searchParams.get("verses") || "Quran";

  return (
    <iframe
      src={embedUrl.toString()}
      title={`${verse} in ${language}`}
      width={width || "100%"}
      data-quran-embed="true"
      allow={allow || "clipboard-write"}
      frameBorder={frameborder || "0"}
      style={style}
    />
  );
});

const NotesDocument = memo(function NotesDocument({ markdown, error, language }) {
  return (
    <main
      style={{
        maxWidth: "720px",
        margin: "0 auto",
      }}
      className="markdown-content"
    >
      {error ? (
        <p>Unable to load the notes right now.</p>
      ) : markdown ? (
        <ReactMarkdown
          rehypePlugins={[rehypeRaw]}
          components={{
            iframe: (props) => <QuranEmbed {...props} language={language} />,
          }}
        >
          {markdown}
        </ReactMarkdown>
      ) : (
        <p>Loading notes...</p>
      )}

      <p>
        <Link to="/" className="temp-link">
          Back to Main
        </Link>
      </p>
    </main>
  );
});

function Notes() {
  const [showContent, setShowContent] = useState(false);
  const [markdown, setMarkdown] = useState("");
  const [error, setError] = useState(false);
  const [language, setLanguage] = useState("English");
  const [pendingLanguage, setPendingLanguage] = useState("English");
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const languagePickerRef = useRef(null);

  const languageGroups = [
    { name: "Default", languages: ["English"] },
    {
      name: "East Asia",
      languages: ["Chinese", "Cantonese", "Japanese", "Korean"],
    },
    {
      name: "South Asia",
      languages: ["Urdu", "Hindi", "Tamil", "Sinhala", "Bengali (Bangla)"],
    },
    { name: "Southeast Asia", languages: ["Malay", "Malayalam"] },
    { name: "Europe", languages: ["Russian", "French", "German", "Bosnian"] },
    { name: "Other", languages: ["Hebrew", "Kabyle (Amazigh)"] },
  ];

  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/notes.md`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load notes.md");
        }
        return response.text();
      })
      .then(setMarkdown)
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    if (!markdown) {
      return undefined;
    }

    const script = document.createElement("script");
    script.src = "https://quran.com/widget/embed-widget.v1.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [markdown]);

  useEffect(() => {
    const closeLanguageMenu = (event) => {
      if (
        languagePickerRef.current &&
        !languagePickerRef.current.contains(event.target)
      ) {
        setIsLanguageMenuOpen(false);
        setPendingLanguage(language);
      }
    };

    document.addEventListener("mousedown", closeLanguageMenu);
    return () => document.removeEventListener("mousedown", closeLanguageMenu);
  }, [language]);

  return (
    <div
      className="App"
      style={{
        position: "relative",
        overflowX: "hidden",
        overflowY: "auto",
        height: "auto",
        backgroundColor: "black",
        minHeight: "100vh",
      }}
    >
      {!showContent && <IntroAnimation onFinish={() => setShowContent(true)} />}

      <div
        className={`notes-content ${showContent ? "fade-in" : "hidden"}`}
        style={{
          position: "relative",
          width: "100%",
          minHeight: "100vh",
          padding: "8rem 1.5rem 4rem",
          boxSizing: "border-box",
        }}
      >
        <div className="language-picker" ref={languagePickerRef}>
          <span className="language-picker-label">Translation language</span>
          <button
            type="button"
            className={`language-picker-trigger ${
              isLanguageMenuOpen ? "is-open" : ""
            }`}
            aria-expanded={isLanguageMenuOpen}
            aria-haspopup="listbox"
            onClick={() => setIsLanguageMenuOpen((isOpen) => !isOpen)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setIsLanguageMenuOpen(false);
              }
            }}
          >
            <span>{language}</span>
            <span className="language-picker-arrow" aria-hidden="true" />
          </button>

          <div
            className={`language-menu ${isLanguageMenuOpen ? "is-open" : ""}`}
            role="listbox"
            aria-label="Translation languages"
            onWheel={(event) => event.stopPropagation()}
            onTouchMove={(event) => event.stopPropagation()}
          >
            {languageGroups.map((group) => (
              <div className="language-group" key={group.name}>
                <div className="language-group-title">{group.name}</div>
                {group.languages.map((option) => (
                  <button
                    type="button"
                    role="option"
                    aria-selected={pendingLanguage === option}
                    className={`language-option ${
                      pendingLanguage === option ? "is-selected" : ""
                    }`}
                    key={option}
                    onClick={() => {
                      setPendingLanguage(option);
                      setLanguage(option);
                      setIsLanguageMenuOpen(false);
                    }}
                  >
                    <span>{option}</span>
                    {pendingLanguage === option && (
                      <span className="language-option-check" aria-hidden="true">
                        &#10003;
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        <NotesDocument markdown={markdown} error={error} language={language} />
      </div>

      <SiteNav site="main" currentKey="notes" />
    </div>
  );
}

export default Notes;