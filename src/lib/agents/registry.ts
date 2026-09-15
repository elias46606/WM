import type { Agent } from "./types";
import { notionSyncAgent } from "./notionSyncAgent";
import { briefingAgent } from "./briefingAgent";
import { researchAgent } from "./researchAgent";
import { taskAgent, codingAgent } from "./placeholderAgents";

// Neuen Agenten hinzufügen: Datei in lib/agents/ anlegen, die das
// `Agent`-Interface implementiert, und hier eintragen. Das
// Active-Agents-Panel und /api/agents holen sich die Liste
// automatisch von hier.
export const agentRegistry: Agent[] = [
  notionSyncAgent,
  briefingAgent,
  researchAgent,
  taskAgent,
  codingAgent,
];
