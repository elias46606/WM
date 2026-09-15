"use client";

import { StatusBadge } from "./hud/StatusBadge";
import { usePolling } from "@/lib/hooks/usePolling";

type Status = {
  notion: { schule: boolean; projekte: boolean; depot: boolean };
  elevenlabs: boolean;
  gmail: boolean;
  browserMcp: boolean;
};

const EMPTY: Status = {
  notion: { schule: false, projekte: false, depot: false },
  elevenlabs: false,
  gmail: false,
  browserMcp: false,
};

export function SystemStatus() {
  const { data } = usePolling("/api/system/status", 120_000, EMPTY);
  const notionOk =
    data.notion.schule || data.notion.projekte || data.notion.depot;

  const items: Array<{ label: string; on: boolean }> = [
    { label: "NOTION", on: notionOk },
    { label: "VOICE", on: data.elevenlabs },
    { label: "MAIL", on: data.gmail },
    { label: "MCP", on: data.browserMcp },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((it) => (
        <StatusBadge
          key={it.label}
          level={it.on ? "online" : "idle"}
          label={it.label}
        />
      ))}
    </div>
  );
}
