"use client";

import { useEffect, useState } from "react";

const WOCHENTAGE = [
  "SONNTAG",
  "MONTAG",
  "DIENSTAG",
  "MITTWOCH",
  "DONNERSTAG",
  "FREITAG",
  "SAMSTAG",
];

export function ClockDate() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) {
    return <div className="h-[38px]" />;
  }

  const time = now.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const date = now.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="text-right">
      <div className="font-display text-2xl font-bold text-cyan-glow text-glow tabular-nums">
        {time}
      </div>
      <div className="text-[10px] uppercase tracking-[0.25em] text-cyan-glow/50">
        {WOCHENTAGE[now.getDay()]} · {date}
      </div>
    </div>
  );
}
