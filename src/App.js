// test deploy
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import Lenis from "lenis";
import Main from "./pages/main";
import Resume from "./pages/resume";
import Notes from "./pages/notes";
import Light from "./pages/light";
import About from "./pages/about";

const TRLPage = lazy(() => import("./pages/trl"));

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <div className="route-stage" key={location.pathname}>
      <Routes location={location}>
        <Route path="/" element={<Main />} />
        <Route path="/main" element={<Main />} />
        <Route path="/resume" element={<Resume />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/light/*" element={<Light />} />
        <Route path="/about" element={<About />} />
        <Route path="/trl" element={<Suspense fallback={<div style={{ background: "#000", color: "#8a9099", display: "grid", fontFamily: "Montserrat, sans-serif", minHeight: "100vh", placeItems: "center" }}>Loading TRL…</div>}><TRLPage /></Suspense>} />
        <Route path="*" element={<Main />} />
      </Routes>
    </div>
  );
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
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
