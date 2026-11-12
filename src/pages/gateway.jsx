import React, { useCallback, useEffect, useRef, useState } from "react";
import PrimaryBackground from "../components/PrimaryBackground";
import VisitCounter from "../components/VisitCounter";
import GatewayFeatureExplorer from "../components/GatewayFeatureExplorer";
import "./gateway.css";

export default function Gateway() {
  useEffect(() => { document.title = "doaor"; }, []);
  const pageRef = useRef(null);
  const [pillarPreset, setPillarPreset] = useState("twister");
  const updatePillarAccent = useCallback((color) => {
    pageRef.current?.style.setProperty("--gateway-pillar-accent", color);
  }, []);

  return <main ref={pageRef} className="gateway-page">
    <PrimaryBackground onAccentChange={updatePillarAccent} preset={pillarPreset} />
    <div className="gateway-explorer-access"><GatewayFeatureExplorer onSelectionChange={setPillarPreset} /></div>
    <div className="gateway-content is-visible">
      <header className="gateway-header gateway-header-spacer" aria-hidden="true" />
      <section className="gateway-intro" aria-hidden="true" />
      <VisitCounter />
    </div>
  </main>;
}
