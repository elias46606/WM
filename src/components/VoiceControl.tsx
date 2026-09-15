"use client";

import { useCallback, useRef, useState } from "react";
import clsx from "@/lib/clsx";

type VoiceState = "idle" | "recording" | "thinking" | "speaking" | "error";

const MIME_CANDIDATES = ["audio/webm", "audio/mp4", "audio/ogg"];

function pickMimeType(): string {
  if (typeof window === "undefined" || !("MediaRecorder" in window)) return "";
  for (const mime of MIME_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(mime)) return mime;
  }
  return "";
}

export function VoiceControl() {
  const [state, setState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [answer, setAnswer] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Fallback über die im Browser eingebaute Sprachausgabe (kostenlos,
  // kein Account nötig) — springt ein, wenn ElevenLabs TTS nicht
  // verfügbar ist (z.B. Free-Plan-Einschränkung auf Library-Voices).
  const speakWithBrowser = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) {
      setErrorMsg("Sprachausgabe wird von diesem Browser nicht unterstützt.");
      setState("error");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "de-DE";
    utterance.onend = () => setState("idle");
    utterance.onerror = () => {
      setErrorMsg("Sprachausgabe fehlgeschlagen.");
      setState("error");
    };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, []);

  const speak = useCallback(
    async (text: string) => {
      setState("speaking");
      try {
        const res = await fetch("/api/voice/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        if (!res.ok) throw new Error((await res.json()).error ?? "TTS-Fehler");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.onended = () => setState("idle");
        await audio.play();
      } catch {
        // ElevenLabs nicht verfügbar (z.B. Free-Plan-Limit) -> Browser-TTS
        speakWithBrowser(text);
      }
    },
    [speakWithBrowser]
  );

  const handleStop = useCallback(async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;
    recorder.stop();
    recorder.stream.getTracks().forEach((t) => t.stop());
  }, []);

  const startRecording = useCallback(async () => {
    setErrorMsg("");
    setTranscript("");
    setAnswer("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        setState("thinking");
        try {
          const audioBlob = new Blob(chunksRef.current, {
            type: mimeType || "audio/webm",
          });
          const form = new FormData();
          form.append("audio", audioBlob, "input.webm");
          const sttRes = await fetch("/api/voice/stt", {
            method: "POST",
            body: form,
          });
          if (!sttRes.ok) throw new Error((await sttRes.json()).error ?? "STT-Fehler");
          const { transcript: text } = await sttRes.json();
          setTranscript(text);

          const respondRes = await fetch("/api/voice/respond", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transcript: text }),
          });
          if (!respondRes.ok) throw new Error((await respondRes.json()).error ?? "Antwort-Fehler");
          const { text: answerText } = await respondRes.json();
          setAnswer(answerText);
          await speak(answerText);
        } catch (err) {
          setErrorMsg(err instanceof Error ? err.message : "Verarbeitung fehlgeschlagen");
          setState("error");
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setState("recording");
    } catch {
      setErrorMsg("Mikrofon-Zugriff nicht möglich.");
      setState("error");
    }
  }, [speak]);

  const onTap = () => {
    if (state === "recording") {
      handleStop();
    } else if (state === "idle" || state === "error") {
      startRecording();
    }
  };

  const label =
    state === "recording"
      ? "HÖRE ZU…"
      : state === "thinking"
        ? "VERARBEITE…"
        : state === "speaking"
          ? "ANTWORTE…"
          : "TAP TO SPEAK";

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={onTap}
        disabled={state === "thinking" || state === "speaking"}
        className={clsx(
          "relative flex h-20 w-20 items-center justify-center rounded-full border-2 transition-all",
          state === "recording"
            ? "border-red-alert shadow-[0_0_30px_rgba(255,84,112,0.5)]"
            : "border-cyan-glow/60 shadow-glow hover:border-cyan-glow"
        )}
      >
        {state === "recording" && (
          <span className="absolute inset-0 animate-ping rounded-full bg-red-alert/20" />
        )}
        <svg
          viewBox="0 0 24 24"
          className={clsx(
            "h-8 w-8",
            state === "recording" ? "text-red-alert" : "text-cyan-glow"
          )}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
        >
          <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Z" />
          <path d="M19 11a7 7 0 0 1-14 0" />
          <path d="M12 18v3" />
        </svg>
      </button>
      <div className="text-center">
        <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-glow/70">
          {label}
        </div>
        {transcript && (
          <div className="mt-1 max-w-xs text-[11px] italic text-white/50">
            &bdquo;{transcript}&ldquo;
          </div>
        )}
        {answer && (
          <div className="mt-1 max-w-xs text-[11px] text-cyan-glow/80">{answer}</div>
        )}
        {errorMsg && (
          <div className="mt-1 max-w-xs text-[11px] text-red-alert/80">{errorMsg}</div>
        )}
      </div>
    </div>
  );
}
