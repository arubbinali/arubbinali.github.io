import { ArrowRight, Check, LoaderCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { native } from "../api";

const defaults = { intro: true, atmosphere: true, compact: false };
type Preferences = typeof defaults;
let sessionPreferences: Preferences | undefined;
function read(): Preferences {
  if (sessionPreferences) return sessionPreferences;
  try {
    return {
      ...defaults,
      ...JSON.parse(localStorage.getItem("doaor-experience") || "{}"),
    };
  } catch {
    return defaults;
  }
}
export function useExperience() {
  const [preferences, setPreferences] = useState(read);
  useEffect(() => {
    const update = () => setPreferences(read());
    window.addEventListener("doaor-experience", update);
    return () => window.removeEventListener("doaor-experience", update);
  }, []);
  const update = (next: Preferences) => {
    sessionPreferences = next;
    try {
      localStorage.setItem("doaor-experience", JSON.stringify(next));
    } catch {
      /* Session settings still work when storage is unavailable. */
    }
    setPreferences(next);
    window.dispatchEvent(new Event("doaor-experience"));
  };
  return { preferences, update };
}

export function Startup({ reduceMotion = false }: { reduceMotion?: boolean }) {
  const { preferences } = useExperience();
  const [visible, setVisible] = useState(
    () =>
      read().intro && !matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    document.documentElement.dataset.atmosphere = String(
      preferences.atmosphere,
    );
    document.documentElement.dataset.density = preferences.compact
      ? "compact"
      : "comfortable";
  }, [preferences]);
  useEffect(() => {
    if (!native) {
      const timer = setTimeout(() => setVisible(false), 2550);
      return () => clearTimeout(timer);
    }
    let cancelled = false;
    const hide = setTimeout(
      () => {
        if (!cancelled) setVisible(false);
      },
      reduceMotion ? 0 : 2550,
    );
    return () => {
      cancelled = true;
      clearTimeout(hide);
    };
  }, [reduceMotion]);
  if (!visible || reduceMotion) return null;
  return (
    <div
      className="startup"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to doaorel"
    >
      <div className="startup-drag" data-tauri-drag-region />
      <div className="fluid-field" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="startup-title">
        <span className="eyebrow">YOUR COMPUTER, WITH LESS FRICTION</span>
        <span className="doaor-logo metallic-wordmark native-metal-wordmark startup-wordmark">
          doaorel
        </span>
        <p>Ask naturally. Stay in control.</p>
      </div>
    </div>
  );
}

export function Feedback({
  busy,
  error,
  notice,
  dismiss,
  cancel,
  visited,
}: {
  busy: string;
  error: string;
  notice: string;
  dismiss: () => void;
  cancel: () => void;
  visited: number;
}) {
  const [slow, setSlow] = useState("");
  useEffect(() => {
    setSlow("");
    if (!busy) return;
    const timer = setTimeout(() => setSlow(busy), 650);
    return () => clearTimeout(timer);
  }, [busy]);
  const message = error || notice || (busy === slow ? slow : "");
  return (
    <div
      className={`toast ${message ? "visible" : ""} ${error ? "error" : ""}`}
      aria-hidden={!message}
    >
      {error ? (
        <span aria-hidden="true">!</span>
      ) : busy ? (
        <LoaderCircle className="spinner" size={18} />
      ) : (
        <Check size={18} />
      )}
      <span role={error ? "alert" : "status"}>{message}</span>
      {busy === "Scanning projects" && message ? (
        <button onClick={cancel}>Cancel · {visited}</button>
      ) : !busy && message ? (
        <button aria-label="Dismiss message" onClick={dismiss}>
          <X size={15} />
        </button>
      ) : null}
    </div>
  );
}

const steps = [
  {
    title: "A project, not another folder to manage.",
    text: "Add an existing folder. doaorel keeps it exactly where it is and brings its tools and context together.",
    label: "Review example",
    detail: "studio-web",
    sub: "Example project · React + TypeScript",
  },
  {
    title: "Choose how you like to work.",
    text: "Each project remembers its preferred IDE. Your other projects can use a completely different editor.",
    label: "Choose this IDE",
    detail: "Visual Studio Code",
    sub: "Example preference · no application will open",
  },
  {
    title: "See the context before you launch.",
    text: "Review Git information and commands first. Real commands always show a launch confirmation before they run.",
    label: "Preview Resume",
    detail: "main  ·  2 changed files",
    sub: "Example command: npm run dev · never executed in this tour",
  },
  {
    title: "Tomorrow, pick up right here.",
    text: "Resume remembers your IDE, terminal and optional command. Your notes and activity stay on this device.",
    label: "Start with my project",
    detail: "Ready to resume",
    sub: "Example plan · VS Code + terminal + development command",
  },
];
export function Welcome({
  addFolder,
  disabled,
  settings,
}: {
  addFolder: () => void;
  disabled: boolean;
  settings: () => void;
}) {
  const [step, setStep] = useState(0);
  const current = steps[step];
  return (
    <section className="welcome">
      <div className="welcome-copy">
        <p className="eyebrow">WELCOME TO YOUR WORKSPACE</p>
        <h1>
          Less setting up.
          <br />
          <span>More making.</span>
        </h1>
        <p>
          Start with one project. We’ll keep its tools, commands and the context
          for next time together.
        </p>
        <button className="primary" disabled={disabled} onClick={addFolder}>
          Choose my first project <ArrowRight size={16} />
        </button>
        <small>Choose an existing folder. Nothing is moved or executed.</small>
      </div>
      <div className="guided-demo">
        <div className="demo-image-effect" aria-hidden="true" />
        <div className="demo-heading">
          <span className="eyebrow">INTERACTIVE EXAMPLE</span>
          <span>{step + 1} / 4</span>
        </div>
        <div className="demo-steps" aria-label="Example steps">
          {steps.map((s, i) => (
            <span className="demo-step" key={s.title}>
              <button
                aria-label={`Step ${i + 1}: ${s.title}`}
                aria-current={step === i ? "step" : undefined}
                onClick={() => setStep(i)}
              >
                {i + 1}
              </button>
            </span>
          ))}
        </div>
        <div className="demo-transition" key={step}>
          <div className="demo-scene">
            <span className="project-symbol">d.</span>
            <h2>{current.detail}</h2>
            <p>{current.sub}</p>
          </div>
          <div className="demo-description">
            <h2>{current.title}</h2>
            <p>{current.text}</p>
          </div>
        </div>
        <button
          disabled={step === 3 && disabled}
          onClick={() => (step < 3 ? setStep(step + 1) : addFolder())}
        >
          {current.label}
          <ArrowRight size={15} />
        </button>
        <p className="small muted">
          Demo only. No files, commands, or history are created.
        </p>
      </div>
      <div className="welcome-foot">
        <span>Already have a folder full of projects?</span>
        <button className="text-button" onClick={settings}>
          Set up discovery <ArrowRight size={14} />
        </button>
      </div>
    </section>
  );
}

export function ExperienceSettings() {
  const { preferences, update } = useExperience();
  return (
    <div className="experience-settings">
      {(
        [
          [
            "intro",
            "doaorel startup introduction",
            "A short, skippable welcome when you open the app.",
          ],
          [
            "atmosphere",
            "Ambient surfaces",
            "Soft accent lighting behind your workspace.",
          ],
          [
            "compact",
            "Compact project rows",
            "Fit more projects into the same space.",
          ],
        ] as const
      ).map(([key, title, description]) => (
        <label className="setting-row" key={key}>
          <span>
            {title}
            <small className="muted">{description}</small>
          </span>
          <input
            type="checkbox"
            checked={preferences[key]}
            onChange={(e) =>
              update({ ...preferences, [key]: e.target.checked })
            }
          />
        </label>
      ))}
    </div>
  );
}
