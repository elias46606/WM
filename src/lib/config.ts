// Zentrale Stelle, die anzeigt, welche Integrationen konfiguriert sind.
// So kann jede Kachel im Dashboard sauber zwischen "live", "nicht
// konfiguriert" und "Fehler" unterscheiden, statt stillschweigend
// mit Fake-Daten zu arbeiten.

export const integrationStatus = {
  notion: {
    schule: Boolean(process.env.NOTION_TOKEN && process.env.NOTION_DB_SCHULE),
    projekte: Boolean(process.env.NOTION_TOKEN && process.env.NOTION_DB_PROJEKTE),
    depot: Boolean(process.env.NOTION_TOKEN && process.env.NOTION_DB_DEPOT),
  },
  elevenlabs: Boolean(process.env.ELEVENLABS_API_KEY),
  gmail: Boolean(
    process.env.GMAIL_CLIENT_ID &&
      process.env.GMAIL_CLIENT_SECRET &&
      process.env.GMAIL_REFRESH_TOKEN
  ),
  browserMcp: Boolean(process.env.MCP_BROWSER_ENDPOINT),
};

export function abiturStartDate(): string | null {
  return process.env.ABITUR_START_DATE || null;
}

export const BRIEFING_INGEST_TOKEN = process.env.BRIEFING_INGEST_TOKEN || "";
