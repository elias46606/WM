"use client";

import { Panel, PanelHeader } from "./hud/Panel";
import { StatusBadge } from "./hud/StatusBadge";
import { usePolling } from "@/lib/hooks/usePolling";
import type { ApiEnvelope, Projekt } from "@/types/notion";

const EMPTY: ApiEnvelope<Projekt[]> = {
  state: "not_configured",
  data: [],
  fetchedAt: "",
};

export function ProjectStatus() {
  const { data: envelope } = usePolling("/api/notion/projekte", 60_000, EMPTY);

  return (
    <Panel className="flex h-full flex-col">
      <PanelHeader
        title="Projekt-Status"
        subtitle="Notion · Projekte"
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
          Notion-Projekte-DB nicht konfiguriert (NOTION_DB_PROJEKTE).
        </p>
      )}
      {envelope.state === "error" && (
        <p className="text-xs text-red-alert/80">{envelope.error}</p>
      )}
      <ul className="flex-1 space-y-3 overflow-y-auto">
        {envelope.data.slice(0, 5).map((p) => (
          <li key={p.id}>
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-xs font-medium text-white/90">
                {p.name || "(ohne Titel)"}
              </span>
              <span className="shrink-0 text-[10px] uppercase tracking-wider text-cyan-glow/50">
                {p.status}
              </span>
            </div>
            {p.fortschritt !== null && (
              <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-cyan-glow shadow-glow-sm"
                  style={{
                    width: `${Math.min(100, Math.max(0, p.fortschritt))}%`,
                  }}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </Panel>
  );
}
