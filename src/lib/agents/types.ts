// Architektur für mehrere spezialisierte Sub-Agenten. Jeder Agent
// implementiert nur `describeStatus()` (billig, für das Dashboard-
// Polling) und optional `run()` (die eigentliche Arbeit, wird gezielt
// aufgerufen statt bei jedem Poll). So lassen sich neue Agenten
// hinzufügen, ohne dass das Panel sie kennen muss — einfach in
// registry.ts eintragen.

export type AgentState = "online" | "idle" | "warn" | "offline";

export type AgentStatusReport = {
  state: AgentState;
  detail: string;
};

export interface Agent {
  id: string;
  name: string;
  role: string;
  describeStatus(): Promise<AgentStatusReport>;
  run?(input?: unknown): Promise<unknown>;
}
