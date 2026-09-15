import { queryDatabase } from "./client";
import { getDate, getNumber, getRichText, getTitle, getUrl } from "./properties";
import type { DepotEintrag } from "@/types/notion";

export async function fetchDepotVerlauf(): Promise<DepotEintrag[]> {
  const databaseId = process.env.NOTION_DB_DEPOT;
  if (!databaseId) throw new Error("NOTION_DB_DEPOT fehlt");

  const pages = await queryDatabase(databaseId);

  const eintraege: DepotEintrag[] = pages.map((page) => {
    const date = getDate(page, ["Datum", "Date"]);
    return {
      id: page.id,
      datum: date?.start ?? null,
      bezeichnung: getTitle(page, ["Name", "Titel", "Position", "Title"]),
      wert: getNumber(page, ["Gesamtwert", "Wert", "Value", "Depotwert", "Kurs"]),
      veraenderung: getNumber(page, [
        "Veränderung",
        "Change",
        "Rendite",
        "Performance",
        "%",
      ]),
      notiz: getRichText(page, ["Notiz", "Notizen", "Notes"]),
      url: getUrl(page, ["Link", "URL"]) || ("url" in page ? page.url : ""),
    };
  });

  return eintraege.sort((a, b) => {
    if (!a.datum) return 1;
    if (!b.datum) return -1;
    return new Date(b.datum).getTime() - new Date(a.datum).getTime();
  });
}
