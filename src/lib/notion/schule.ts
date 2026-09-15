import { queryDatabase } from "./client";
import { getCheckbox, getDate, getSelect, getTitle, getUrl } from "./properties";
import type { SchuleTermin } from "@/types/notion";

export async function fetchSchuleTermine(): Promise<SchuleTermin[]> {
  const databaseId = process.env.NOTION_DB_SCHULE;
  if (!databaseId) throw new Error("NOTION_DB_SCHULE fehlt");

  const pages = await queryDatabase(databaseId);

  const doneStates = ["erledigt", "done", "fertig", "abgeschlossen"];

  const termine: SchuleTermin[] = pages.map((page) => {
    const date = getDate(page, ["Datum", "Date", "Fällig", "Faellig", "Termin", "Deadline"]);
    const status = getSelect(page, ["Status"]);
    return {
      id: page.id,
      titel: getTitle(page, ["Thema", "Name", "Titel", "Title"]),
      typ: getSelect(page, ["Typ", "Type", "Kategorie", "Art"]),
      fach: getSelect(page, ["Fach", "Subject", "Kurs"]),
      datum: date?.start ?? null,
      erledigt:
        getCheckbox(page, ["Erledigt", "Done", "Fertig"]) ||
        doneStates.includes(status.toLowerCase()),
      url: getUrl(page, ["Link", "URL"]) || ("url" in page ? page.url : ""),
    };
  });

  const now = Date.now();
  return termine
    .filter((t) => !t.erledigt)
    .filter((t) => !t.datum || new Date(t.datum).getTime() >= now - 86400000)
    .sort((a, b) => {
      if (!a.datum) return 1;
      if (!b.datum) return -1;
      return new Date(a.datum).getTime() - new Date(b.datum).getTime();
    });
}
