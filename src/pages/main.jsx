import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import "../App.css";
import IntroAnimation from "../components/intro";
import ShinyText from "../components/ShinyText";

function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M19.5 5.34A17.3 17.3 0 0 0 15.25 4l-.52 1.05a15.7 15.7 0 0 0-5.45 0L8.75 4A17.3 17.3 0 0 0 4.5 5.34C1.81 9.32 1.08 13.2 1.45 17a17.1 17.1 0 0 0 5.2 2.63l1.27-1.74a10.7 10.7 0 0 1-2-1c.17-.13.33-.26.49-.4 3.86 1.79 8.06 1.79 11.87 0 .16.14.32.27.49.4a10.7 10.7 0 0 1-2 1l1.27 1.74A17.1 17.1 0 0 0 23.24 17c.43-4.4-.73-8.24-3.74-11.66ZM8.43 14.65c-1.16 0-2.11-1.07-2.11-2.38s.93-2.38 2.11-2.38 2.13 1.08 2.11 2.38c0 1.31-.93 2.38-2.11 2.38Zm7.14 0c-1.16 0-2.11-1.07-2.11-2.38s.93-2.38 2.11-2.38 2.13 1.08 2.11 2.38c0 1.31-.93 2.38-2.11 2.38Z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56v-2.23c-3.22.7-3.9-1.37-3.9-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.78 1.2 1.78 1.2 1.04 1.77 2.72 1.26 3.38.97.1-.75.4-1.26.73-1.55-2.57-.29-5.28-1.29-5.28-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.16 1.18a10.9 10.9 0 0 1 5.76 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.59.23 2.77.11 3.06.74.81 1.19 1.84 1.19 3.1 0 4.42-2.71 5.39-5.29 5.68.42.36.79 1.06.79 2.14v3.26c0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .7Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M5.34 7.65H1.7V19.3h3.64V7.65ZM3.52 1.7a2.11 2.11 0 1 0 0 4.22 2.11 2.11 0 0 0 0-4.22ZM19.3 7.38c-1.75 0-2.92.96-3.4 1.88h-.05V7.65h-3.49V19.3H16v-5.76c0-1.52.29-2.99 2.17-2.99 1.85 0 1.87 1.73 1.87 3.09v5.66h3.65v-6.38c0-3.13-.68-5.54-4.39-5.54Z" />
    </svg>
  );
}

function Main() {
  const location = useLocation();
  const [showContent, setShowContent] = useState(() => Boolean(location.state?.skipIntro));
  const [discordCopied, setDiscordCopied] = useState(false);

  const copyDiscord = async () => {
    await navigator.clipboard?.writeText("doaor");
    setDiscordCopied(true);
    window.setTimeout(() => setDiscordCopied(false), 1400);
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
      {/* ✅ Intro animation */}
      {!showContent && <IntroAnimation onFinish={() => setShowContent(true)} />}

      {/* ✅ Main content */}
      <div
        className={`main-content ${showContent ? "fade-in" : "hidden"}`}
        style={{
          position: "relative",
          width: "100%",
          minHeight: "100vh",
        }}
      >

        {/* Centered Text */}
        <div
          className="center-text"
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

          <p>
            You can find my digital portfolio{" "}
            <a
              href="https://doaor.com/d/"
              target="_blank"
              rel="noopener noreferrer"
              className="temp-link"
              style={{ color: "grey" }}
            >
              here
            </a>
          </p>
          <Link to="/light" state={{ skipIntro: true }} className="main-light-link">
            <span>Read in the light</span>
            <span aria-hidden="true">↗</span>
          </Link>

        </div>

        <footer className="main-discord-footer">
          <button className="main-discord-connection" type="button" onClick={copyDiscord} aria-label="Copy Discord username doaor">
            <span className="main-discord-icon"><DiscordIcon /></span>
            <span className="main-discord-label">Discord</span>
            <span className="main-discord-status" aria-hidden="true" />
            <span className="main-discord-card" role="status">
              <strong>{discordCopied ? "Copied" : "doaor"}</strong>
              <small>{discordCopied ? "Username copied" : "Click to copy username"}</small>
            </span>
          </button>
          <a className="main-discord-connection main-github-connection" href="https://github.com/arubbinali" target="_blank" rel="noopener noreferrer" aria-label="Open arubbinali on GitHub">
            <span className="main-discord-icon main-github-icon"><GitHubIcon /></span>
            <span className="main-discord-label">GitHub</span>
            <span className="main-discord-status" aria-hidden="true" />
            <span className="main-discord-card">
              <strong>arubbinali</strong>
              <small>View GitHub profile</small>
            </span>
          </a>
          <a className="main-discord-connection main-linkedin-connection" href="https://www.linkedin.com/in/arubbinali" target="_blank" rel="noopener noreferrer" aria-label="Open arubbinali on LinkedIn">
            <span className="main-discord-icon main-linkedin-icon"><LinkedInIcon /></span>
            <span className="main-discord-label">LinkedIn</span>
            <span className="main-discord-status" aria-hidden="true" />
            <span className="main-discord-card">
              <strong>arubbinali</strong>
              <small>View LinkedIn profile</small>
            </span>
          </a>
        </footer>
      </div>
    </div>
  );
}

export default Main;
