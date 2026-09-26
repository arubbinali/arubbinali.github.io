import React from "react";
import PrimaryBackground from "../components/PrimaryBackground";
import StaggeredMenu from "../@/components/StaggeredMenu";
import VisitCounter from "../components/VisitCounter";
import "./gateway.css";

const MENU_ITEMS = [
  { label: "Light", ariaLabel: "Open Light", link: "/main" },
  { label: "My Works", ariaLabel: "View my work", link: "/works/" },
  { label: "Software", ariaLabel: "Open software", link: "/software" },
  { label: "About", ariaLabel: "Learn about me", link: "/about" },
];

const SOCIAL_ITEMS = [
  { label: "GitHub", link: "https://github.com/arubbinali" },
  { label: "LinkedIn", link: "https://www.linkedin.com/in/arubbinali" },
  { label: "Discord", link: "https://discord.gg/MhAPygZpQQ" },
];

export default function Gateway() {
  return <main className="gateway-page">
    <PrimaryBackground />
    <StaggeredMenu
      position="right"
      items={MENU_ITEMS}
      socialItems={SOCIAL_ITEMS}
      displaySocials
      displayItemNumbering
      menuButtonColor="#fff"
      openMenuButtonColor="#fff"
      changeMenuColorOnOpen
      colors={["transparent", "transparent"]}
      logoUrl="/logo.png"
      accentColor="#00ffee"
      isFixed
      className="gateway-menu"
    />
    <div className="gateway-content is-visible">
      <header className="gateway-header gateway-header-spacer" aria-hidden="true" />
      <section className="gateway-intro" aria-hidden="true" />
      <VisitCounter />
    </div>
  </main>;
}
