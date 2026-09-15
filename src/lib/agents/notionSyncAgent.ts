import type { Agent } from "./types";
import { integrationStatus } from "@/lib/config";

export const notionSyncAgent: Agent = {
  id: "notion-sync",
  name: "Notion-Sync-Agent",
  role: "Daten-Sync",
  async describeStatus() {
    const { schule, projekte, depot } = integrationStatus.notion;
    const active = [schule && "Schule", projekte && "Projekte", depot && "Depot"]
      .filter(Boolean)
      .join(", ");
    if (!active) {
      return { state: "offline", detail: "Keine Notion-DB konfiguriert." };
    }
    return {
      state: "online",
      detail: `Synchronisiert: ${active} (alle 60s).`,
    };
  },
};
