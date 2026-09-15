import { queryDatabase } from "./client";
import {
  getDate,
  getNumber,
  getRichText,
  getSelect,
  getTitle,
  getUrl,
} from "./properties";
import type { Projekt } from "@/types/notion";

export async function fetchProjekte(): Promise<Projekt[]> {
  const databaseId = process.env.NOTION_DB_PROJEKTE;
  if (!databaseId) throw new Error("NOTION_DB_PROJEKTE fehlt");

  const pages = await queryDatabase(databaseId);

  const projekte: Projekt[] = pages.map((page) => {
    const deadline = getDate(page, ["Deadline", "Fällig", "Termin", "Datum"]);
    const fortschritt = getNumber(page, ["Fortschritt", "Progress", "%"]);
    return {
      id: page.id,
      name: getTitle(page, ["Name", "Titel", "Title", "Projekt"]),
      status: getSelect(page, ["Status", "Phase"]),
      fortschritt:
        fortschritt !== null
          ? fortschritt <= 1
            ? Math.round(fortschritt * 100)
            : Math.round(fortschritt)
          : null,
      deadline: deadline?.start ?? null,
      beschreibung: getRichText(page, ["Beschreibung", "Notizen", "Notes", "Description"]),
      url: getUrl(page, ["Link", "URL"]) || ("url" in page ? page.url : ""),
    };
  });

  const abgeschlossenStates = ["done", "fertig", "abgeschlossen", "erledigt"];
  return projekte.sort((a, b) => {
    const aDone = abgeschlossenStates.includes(a.status.toLowerCase());
    const bDone = abgeschlossenStates.includes(b.status.toLowerCase());
    if (aDone !== bDone) return aDone ? 1 : -1;
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });
}
