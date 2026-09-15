import { promises as fs } from "fs";
import path from "path";

// Datei-basierter Speicher für das tägliche Briefing. Bewusst simpel
// gehalten (kein DB-Overhead für ein Single-User-Tool): der Cowork
// Scheduled Task (oder ein anderer Job) pusht 1x/Tag per POST
// /api/briefing die Zusammenfassung rein, das Dashboard liest sie.

export type Briefing = {
  date: string; // YYYY-MM-DD
  summary: string;
  items: string[];
  source: string;
  receivedAt: string;
};

const FILE_PATH = path.join(process.cwd(), "data", "briefing.json");

export async function readBriefing(): Promise<Briefing | null> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf-8");
    return JSON.parse(raw) as Briefing;
  } catch {
    return null;
  }
}

export async function writeBriefing(briefing: Briefing): Promise<void> {
  await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
  await fs.writeFile(FILE_PATH, JSON.stringify(briefing, null, 2), "utf-8");
}
