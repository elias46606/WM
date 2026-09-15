"use client";

import { Panel, PanelHeader } from "./hud/Panel";
import { StatusBadge } from "./hud/StatusBadge";
import { usePolling } from "@/lib/hooks/usePolling";
import type { ApiEnvelope, SchuleTermin } from "@/types/notion";

const EMPTY: ApiEnvelope<SchuleTermin[]> = {
  state: "not_configured",
  data: [],
  fetchedAt: "",
};

function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const days = Math.round(
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
      Date.UTC(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate()
      )) /
      86400000
  );
  const dateStr = date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
  });
  if (days === 0) return `Heute · ${dateStr}`;
  if (days === 1) return `Morgen · ${dateStr}`;
  if (days > 1 && days <= 7) return `in ${days} Tagen · ${dateStr}`;
  return dateStr;
}

export function ScheduleFeed() {
  const { data: envelope } = usePolling("/api/notion/schule", 60_000, EMPTY);

  return (
    <Panel className="flex h-full flex-col">
      <PanelHeader
        title="Nächste Termine"
        subtitle="Notion · Schule"
        right={
          <StatusBadge
            level={
              envelope.state === "live"
                ? "online"
                : envelope.state === "error"
                  ? "offline"
                  : "idle"
            }
          />
        }
      />
      {envelope.state === "not_configured" && (
        <p className="text-xs text-cyan-glow/40">
          Notion-Schule-DB nicht konfiguriert (NOTION_DB_SCHULE).
        </p>
      )}
      {envelope.state === "error" && (
        <p className="text-xs text-red-alert/80">{envelope.error}</p>
      )}
      {envelope.state === "live" && envelope.data.length === 0 && (
        <p className="text-xs text-cyan-glow/40">Keine offenen Termine.</p>
      )}
      <ul className="flex-1 space-y-2 overflow-y-auto">
        {envelope.data.slice(0, 6).map((t) => (
          <li
            key={t.id}
            className="flex items-center justify-between gap-2 border-b border-cyan-glow/10 pb-2 last:border-0"
          >
            <div className="min-w-0">
              <div className="truncate text-xs font-medium text-white/90">
                {t.titel || "(ohne Titel)"}
              </div>
              <div className="mt-0.5 text-[10px] uppercase tracking-wider text-cyan-glow/40">
                {[t.fach, t.typ].filter(Boolean).join(" · ")}
              </div>
            </div>
            {t.datum && (
              <div className="shrink-0 text-right text-[10px] text-cyan-glow/70">
                {formatRelativeDate(t.datum)}
              </div>
            )}
          </li>
        ))}
      </ul>
    </Panel>
  );
}
