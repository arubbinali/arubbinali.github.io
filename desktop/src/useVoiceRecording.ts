import { useEffect, useRef, useState } from "react";
export type VoiceState = "idle" | "requesting" | "recording" | "stopping" | "processing" | "error";

export function useVoiceRecording() {
  const [state, setState] = useState<VoiceState>("idle");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [audio, setAudio] = useState("");
  const [error, setError] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const recorder = useRef<MediaRecorder | null>(null);
  const capture = useRef<MediaStream | null>(null);
  const alive = useRef(true);
  const url = useRef("");
  const lock = useRef(false);
  const supported = typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia) && typeof MediaRecorder !== "undefined";
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      if (recorder.current?.state !== "inactive") recorder.current?.stop();
      capture.current?.getTracks().forEach(t => t.stop());
      if (url.current) URL.revokeObjectURL(url.current);
    };
  }, []);
  useEffect(() => {
    if (state !== "recording") return;
    const start = Date.now();
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 250);
    return () => clearInterval(timer);
  }, [state]);
  const stop = () => {
    if (recorder.current?.state === "recording") { setState("stopping"); recorder.current.stop(); }
  };
  const start = async () => {
    if (lock.current) return null;
    lock.current = true; setError(""); setElapsed(0);
    if (!supported) { setState("error"); setError("Audio recording is unavailable in this runtime. Type your request instead."); lock.current = false; return null; }
    setState("requesting");
    try {
      const next = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!alive.current) { next.getTracks().forEach(t => t.stop()); return null; }
      capture.current = next; setStream(next);
      if (url.current) URL.revokeObjectURL(url.current);
      url.current = ""; setAudio("");
      const recording = new MediaRecorder(next);
      const chunks: BlobPart[] = [];
      recording.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      recording.onstop = () => {
        next.getTracks().forEach(t => t.stop()); capture.current = null; lock.current = false;
        if (!alive.current) return;
        setStream(null); setState("processing");
        const blob = new Blob(chunks, { type: recording.mimeType || "audio/webm" });
        if (blob.size) { url.current = URL.createObjectURL(blob); setAudio(url.current); }
        setState("idle");
      };
      recording.onerror = () => {
        next.getTracks().forEach(t => t.stop()); lock.current = false;
        if (alive.current) { setStream(null); setState("error"); setError("Recording failed. Check the input device and try again."); }
      };
      recorder.current = recording; recording.start(250); setState("recording");
      return next;
    } catch (reason) {
      capture.current?.getTracks().forEach(t => t.stop()); capture.current = null; lock.current = false;
      if (alive.current) {
        setStream(null); setState("error");
        setError(reason instanceof DOMException && reason.name === "NotAllowedError"
          ? "Microphone permission was denied. Enable it in Windows privacy settings, then try again."
          : "No available microphone could be opened. Check your input device.");
      }
      return null;
    }
  };
  return { state, stream, audio, elapsed, error, supported, start, stop };
}
