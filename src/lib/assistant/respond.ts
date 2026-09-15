import { integrationStatus, abiturStartDate } from "@/lib/config";
import { fetchSchuleTermine } from "@/lib/notion/schule";
import { fetchProjekte } from "@/lib/notion/projekte";
import { fetchDepotVerlauf } from "@/lib/notion/depot";

// Regelbasierter MVP-Responder: beantwortet die naheliegendsten
// Fragen direkt aus den Live-Daten des Dashboards. Bewusst ohne
// LLM-Anbindung, damit Jarvis ohne weitere Kosten/Keys läuft.
//
// Erweiterungspunkt: um "echte" Konversation zu bekommen, hier einfach
// vor dem Fallback einen Call an die Anthropic Messages API einbauen
// (System-Prompt mit den unten gesammelten Live-Daten füttern).
export async function respond(transcript: string): Promise<string> {
  const q = transcript.toLowerCase();

  if (q.includes("abitur") || q.includes("countdown") || q.includes("wie viele tage")) {
    const target = abiturStartDate();
    if (!target) {
      return "Es ist noch kein Abitur-Termin hinterlegt. Trage ABITUR_START_DATE in den Einstellungen ein.";
    }
    const days = Math.round(
      (new Date(target).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) /
        86400000
    );
    return `Noch ${days} Tage bis zur ersten Abiturprüfung am ${new Date(target).toLocaleDateString("de-DE")}.`;
  }

  if (q.includes("termin") || q.includes("schule") || q.includes("klausur")) {
    if (!integrationStatus.notion.schule) {
      return "Die Schule-Datenbank ist nicht verbunden.";
    }
    const termine = await fetchSchuleTermine();
    if (termine.length === 0) return "Aktuell keine anstehenden Termine.";
    const next = termine[0];
    return `Nächster Termin: ${next.titel}${next.fach ? " in " + next.fach : ""}${next.datum ? " am " + new Date(next.datum).toLocaleDateString("de-DE") : ""}.`;
  }

  if (q.includes("projekt")) {
    if (!integrationStatus.notion.projekte) {
      return "Die Projekte-Datenbank ist nicht verbunden.";
    }
    const projekte = await fetchProjekte();
    if (projekte.length === 0) return "Keine Projekte gefunden.";
    const aktive = projekte.filter(
      (p) => !["done", "fertig", "abgeschlossen", "erledigt"].includes(p.status.toLowerCase())
    );
    return `${aktive.length} aktive Projekte. Zuoberst: ${aktive[0]?.name ?? projekte[0].name}.`;
  }

  if (q.includes("depot") || q.includes("aktien") || q.includes("portfolio")) {
    if (!integrationStatus.notion.depot) {
      return "Die Depot-Datenbank ist nicht verbunden.";
    }
    const eintraege = await fetchDepotVerlauf();
    const latest = eintraege[0];
    if (!latest || latest.wert === null) return "Kein aktueller Depotwert gefunden.";
    return `Aktueller Depotwert: ${latest.wert.toLocaleString("de-DE")} Euro.`;
  }

  return "Verstanden. Für diese Anfrage ist noch keine Logik hinterlegt — das lässt sich in lib/assistant/respond.ts erweitern.";
}
