import { ArrowUp, Check, ChevronRight, Mic, MicOff } from "lucide-react";
import { MetalFx } from "metal-fx";
import { useEffect, useMemo, useRef, useState } from "react";
import { VoiceBeam } from "voice-glow";
import { useVoiceRecording } from "../useVoiceRecording";
import { api, native } from "../api";
import { planAssistantRequest } from "../assistant";
import { EffectBoundary } from "../components/EffectBoundary";
import type { AssistantCatalog } from "../types";

const emptyCatalog: AssistantCatalog = {
  apps: [],
  profiles: [],
  bookmarks: [],
};
const prompts = [
  "Open Discord for me",
  "Open Gmail on my work account",
  "Look through my bookmarks and open Moodle",
  "Open Notepad, then open Calendar",
];

type RecognitionResult = { 0: { transcript: string }; isFinal: boolean };
type Recognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: { results: ArrayLike<RecognitionResult> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

export function AssistantView({ onActivity }: { onActivity: () => void }) {
  const [catalog, setCatalog] = useState(emptyCatalog);
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [loading, setLoading] = useState(native);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState("");
  const recognition = useRef<Recognition | null>(null);
  const mic = useVoiceRecording();
  const listening = mic.state === "recording";
  const plan = useMemo(
    () => planAssistantRequest(submitted, catalog),
    [submitted, catalog],
  );

  useEffect(() => {
    if (!native) return;
    void api
      .assistantCatalog()
      .then(setCatalog)
      .catch((reason) => setError(String(reason)))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => () => recognition.current?.stop(), []);

  const submit = (value = input) => {
    const clean = value.trim();
    if (!clean) return;
    setInput(clean);
    setSubmitted(clean);
    setResults([]);
    setError("");
  };
  const listen = async () => {
    if (listening) {
      recognition.current?.stop();
      mic.stop();
      return;
    }
    setError("");
    const stream = await mic.start();
    if (!stream) {
      setError(
        !mic.supported
          ? "Microphone capture is unavailable in this Windows runtime."
          : "doaorel couldn’t access the microphone. Check Windows microphone permissions and try again.",
      );
      return;
    }
    const RecognitionCtor =
      (
        window as unknown as {
          SpeechRecognition?: new () => Recognition;
          webkitSpeechRecognition?: new () => Recognition;
        }
      ).SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: new () => Recognition })
        .webkitSpeechRecognition;
    if (!RecognitionCtor) {
      setError(
        "Recording locally. Speech transcription is unavailable in this runtime; stop to review the audio, or type your request.",
      );
      return;
    }
    const next = new RecognitionCtor();
    next.continuous = false;
    next.interimResults = true;
    next.lang = "en-US";
    next.onresult = (event) => {
      const value = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ");
      setInput(value);
      if (Array.from(event.results).some((result) => result.isFinal))
        submit(value);
    };
    next.onend = () => mic.stop();
    next.onerror = () => {
      mic.stop();
      setError("I couldn’t hear that clearly. Try again or type the request.");
    };
    recognition.current = next;
    try { next.start(); } catch { setError("Recording locally. Speech recognition could not start; type your request instead."); }
  };
  const run = async () => {
    if (!plan.actions.length || running) return;
    setRunning(true);
    setError("");
    setResults([]);
    const completed: string[] = [];
    try {
      for (const action of plan.actions)
        completed.push(await api.executeAssistantAction(action));
      setResults(completed);
    } catch (reason) {
      setError(String(reason));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="assistant-page">
      <section className="assistant-hero">
        <div
          className={`assistant-orb ${listening ? "is-listening" : ""} ${running ? "is-working" : ""}`}
          aria-hidden="true"
        >
          <i />
          <i />
          <i />
        </div>
        <h1>
          Say it. <span>It gets done.</span>
        </h1>
        <p className="assistant-lead">
          One calm interface for your apps, accounts, bookmarks, and workspace.
        </p>
        <VoiceBeam
          className="assistant-voice-beam"
          stream={mic.stream}
          processing={running || mic.state === "processing"}
          colorVariant="colorful"
          theme="dark"
          idle={0.3}
        >
          <form
            className="assistant-composer"
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <button
              type="button"
              className={listening ? "voice active" : "voice"}
              onClick={() => void listen()}
              disabled={["requesting", "stopping", "processing"].includes(mic.state)}
              aria-label={listening ? "Stop listening" : "Start listening"}
            >
              {listening ? <MicOff size={19} /> : <Mic size={19} />}
            </button>
            <input
              id="doaorel-command-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={
                mic.state === "requesting"
                  ? "Connecting to your microphone…"
                  : listening
                    ? "Listening…"
                    : "Ask doaorel to open something…"
              }
              aria-label="Ask doaorel"
              autoFocus
            />
            <EffectBoundary
              fallback={
                <button
                  className="assistant-send"
                  disabled={!input.trim() || loading}
                  aria-label="Plan request"
                >
                  <ArrowUp size={18} />
                </button>
              }
            >
              <MetalFx
                className="assistant-metal-send"
                preset="chromatic"
                variant="circle"
                strength={0.72}
                theme="dark"
                innerShadow
              >
                <button
                  className="assistant-send"
                  disabled={!input.trim() || loading}
                  aria-label="Plan request"
                >
                  <ArrowUp size={18} />
                </button>
              </MetalFx>
            </EffectBoundary>
          </form>
        </VoiceBeam>
        <div className="recording-status" role="status">
          {mic.state === "requesting" ? "Requesting microphone permission…" : listening ? `Recording · ${Math.floor(mic.elapsed / 60)}:${String(mic.elapsed % 60).padStart(2, "0")}` : mic.state === "stopping" ? "Stopping recording…" : mic.state === "processing" ? "Preparing recording…" : mic.error}
          {mic.audio && !listening && <><span>Local recording · not uploaded</span><audio controls src={mic.audio}/></>}
        </div>
        <div className="assistant-hints">
          {prompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => {
                setInput(prompt);
                submit(prompt);
              }}
            >
              {prompt}
            </button>
          ))}
        </div>
        {error && !submitted && (
          <p className="assistant-voice-status" role="status">
            {error}
          </p>
        )}
      </section>

      {submitted && (
        <section className="assistant-plan is-visible" aria-live="polite">
          <div className="plan-card">
            <header>
              <div>
                <small>DOAOREL UNDERSTOOD</small>
                <h2>{plan.summary}</h2>
              </div>
              {plan.actions.length > 0 && (
                <span className="ready-pill">
                  <Check size={13} /> Ready
                </span>
              )}
            </header>
            <p className="heard">“{plan.heard}”</p>
            <div className="planned-actions">
              {plan.actions.map((action, index) => (
                <div className="planned-action" key={action.id}>
                  <span className="action-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <strong>{action.label}</strong>
                    <small>{action.detail}</small>
                  </span>
                  <ChevronRight size={16} />
                </div>
              ))}
            </div>
            {plan.notes.map((note) => (
              <p className="assistant-note" key={note}>
                {note}
              </p>
            ))}
            {results.map((result) => (
              <p className="assistant-result" key={result}>
                <Check size={14} /> {result}
              </p>
            ))}
            {error && <p className="assistant-error">{error}</p>}
            <footer>
              <button
                className="text-button"
                onClick={() => {
                  setSubmitted("");
                  setResults([]);
                }}
              >
                Clear
              </button>
              {results.length > 0 && (
                <button onClick={onActivity}>View activity</button>
              )}
              <button
                className="primary assistant-run"
                disabled={!native || !plan.actions.length || running}
                onClick={() => void run()}
              >
                {running
                  ? "Working…"
                  : `Run ${plan.actions.length || ""} ${plan.actions.length === 1 ? "action" : "actions"}`}
              </button>
            </footer>
          </div>
        </section>
      )}
    </div>
  );
}
