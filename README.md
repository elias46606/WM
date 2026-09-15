# JARVIS — Personal Command Center

Dein persönliches Command-Center für Schule (Abi-Vorbereitung Q2),
Nebenprojekte und Finanzen. Dunkles Sci-Fi-HUD, live verbunden mit
Notion, Gmail und ElevenLabs.

![Status](https://img.shields.io/badge/status-MVP-00e5ff)

## Stack & Architektur

Bewusst simpel gehalten, damit du selbst weiterbauen kannst:

- **Next.js 15 (App Router) + TypeScript + Tailwind** — Frontend *und*
  Backend in einem Projekt. Die API-Routen unter `src/app/api/*`
  sind dein "kleines Backend": jede macht genau eine Sache (Notion
  lesen, ElevenLabs aufrufen, Gmail abfragen, …) und liefert JSON an
  das Dashboard.
- **Kein State-Management-Framework, kein DB-Server.** Das Dashboard
  pollt die API-Routen per `usePolling`-Hook (`src/lib/hooks/usePolling.ts`).
  Die API-Routen fragen bei jedem Aufruf live bei Notion/Gmail an —
  kein Snapshot, keine Caching-Schicht, die veralten könnte. Einzige
  Ausnahme: das Daily Briefing wird als kleine JSON-Datei unter
  `data/briefing.json` zwischengespeichert (siehe unten), weil es von
  außen "reingeschoben" wird statt live abgefragt zu werden.
- **Agenten-Architektur** (`src/lib/agents/`): jeder Agent
  implementiert ein einfaches Interface (`describeStatus()`, optional
  `run()`). Neue Agenten = neue Datei + Eintrag in `registry.ts`. Das
  "Active Agents"-Panel kennt die Agenten nicht einzeln, sondern liest
  nur die Registry.

Warum kein Zustand/Redux, keine DB, kein Auth-System? Es ist ein
Single-User-Tool nur für dich — jede zusätzliche Schicht wäre nur
Wartungsaufwand ohne Nutzen. Wenn das mal wächst (mehrere Nutzer,
persistente Historie), ist das der Punkt, an dem sich z.B. Postgres +
NextAuth lohnt.

### Verzeichnisstruktur

```
src/
  app/
    page.tsx              Dashboard (Startbildschirm)
    layout.tsx             Grundgerüst, Fonts, Theme
    globals.css             HUD-Design-System (Farben, Panel-Stile, Animationen)
    api/
      notion/{schule,projekte,depot}/route.ts   Live-Notion-Anbindung
      countdown/route.ts                          Abi-Countdown
      briefing/route.ts                            Daily-Briefing In-/Output
      email/route.ts                               Gmail-Kachel
      voice/{tts,stt,respond}/route.ts             Sprachsteuerung
      agents/route.ts                              Sub-Agents-Status
      browser/search/route.ts                       Browser/MCP-Grundgerüst
      system/status/route.ts                        Welche Integrationen sind konfiguriert?
  components/               Dashboard-Kacheln (Panels)
  components/hud/            Wiederverwendbare HUD-Bausteine (Panel, StatusBadge)
  lib/
    notion/                  Notion-Client + robuste Property-Parser
    gmail.ts                  Gmail-Client (OAuth2)
    elevenlabs.ts              TTS/STT-Client
    assistant/respond.ts       Regelbasierter Sprach-Responder (Erweiterungspunkt für LLM)
    agents/                    Sub-Agent-Interface + Registry
    mcp/browser.ts              Browser/MCP-Platzhalter
    config.ts                   Zentrale Feature-Flags (was ist konfiguriert?)
  types/notion.ts             Gemeinsame Typen fürs Dashboard
data/                        Laufzeit-Daten (Briefing-JSON), nicht eingecheckt
```

## Setup

```bash
npm install
cp .env.example .env.local   # dann Keys eintragen, siehe unten
npm run dev                  # http://localhost:3000
```

Ohne jegliche Keys läuft das Dashboard trotzdem — jede Kachel zeigt
dann ehrlich "nicht konfiguriert" (grauer INAKTIV-Badge) statt Fake-
Daten. So kannst du Integration für Integration nachrüsten.

### Notion

1. Integration erstellen: https://www.notion.so/my-integrations →
   "New integration" → Token kopieren → `NOTION_TOKEN` in
   `.env.local`.
2. **Wichtig:** Die Integration muss in **jeder** der drei
   Datenbanken (Schule, Projekte, Depot-Verlauf) über die
   "•••"-Menü → "Connections" → deine Integration manuell freigegeben
   werden. Sonst liefert die API 404, obwohl der Token stimmt.
3. Datenbank-ID aus der URL kopieren (der 32-stellige Hex-String nach
   dem Workspace-Namen, vor dem `?v=`) → `NOTION_DB_SCHULE`,
   `NOTION_DB_PROJEKTE`, `NOTION_DB_DEPOT`.

**Erwartete Felder** (der Parser sucht case-insensitiv nach mehreren
Namensvarianten, siehe `src/lib/notion/properties.ts` — bei Bedarf
dort die Kandidatenlisten erweitern):

| Datenbank | erwartete Property-Namen (eine Variante reicht) |
|---|---|
| Schule | `Name`/`Titel` (Title), `Datum` (Date), `Fach` (Select), `Typ` (Select), `Erledigt` (Checkbox) |
| Projekte | `Name` (Title), `Status` (Select/Status), `Fortschritt` (Number, 0–100 oder 0–1), `Deadline` (Date) |
| Depot-Verlauf | `Name`/`Datum` (Title/Date), `Gesamtwert`/`Wert` (Number), `Veränderung`/`Rendite` (Number) |

Für den Abi-Countdown: entweder `ABITUR_START_DATE=YYYY-MM-DD` in
`.env.local` setzen, oder einen Termin mit "Abitur" im Titel/Typ in
die Schule-Datenbank eintragen — Jarvis findet ihn automatisch.

### ElevenLabs (Sprachsteuerung)

1. API-Key aus deinem ElevenLabs-Account → `ELEVENLABS_API_KEY`.
2. Eigene Stimme: im Free-Plan blockt ElevenLabs den API-Zugriff auf
   Voice-Library-Stimmen ("Free users cannot use library voices via
   the API"). Eine Stimme in ElevenLabs unter "Voice Library" →
   "Add to my voices" hinzufügen, dann deren ID aus "My Voices" in
   `ELEVENLABS_VOICE_ID` eintragen. Schlägt der ElevenLabs-Call
   trotzdem fehl (z.B. weiterhin Free-Plan-Limit), springt die App
   automatisch auf die Sprachausgabe des Browsers/iPads um
   (`window.speechSynthesis`, kostenlos, kein Setup nötig) — Voice
   Input über ElevenLabs Scribe läuft davon unabhängig weiter.
3. Tap-to-speak nutzt `MediaRecorder` (Mikrofon-Zugriff im Browser,
   funktioniert auch auf iPad Safari) → ElevenLabs Scribe (Speech-to-
   Text) → `src/lib/assistant/respond.ts` → ElevenLabs TTS (mit
   Browser-Fallback).
4. **Echte Konversation:** setze zusätzlich `ANTHROPIC_API_KEY`
   (Key aus https://console.anthropic.com/settings/keys) — dann
   beantwortet Claude jede Anfrage frei, mit den Live-Dashboard-Daten
   (Countdown, Termine, Projekte, Depot) als Kontext im System-Prompt.
   Ohne den Key bleibt die einfache Regel-Logik aktiv (nur die vier
   Themen oben), kostet aber nichts extra.

### Gmail

1. In der Google Cloud Console ein OAuth2-Client (Typ "Desktop" oder
   "Web") anlegen, Gmail-API aktivieren.
2. Einmalig einen Refresh-Token erzeugen (z.B. über den
   [OAuth 2.0 Playground](https://developers.google.com/oauthplayground)
   mit Scope `https://www.googleapis.com/auth/gmail.readonly`).
3. `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN` in
   `.env.local` eintragen.

### Daily Briefing

Die Kachel zeigt an, was zuletzt per `POST /api/briefing` reinkam.
Dein bestehender Cowork Scheduled Task kann das täglich pushen:

```bash
curl -X POST https://<deine-domain>/api/briefing \
  -H "x-briefing-token: $BRIEFING_INGEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"summary": "Kurze Zusammenfassung…", "items": ["Punkt 1", "Punkt 2"]}'
```

`BRIEFING_INGEST_TOKEN` selbst frei wählen und sowohl in
`.env.local` als auch im Scheduled Task hinterlegen. Ohne aktuelles
Briefing (älter als heute oder noch nie empfangen) zeigt die Kachel
das ehrlich an, statt etwas zu erfinden.

### Browser/MCP & Sub-Agents (Grundgerüst)

- `src/lib/mcp/browser.ts` definiert die Schnittstelle für
  eigenständige Websuche/Browser-Aktionen. Aktuell ein Platzhalter —
  sobald ein MCP-Browser-Server läuft, `MCP_BROWSER_ENDPOINT` setzen
  und in `getBrowserAgent()` einen echten MCP-Client (z.B.
  `@modelcontextprotocol/sdk`) einhängen.
- `src/lib/agents/` enthält die Sub-Agent-Architektur. Aktuell aktiv:
  **Notion-Sync-Agent** (meldet Sync-Status) und **Briefing-Agent**
  (meldet, ob das heutige Briefing da ist) — beide echt, kein Fake.
  **Research-Agent** ist an das Browser-MCP-Grundgerüst angebunden
  und wird aktiv, sobald `MCP_BROWSER_ENDPOINT` konfiguriert ist.
  **Task-Agent** und **Coding-Agent** sind bewusst als ehrliche
  Platzhalter angelegt (Status "idle"), damit die Architektur für
  mehrere spezialisierte Agenten von Anfang an sichtbar ist — neue
  Logik kommt in einer späteren Ausbaustufe.

## Später (bewusst noch nicht gebaut)

- Buffer-Integration (Social-Media-Scheduling)
- Meta-Anbindung

Für beides gibt es noch keinen Code-Stub, weil die Anforderungen noch
nicht klar sind — aber die Architektur (eigene `lib/`-Datei + eigene
API-Route + eigene Dashboard-Kachel, nach demselben Muster wie
Gmail/Notion) ist darauf ausgelegt, das später ohne Umbau zu
ergänzen.

## Deployment

Jedes Next.js-Hosting funktioniert (Vercel, eigener Server via
`npm run build && npm start`, Docker). Wichtig: die
Voice-/Briefing-/Email-Routen laufen im Node.js-Runtime (nicht Edge),
das ist in den jeweiligen `route.ts`-Dateien mit
`export const runtime = "nodejs"` markiert.

Auf iPad: einfach die URL im Safari öffnen, "Zum Home-Bildschirm"
hinzufügen — läuft dank responsivem Grid und Safe-Area-Handling wie
eine App.
