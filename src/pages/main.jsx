import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import "../App.css";
import IntroAnimation from "../components/intro";
import ShinyText from "../components/ShinyText";

function Main() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(() => Boolean(location.state?.skipIntro));
  const [leaving, setLeaving] = useState(false);
  const navigationTimerRef = useRef(null);

  useEffect(() => () => window.clearTimeout(navigationTimerRef.current), []);

  const enterLight = (event) => {
    event.preventDefault();
    if (leaving) return;
    setLeaving(true);
    navigationTimerRef.current = window.setTimeout(() => navigate("/light", { state: { skipIntro: true } }), 320);
  };

  return (
    <div
      className="App"
      style={{
        position: "relative",
        overflow: "hidden",
        backgroundColor: "black",
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

          <Link to="/light" state={{ skipIntro: true }} className="main-light-link" onClick={enterLight}>
            <span>Read in the light</span>
            <span aria-hidden="true">↗</span>
          </Link>
        </div>

        <footer className="main-discord-footer">
          <Link to="/about" className="main-discord-connection" style={{ textDecoration: "none" }}>
            <span className="main-discord-icon" style={{ background: "#31343a", color: "#f1f3f5" }}>
              <svg viewBox="0 0 24 24" aria-hidden="true" style={{ height: 14, width: 14 }}>
                <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </span>
            <span className="main-discord-label">About</span>
            <span className="main-discord-status" aria-hidden="true" />
          </Link>
        </footer>
      </div>
    </div>
  );
}

export default Main;
