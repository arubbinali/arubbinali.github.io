import React from "react";
import { ThinkingOrb } from "thinking-orbs";
import "./primaryHomeLink.css";

export default function PrimaryHomeLink() {
  return <a className="primary-home-link" href="/" aria-label="Return to the home page">
    <span aria-hidden="true"><ThinkingOrb state="composing" size={20} theme="dark" /></span>
    <b>Home</b>
  </a>;
}
