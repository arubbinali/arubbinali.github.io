import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import OptionWheel from "../@/components/OptionWheel";
import TiltedCard, { TiltedCardLayer } from "../@/components/TiltedCard";
import "./gatewayFeatureExplorer.css";

const OPTIONS = [
  { label: "Light", preset: "twister", route: "/main", glow: ["#10B981", "#D9F99D", "#6EE7B7"], phrase: "Notes, reflection, and reminders worth returning to.", back: "Light is the writing side of doaorel: a quieter place for da'wah, useful notes, and thoughts that deserve more than a passing scroll.", frontImage: "/gateway-media/cards/light-front.jpg", backImage: "/gateway-media/cards/light-back.jpg" },
  { label: "My Works", preset: "ember", route: "/works/", glow: ["#FF4D1A", "#FFD166", "#FF8A3D"], phrase: "Selected projects, experiments, and visual work.", back: "My Works collects the things I have designed and built, from finished projects to smaller experiments that shaped the next idea.", frontImage: "/gateway-media/cards/works-front.jpg", backImage: "/gateway-media/cards/works-back.jpg" },
  { label: "Software", preset: "aurora", route: "/software", glow: ["#7C3AED", "#FF9FFC", "#C084FC"], phrase: "A desktop workspace designed around returning.", back: "Doaorel Software keeps projects, context, and useful actions close so leaving your desk does not mean starting from zero when you come back.", frontImage: "/gateway-media/cards/software-front.jpg", backImage: "/gateway-media/cards/software-back.jpg" },
  { label: "Stats", preset: "beam", route: "/stats", glow: ["#3B5BFF", "#E0E7FF", "#818CF8"], phrase: "A live record of visits and page activity.", back: "Stats shows how doaor.com is being explored, including page views, browser visits, and how that activity changes over time.", frontImage: "/gateway-media/cards/stats-front.jpg", backImage: "/gateway-media/cards/stats-back.jpg" },
  { label: "About", preset: "ice", route: "/about", glow: ["#22D3EE", "#E0F2FE", "#67E8F9"], phrase: "A little context behind this space and its maker.", back: "About explains why doaorel exists, what I am currently working toward, and how the different parts of this site fit together.", frontImage: "/gateway-media/cards/about-front.jpg", backImage: "/gateway-media/cards/about-back.jpg" },
];
const OPTION_LABELS = OPTIONS.map((option) => option.label);

export default function GatewayFeatureExplorer({ onSelectionChange }) {
  const reduced = useReducedMotion();
  const [wheelSelection, setWheelSelection] = useState(0);
  const [selected, setSelected] = useState(0);
  const [selectionPulse, setSelectionPulse] = useState(0);
  const scenario = OPTIONS[selected];

  useEffect(() => {
    const settle = window.setTimeout(() => {
      setSelected(wheelSelection);
      onSelectionChange?.(OPTIONS[wheelSelection].preset);
      setSelectionPulse((value) => value + 1);
    }, 320);
    return () => window.clearTimeout(settle);
  }, [wheelSelection, onSelectionChange]);

  return <section className="gateway-feature-explorer" aria-label="Explore doaorel">
    <div className="gateway-option-wheel">
      <OptionWheel items={OPTION_LABELS} defaultSelected={0}
        textColor="rgba(255,255,255,.42)" activeColor="var(--gateway-pillar-accent, #8f63ff)"
        side="left" fontSize={3} spacing={1.3} curve={0} tilt={6} blur={2} fade={0.25}
        smoothing={reduced ? 1 : 150} inset={80} loop draggable soundUrl="" soundVolume={0.5}
        onChange={(index) => {
          setWheelSelection(index);
        }} />
    </div>

    <div className="gateway-bento-stage gateway-tilted-stage">
      <AnimatePresence mode="sync" initial={false}>
        <motion.div className="gateway-bento-transition" key={selected}
          initial={{ opacity: 0, x: reduced ? 0 : 24, filter: reduced ? "none" : "blur(8px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, x: reduced ? 0 : -18, filter: reduced ? "none" : "blur(6px)" }}
          transition={{ duration: reduced ? 0.12 : 0.52, ease: [0.16, 1, 0.3, 1] }}>
          <div className="gateway-card-glow gateway-card-matched-crop" key={selectionPulse} style={{ "--card-glow-a": scenario.glow[0], "--card-glow-b": scenario.glow[1], "--card-glow-c": scenario.glow[2] }}>
          <TiltedCard
            imageSrc={scenario.frontImage}
            altText={`${scenario.label} preview`}
            captionText="Click to explore"
            containerHeight="var(--gateway-card-size,320px)"
            containerWidth="var(--gateway-card-size,320px)"
            imageHeight="var(--gateway-card-size,320px)"
            imageWidth="var(--gateway-card-size,320px)"
            rotateAmplitude={12}
            scaleOnHover={1.05}
            glare={0}
            shadow={0}
            reverse
            backContent={<div className="gateway-card-back"><img src={scenario.backImage} alt="" decoding="async" loading="lazy" /><div><h3>{scenario.label}</h3><p>{scenario.back}</p></div><a className="gateway-card-back-link" href={scenario.route} onClick={(event) => event.stopPropagation()}>Explore <span aria-hidden="true">↗</span></a></div>}
          >
            <TiltedCardLayer depth={30}>
              <div style={{ position: "absolute", left: 20, right: 20, bottom: 16, color: "#fff" }}>
                <h3 style={{ margin: "0 0 5px" }}>{scenario.label}</h3>
                <p style={{ margin: 0, fontSize: 12, lineHeight: 1.35 }}>{scenario.phrase}</p>
              </div>
            </TiltedCardLayer>
          </TiltedCard>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  </section>;
}
