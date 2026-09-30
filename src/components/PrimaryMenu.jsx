import React from "react";
import StaggeredMenu from "../@/components/StaggeredMenu";
import "./primaryMenu.css";

export const PRIMARY_MENU_ITEMS = [
  { label: "Light", ariaLabel: "Open Light", link: "/main" },
  { label: "My Works", ariaLabel: "View my work", link: "/works/" },
  { label: "Software", ariaLabel: "Open software", link: "/software" },
  { label: "Stats", ariaLabel: "View site statistics", link: "/stats" },
  { label: "About", ariaLabel: "Learn about me", link: "/about" },
];

const SOCIAL_ITEMS = [
  { label: "GitHub", link: "https://github.com/arubbinali" },
  { label: "Discord", link: "https://discord.gg/MhAPygZpQQ" },
];

export default function PrimaryMenu({ current = "" }) {
  return <StaggeredMenu
    position="right"
    items={PRIMARY_MENU_ITEMS.map((item) => item.label.toLowerCase() === current.toLowerCase() ? { ...item, ariaLabel: `${item.ariaLabel} (current page)` } : item)}
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
    className="gateway-menu primary-menu"
  />;
}
