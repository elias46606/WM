import type { Agent } from "./types";

// Platzhalter-Agenten, damit die Architektur für mehrere spezialisierte
// Agenten von Anfang an sichtbar ist. Beide bekommen erst dann echte
// Logik, wenn die jeweilige Ausbaustufe drankommt (Task-Verwaltung /
// Code-Ausführung) — bis dahin melden sie ehrlich "idle" statt etwas
// vorzutäuschen.

export const taskAgent: Agent = {
  id: "task-agent",
  name: "Task-Agent",
  role: "Aufgaben & Reminders",
  async describeStatus() {
    return {
      state: "idle",
      detail: "Grundgerüst vorhanden, noch keine Aufgabenlogik verknüpft.",
    };
  },
};

export const codingAgent: Agent = {
  id: "coding-agent",
  name: "Coding-Agent",
  role: "Code & Automatisierung",
  async describeStatus() {
    return {
      state: "idle",
      detail: "Grundgerüst vorhanden, noch keine Ausführungsumgebung verknüpft.",
    };
  },
};
