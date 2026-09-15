import type { Agent } from "./types";
import { readBriefing } from "@/lib/briefingStore";

export const briefingAgent: Agent = {
  id: "briefing-watch",
  name: "Briefing-Agent",
  role: "News-Ingestion",
  async describeStatus() {
    const briefing = await readBriefing();
    if (!briefing) {
      return { state: "offline", detail: "Noch kein Briefing empfangen." };
    }
    const today = new Date().toISOString().slice(0, 10);
    if (briefing.date === today) {
      return { state: "online", detail: `Heutiges Briefing von ${briefing.source} geladen.` };
    }
    return { state: "warn", detail: `Letztes Briefing vom ${briefing.date} (veraltet).` };
  },
};
