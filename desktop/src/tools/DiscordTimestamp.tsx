import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { dateInput, discordFormats, parseTimestamp, timestampPreview } from "./timestamp";

export function DiscordTimestamp() {
  const [utc, setUtc] = useState(false);
  const [value, setValue] = useState(() => dateInput(new Date(), false));
  const [copied, setCopied] = useState("");
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());
  const timestamp = parseTimestamp(value, utc);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  useEffect(() => { const timer = setTimeout(() => setCopied(""), 1800); return () => clearTimeout(timer); }, [copied]);
  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(text); setError(""); }
    catch { setError("Clipboard access failed. Select and copy the syntax manually."); }
  };
  return <section className="timestamp-tool">
    <header><p className="eyebrow">BUILT-IN TOOL</p><h2>Discord timestamps</h2><p className="muted">One moment, everyone's timezone. Discord displays each timestamp in the reader's local time.</p></header>
    <div className="timestamp-controls">
      <label>Date & time<input type="datetime-local" step="1" value={value} onChange={e => setValue(e.target.value)}/></label>
      <label>Input timezone<select value={utc ? "utc" : "local"} onChange={e => {
        const next = e.target.value === "utc"; if (timestamp !== null) setValue(dateInput(new Date(timestamp * 1000), next)); setUtc(next);
      }}><option value="local">{Intl.DateTimeFormat().resolvedOptions().timeZone} (local)</option><option value="utc">UTC</option></select></label>
    </div>
    <div className="button-group"><button onClick={() => setValue(dateInput(new Date(), utc))}>Now</button>{[15, 60, 1440].map(minutes => <button key={minutes} disabled={timestamp === null} onClick={() => setValue(dateInput(new Date((timestamp! + minutes * 60) * 1000), utc))}>+{minutes === 1440 ? "1 day" : minutes === 60 ? "1 hour" : "15 min"}</button>)}</div>
    {timestamp === null ? <p className="warning" role="alert">Choose a valid date and time. Times skipped by daylight saving are not valid.</p> : <>
      <p className="small muted">Unix: {timestamp} · UTC: {new Date(timestamp * 1000).toISOString().replace("T", " ").replace(".000Z", "")}</p>
      <div className="timestamp-formats">{discordFormats.map(([format, label]) => {
        const text = `<t:${timestamp}:${format}>`;
        return <div className="timestamp-row" key={format}><span><small>{label}</small><strong>{timestampPreview(timestamp, format, utc, now)}</strong></span><code>{text}</code><button aria-label={`Copy ${label}`} onClick={() => void copy(text)}>{copied === text ? <Check size={16}/> : <Copy size={16}/>}</button></div>;
      })}</div>
      {!utc && <p className="muted small">Local daylight-saving rules apply. For ambiguous clock-change times, use UTC to choose the exact moment.</p>}
    </>}
    <p role="status" className={error ? "warning" : "muted small"}>{error || (copied ? "Copied to clipboard" : "")}</p>
  </section>;
}
