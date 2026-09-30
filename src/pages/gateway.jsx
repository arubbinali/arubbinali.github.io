import React from "react";
import PrimaryBackground from "../components/PrimaryBackground";
import PrimaryMenu from "../components/PrimaryMenu";
import VisitCounter from "../components/VisitCounter";
import "./gateway.css";

export default function Gateway() {
  return <main className="gateway-page">
    <PrimaryBackground />
    <PrimaryMenu />
    <div className="gateway-content is-visible">
      <header className="gateway-header gateway-header-spacer" aria-hidden="true" />
      <section className="gateway-intro" aria-hidden="true" />
      <VisitCounter />
    </div>
  </main>;
}
