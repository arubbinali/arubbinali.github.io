import { useRef, useState, useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { api, native } from "../api";
import { Dialog } from "./Dialog";

export function ShellDialog({ kind, close }: { kind: "exit" | "about"; close: () => void }) {
  const [closing, setClosing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const dismiss = () => { setClosing(true); timer.current = setTimeout(close, 260); };
  const confirm = async () => {
    setBusy(true); setError("");
    try {
      if (kind === "about") {
        await api.executeAssistantAction({ id: "about-doaorel", kind: "openUrl", label: "About Doaorel", detail: "Doaorel software information", url: "https://doaor.com/software" });
        dismiss();
      } else {
        setClosing(true);
        timer.current = setTimeout(() => { void getCurrentWindow().close().catch(reason => { setError(String(reason)); setClosing(false); setBusy(false); }); }, 260);
      }
    } catch (reason) { setError(String(reason)); setBusy(false); }
  };
  return <Dialog title={kind === "exit" ? "Exit Doaorel?" : "About Doaorel"} closing={closing} onClose={() => { if (!busy) dismiss(); }}>
    <p className="muted">{kind === "exit" ? "Your saved workspace stays on this device. Unsaved input will be lost." : "Open the Doaorel software and information page in your default browser?"}</p>
    {kind === "about" && <p className="mono">https://doaor.com/software</p>}
    {error && <p role="alert" className="warning">{error}</p>}
    <footer><button autoFocus disabled={busy} onClick={dismiss}>Cancel</button><button className="primary" disabled={busy || !native} onClick={() => void confirm()}>{busy ? "Please wait…" : kind === "exit" ? "Exit" : "Open page"}</button></footer>
  </Dialog>;
}
