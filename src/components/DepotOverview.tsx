"use client";

import { Panel, PanelHeader } from "./hud/Panel";
import { StatusBadge } from "./hud/StatusBadge";
import clsx from "@/lib/clsx";
import { usePolling } from "@/lib/hooks/usePolling";
import type { ApiEnvelope, DepotEintrag } from "@/types/notion";

const EMPTY: ApiEnvelope<DepotEintrag[]> = {
  state: "not_configured",
  data: [],
  fetchedAt: "",
};

export function DepotOverview() {
  const { data: envelope } = usePolling("/api/notion/depot", 60_000, EMPTY);
  const latest = envelope.data[0];

  return (
    <Panel className="flex h-full flex-col">
      <PanelHeader
        title="Depot"
        subtitle="Notion · Depot-Verlauf"
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
          Notion-Depot-DB nicht konfiguriert (NOTION_DB_DEPOT).
        </p>
      )}
      {envelope.state === "error" && (
        <p className="text-xs text-red-alert/80">{envelope.error}</p>
      )}
      {envelope.state === "live" && latest && (
        <div className="mb-3">
          <div className="font-display text-3xl font-bold text-cyan-glow text-glow tabular-nums">
            {latest.wert !== null
              ? latest.wert.toLocaleString("de-DE", {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                })
              : "—"}
          </div>
          <div className="mt-1 flex items-center gap-2 text-[10px] uppercase tracking-wider">
            {latest.veraenderung !== null && (
              <span
                className={clsx(
                  "font-bold",
                  latest.veraenderung >= 0 ? "text-cyan-glow" : "text-red-alert"
                )}
              >
                {latest.veraenderung >= 0 ? "▲" : "▼"}{" "}
                {latest.veraenderung.toFixed(2)}
                {Math.abs(latest.veraenderung) <= 1 ? "" : "%"}
              </span>
            )}
            {latest.datum && (
              <span className="text-cyan-glow/40">
                Stand {new Date(latest.datum).toLocaleDateString("de-DE")}
              </span>
            )}
          </div>
        </div>
      )}
      <ul className="flex-1 space-y-1.5 overflow-y-auto">
        {envelope.data.slice(1, 6).map((d) => (
          <li
            key={d.id}
            className="flex items-center justify-between text-[10px] text-cyan-glow/50"
          >
            <span>
              {d.datum ? new Date(d.datum).toLocaleDateString("de-DE") : "—"}
            </span>
            <span className="tabular-nums text-white/60">
              {d.wert !== null
                ? d.wert.toLocaleString("de-DE", {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 0,
                  })
                : "—"}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
