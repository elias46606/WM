import type { Agent } from "./types";
import { integrationStatus } from "@/lib/config";
import { getBrowserAgent } from "@/lib/mcp/browser";

export const researchAgent: Agent = {
  id: "research-agent",
  name: "Research-Agent",
  role: "Websuche / Recherche",
  async describeStatus() {
    if (!integrationStatus.browserMcp) {
      return {
        state: "idle",
        detail: "Wartet auf Tavily-Anbindung (TAVILY_API_KEY).",
      };
    }
    return { state: "online", detail: "Bereit für Suchanfragen (Tavily)." };
  },
  async run(input) {
    const query = typeof input === "string" ? input : "";
    return getBrowserAgent().search(query);
  },
};
