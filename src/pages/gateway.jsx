import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import IntroAnimation from "../components/intro";
import ShinyText from "../components/ShinyText";
import "./gateway.css";

const DESTINATIONS = [
  { eyebrow: "Daʿwah", title: "Light", path: "/main", video: "/media/gateway-light.mp4" },
  { eyebrow: "Digital portfolio", title: "My Works", path: "/works/", video: "/media/gateway-works.mp4" },
  { eyebrow: "Desktop workspace", title: "Software", path: "/software", video: "/media/gateway-reel.mp4" },
];

export default function Gateway() {
  const location = useLocation();
  const [showContent, setShowContent] = useState(() => Boolean(location.state?.skipIntro));
  const [videoReady, setVideoReady] = useState(false);

  return <main className="gateway-page">
    {!showContent && <IntroAnimation presentation="doaor" onFinish={() => setShowContent(true)} />}
    <video className={`gateway-video ${videoReady ? "is-ready" : ""}`} autoPlay muted loop playsInline preload="auto" aria-hidden="true" onCanPlay={() => setVideoReady(true)}>
      <source src="/media/gateway-reel-mobile.mp4?v=4" type="video/mp4" media="(max-width: 720px)" />
      <source src="/media/gateway-reel.mp4?v=4" type="video/mp4" />
    </video>
    <div className="gateway-shade" aria-hidden="true" />
    <div className="gateway-grain" aria-hidden="true" />
    <div className={`gateway-content ${showContent ? "is-visible" : ""}`}>
      <header className="gateway-header gateway-header-spacer" aria-hidden="true" />
      <section className="gateway-intro" aria-labelledby="gateway-title">
        <h1 id="gateway-title" className="gateway-name-arabic" aria-label="doaorel">
          <ShinyText text="doaorel" speed={4} />
        </h1>
      </section>
      <nav className="gateway-destinations" aria-label="Main sections">
        {DESTINATIONS.map((destination) => <Link className="gateway-destination" key={destination.path} to={destination.path} state={{ skipIntro: true }}>
          <video className="gateway-destination-video" autoPlay muted loop playsInline preload="metadata" aria-hidden="true">
            <source src={destination.video} type="video/mp4" />
          </video>
          <span className="gateway-destination-copy"><strong>{destination.title}</strong><small>{destination.eyebrow}</small></span>
          <span className="gateway-destination-arrow" aria-hidden="true">→</span>
        </Link>)}
      </nav>
    </div>
  </main>;
}
