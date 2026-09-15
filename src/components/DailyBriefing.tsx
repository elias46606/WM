"use client";

import { Panel, PanelHeader } from "./hud/Panel";
import { StatusBadge } from "./hud/StatusBadge";
import { usePolling } from "@/lib/hooks/usePolling";
import type { Briefing } from "@/lib/briefingStore";

type BriefingResponse = {
  state: "empty" | "current" | "stale";
  briefing: Briefing | null;
};

const EMPTY: BriefingResponse = { state: "empty", briefing: null };

export function DailyBriefing() {
  const { data } = usePolling("/api/briefing", 5 * 60_000, EMPTY);

  return (
    <Panel className="flex h-full flex-col">
      <PanelHeader
        title="Daily Briefing"
        subtitle="News & Zusammenfassung"
        right={
          <StatusBadge
            level={
              data.state === "current"
                ? "online"
                : data.state === "stale"
                  ? "warn"
                  : "idle"
            }
            label={
              data.state === "current"
                ? "AKTUELL"
                : data.state === "stale"
                  ? "VERALTET"
                  : "LEER"
            }
          />
        }
      />
      {!data.briefing ? (
        <div className="text-xs text-cyan-glow/40">
          Noch kein Briefing empfangen. Der Cowork Scheduled Task sendet
          täglich per POST an <code className="text-cyan-glow/60">/api/briefing</code>.
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <p className="text-[10px] uppercase tracking-widest text-cyan-glow/40">
            {new Date(data.briefing.date).toLocaleDateString("de-DE", {
              weekday: "long",
              day: "2-digit",
              month: "long",
            })}
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-white/85">
            {data.briefing.summary}
          </p>
          {data.briefing.items.length > 0 && (
            <ul className="mt-2 space-y-1">
              {data.briefing.items.map((item, i) => (
                <li
                  key={i}
                  className="flex gap-1.5 text-[11px] text-white/70"
                >
                  <span className="text-cyan-glow/60">▸</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Panel>
  );
}
