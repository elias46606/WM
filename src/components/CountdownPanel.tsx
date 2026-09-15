"use client";

import { useEffect, useState } from "react";
import { Panel, PanelHeader } from "./hud/Panel";

type CountdownResponse = { targetDate: string | null; source: string };

function daysUntil(target: string): number {
  const now = new Date();
  const t = new Date(target);
  const msPerDay = 86400000;
  const todayMidnight = Date.UTC(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const targetMidnight = Date.UTC(
    t.getFullYear(),
    t.getMonth(),
    t.getDate()
  );
  return Math.round((targetMidnight - todayMidnight) / msPerDay);
}

export function CountdownPanel() {
  const [info, setInfo] = useState<CountdownResponse | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/countdown", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => mounted && setInfo(json))
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Panel glow>
      <PanelHeader
        title="Countdown"
        subtitle="Erste Abiturprüfung"
      />
      {!info ? (
        <div className="py-4 text-xs text-cyan-glow/40">Lädt…</div>
      ) : info.targetDate ? (
        <div>
          <div className="font-display text-5xl font-black text-cyan-glow text-glow tabular-nums">
            {daysUntil(info.targetDate)}
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.25em] text-cyan-glow/50">
            Tage bis {new Date(info.targetDate).toLocaleDateString("de-DE")}
          </div>
        </div>
      ) : (
        <div className="py-2">
          <div className="text-xs text-cyan-glow/50">
            Kein Termin gesetzt.
          </div>
          <div className="mt-1 text-[10px] text-cyan-glow/30">
            Setze ABITUR_START_DATE in .env.local oder trage einen Termin
            &bdquo;Abitur…&ldquo; in die Schule-Datenbank ein.
          </div>
        </div>
      )}
    </Panel>
  );
}
