import { GoogleGenAI } from "@google/genai";
import { integrationStatus, abiturStartDate } from "@/lib/config";
import { fetchSchuleTermine } from "@/lib/notion/schule";
import { fetchProjekte } from "@/lib/notion/projekte";
import { fetchDepotVerlauf } from "@/lib/notion/depot";

// Baut eine kurze Zusammenfassung der Live-Daten, die Claude als
// Kontext bekommt, damit die Antworten den tatsächlichen Dashboard-
// Stand kennen statt zu halluzinieren.
async function buildContext(): Promise<string> {
  const lines: string[] = [];

  const target = abiturStartDate();
  if (target) {
    const days = Math.round(
      (new Date(target).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) /
        86400000
    );
    lines.push(`Abitur-Countdown: noch ${days} Tage (${target}).`);
  } else {
    lines.push("Abitur-Countdown: kein Termin hinterlegt.");
  }

  if (integrationStatus.notion.schule) {
    try {
      const termine = await fetchSchuleTermine();
      lines.push(
        termine.length === 0
          ? "Schule: keine anstehenden Termine."
          : "Nächste Schul-Termine: " +
              termine
                .slice(0, 5)
                .map(
                  (t) =>
                    `${t.titel}${t.fach ? " (" + t.fach + ")" : ""}${t.datum ? " am " + t.datum : ""}`
                )
                .join("; ")
      );
    } catch {
      lines.push("Schule: Daten gerade nicht abrufbar.");
    }
  }

  if (integrationStatus.notion.projekte) {
    try {
      const projekte = await fetchProjekte();
      lines.push(
        projekte.length === 0
          ? "Projekte: keine gefunden."
          : "Projekte: " +
              projekte
                .slice(0, 8)
                .map((p) => `${p.name} (${p.status}${p.fortschritt !== null ? ", " + p.fortschritt + "%" : ""})`)
                .join("; ")
      );
    } catch {
      lines.push("Projekte: Daten gerade nicht abrufbar.");
    }
  }

  if (integrationStatus.notion.depot) {
    try {
      const eintraege = await fetchDepotVerlauf();
      const latest = eintraege[0];
      lines.push(
        latest && latest.wert !== null
          ? `Depot: aktueller Wert ${latest.wert.toLocaleString("de-DE")} Euro (Stand ${latest.datum ?? "unbekannt"}).`
          : "Depot: kein aktueller Wert gefunden."
      );
    } catch {
      lines.push("Depot: Daten gerade nicht abrufbar.");
    }
  }

  return lines.join("\n");
}

async function respondWithGemini(transcript: string): Promise<string> {
  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const context = await buildContext();

  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: transcript,
    config: {
      systemInstruction: [
        "Du bist Jarvis, das persönliche Command-Center-Assistenzsystem eines Gymnasiasten in der Abitur-Vorbereitung (Q2).",
        "Antworte kurz und natürlich auf Deutsch (1-3 Sätze), da die Antwort per Sprachausgabe vorgelesen wird — keine Aufzählungen, keine Markdown-Formatierung.",
        "Nutze ausschließlich die folgenden Live-Daten aus dem Dashboard, erfinde nichts dazu:",
        context,
      ].join("\n\n"),
    },
  });

  const text = response.text?.trim();
  return text || "Keine Antwort erhalten.";
}

// Regelbasierter Fallback: läuft ohne GEMINI_API_KEY und ohne
// zusätzliche Kosten, deckt aber nur die naheliegendsten Fragen ab.
async function respondWithRules(transcript: string): Promise<string> {
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

  return "Verstanden. Für diese Anfrage ist noch keine Logik hinterlegt — hinterleg einen GEMINI_API_KEY für echte Konversation, oder erweitere lib/assistant/respond.ts.";
}

export async function respond(transcript: string): Promise<string> {
  if (process.env.GEMINI_API_KEY) {
    try {
      return await respondWithGemini(transcript);
    } catch {
      // Gemini nicht erreichbar (z.B. Netzwerk/Quota) -> Regel-Fallback
      return respondWithRules(transcript);
    }
  }
  return respondWithRules(transcript);
}
