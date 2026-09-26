// test deploy
import { BrowserRouter as Router, Navigate, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import Main from "./pages/main";
import Gateway from "./pages/gateway";
import Resume from "./pages/resume";
import Notes from "./pages/notes";
import Light from "./pages/light";
import About from "./pages/about";
import History from "./pages/history";
import Works from "./pages/works";
import IntroAnimation from "./components/intro";

const TRLPage = lazy(() => import("./pages/trl"));
const SoftwarePage = lazy(() => import("./pages/software"));

function SitePageTransition() {
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  const [active, setActive] = useState(false);
  const transitioning = useRef(false);
  const navigationTimer = useRef(null);
  const revealTimer = useRef(null);

  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  useEffect(() => {
    const handleInternalLink = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target.closest?.("a[href]");
      if (!anchor || anchor.hasAttribute("download") || (anchor.target && anchor.target !== "_self")) return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (destination.pathname === "/old" || destination.pathname.startsWith("/old/")) return;

      const current = new URL(window.location.href);
      const sameDocument = destination.pathname === current.pathname && destination.search === current.search;
      if (sameDocument) return;

      event.preventDefault();
      event.stopPropagation();
      if (transitioning.current) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        navigateRef.current(`${destination.pathname}${destination.search}${destination.hash}`, { state: { skipIntro: true } });
        return;
      }

      transitioning.current = true;
      setActive(true);
      navigationTimer.current = window.setTimeout(() => {
        navigateRef.current(`${destination.pathname}${destination.search}${destination.hash}`, { state: { skipIntro: true } });
        revealTimer.current = window.setTimeout(() => {
          setActive(false);
          transitioning.current = false;
        }, 70);
      }, 560);
    };

    document.addEventListener("click", handleInternalLink, true);
    return () => {
      document.removeEventListener("click", handleInternalLink, true);
      window.clearTimeout(navigationTimer.current);
      window.clearTimeout(revealTimer.current);
    };
  }, []);

  return <div className={`site-page-transition ${active ? "is-active" : ""}`} aria-hidden="true" />;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <div className="route-stage" key={location.pathname}>
      <Routes location={location}>
        <Route path="/" element={<Gateway />} />
        <Route path="/main" element={<Main />} />
        <Route path="/resume" element={<Resume />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/light/*" element={<Light />} />
        <Route path="/about" element={<About />} />
        <Route path="/history" element={<History />} />
        <Route path="/software" element={<Suspense fallback={<div style={{ minHeight: "100vh", background: "#080a0b", color: "#a7afa9", padding: "10vw" }}>Loading software…</div>}><SoftwarePage /></Suspense>} />
        <Route path="/works/*" element={<Works />} />
        <Route path="/d/*" element={<Navigate to="/works/" replace />} />
        <Route path="/trl" element={<Suspense fallback={<div style={{ background: "#000", color: "#8a9099", display: "grid", fontFamily: "Montserrat, sans-serif", minHeight: "100vh", placeItems: "center" }}>Loading TRL…</div>}><TRLPage /></Suspense>} />
        <Route path="*" element={<Gateway />} />
      </Routes>
    </div>
  );
}

function FirstVisitIntro() {
  const location = useLocation();
  const [playing, setPlaying] = useState(() => {
    if (location.pathname === "/") return false;
    if (location.pathname === "/old" || location.pathname.startsWith("/old/")) return false;
    if (window.sessionStorage.getItem("doaor-intro-seen") === "true") return false;
    window.sessionStorage.setItem("doaor-intro-seen", "true");
    return true;
  });

  const isRoot = location.pathname === "/";
  return playing ? <IntroAnimation force presentation={isRoot ? "root" : "doaor"} holdDuration={isRoot ? 4200 : 3500} letterStagger={isRoot ? 0.18 : 0.3} tagline={isRoot ? "return home, my friend." : ""} onFinish={() => setPlaying(false)} /> : null;
}

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
      prevent: (node) =>
        document.body.classList.contains("trl-page-active") ||
        Boolean(node.closest?.("[data-lenis-prevent]")),
    });

    let frameId;

    function raf(time) {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }

    frameId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, []);

  return (
    <Router>
      <SitePageTransition />
      <FirstVisitIntro />
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
