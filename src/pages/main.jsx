import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import "../App.css";
import IntroAnimation from "../components/intro";
import ShinyText from "../components/ShinyText";
import { SiteChrome } from "../components/SiteChrome";
import { DIRECTORY } from "./light";

function Main() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(() => Boolean(location.state?.skipIntro));
  const [leaving, setLeaving] = useState(false);
  const navigationTimerRef = useRef(null);

  useEffect(() => () => window.clearTimeout(navigationTimerRef.current), []);

  const enterRoute = (path) => {
    if (leaving) return;
    setLeaving(true);
    navigationTimerRef.current = window.setTimeout(() => navigate(path, { state: { skipIntro: true } }), 320);
  };

  return (
    <div
      className="App"
      style={{
        position: "relative",
        overflow: "hidden",
        backgroundColor: "var(--site-bg)",
        minHeight: "100vh",
      }}
    >
      {!showContent && <IntroAnimation onFinish={() => setShowContent(true)} />}

      <div
        className={`main-content ${showContent ? "fade-in" : "hidden"} ${leaving ? "is-leaving" : ""}`}
        style={{
          position: "relative",
          width: "100%",
          minHeight: "100vh",
        }}
      >
        <SiteChrome sections={DIRECTORY} currentView="home" buttonLabel="Structure" onNavigate={enterRoute} />
        <div
          className="center-text main-home-center"
          style={{ zIndex: 2, fontFamily: "Montserrat, sans-serif" }}
        >
          <div className="main-home-verse" aria-label="Quran 41:53">
            <h1 className="main-home-ayah" lang="ar" dir="rtl">
              <ShinyText
                className="main-home-ayah-shine"
                text="سنريهم اياتنا في الآفاق وفي أنفسهم حتى يتبين لهم أنه الحق أولم يكف بربك أنه على كل شيء شهيد"
                speed={4}
              />
            </h1>
            <p className="main-home-translation">
              We will show them Our signs in the horizons and within themselves until it becomes clear to them that it is the truth. Is it not sufficient concerning your Lord that He is, over all things, a Witness?
            </p>
          </div>

          <Link to="/light" state={{ skipIntro: true }} className="main-light-link" onClick={(event) => { event.preventDefault(); enterRoute("/light"); }}>
            <span>Read in the light</span>
            <span aria-hidden="true">↗</span>
          </Link>
        </div>

        <footer className="main-about-footer">
          <Link to="/about" className="main-about-link" onClick={(event) => { event.preventDefault(); enterRoute("/about"); }}>
            <span aria-hidden="true">⌘</span> About
          </Link>
        </footer>
      </div>
    </div>
  );
}

export default Main;
