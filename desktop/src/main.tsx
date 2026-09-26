import "@fontsource/montserrat-alternates/latin-700.css";
import "@fontsource/montserrat/latin-400.css";
import "@fontsource/montserrat/latin-500.css";
import "@fontsource/montserrat/latin-600.css";
import "@fontsource/montserrat/latin-700.css";
import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./theme.css";

class FatalBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("doaorel failed to render", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="fatal-startup" role="alert">
        <strong>doaorel could not finish starting.</strong>
        <span>{this.state.error.message}</span>
        <button onClick={() => window.location.reload()}>Try again</button>
      </main>
    );
  }
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <FatalBoundary>
      <App />
    </FatalBoundary>
  </React.StrictMode>,
);
