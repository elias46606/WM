import { NextRequest, NextResponse } from "next/server";
import { readBriefing, writeBriefing } from "@/lib/briefingStore";
import { BRIEFING_INGEST_TOKEN } from "@/lib/config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const briefing = await readBriefing();
  if (!briefing) {
    return NextResponse.json({ state: "empty", briefing: null });
  }
  const today = new Date().toISOString().slice(0, 10);
  return NextResponse.json({
    state: briefing.date === today ? "current" : "stale",
    briefing,
  });
}

// Wird vom Cowork Scheduled Task (oder manuell) mit dem täglichen
// News-Briefing befüllt. Header "x-briefing-token" muss mit
// BRIEFING_INGEST_TOKEN aus .env.local übereinstimmen.
export async function POST(req: NextRequest) {
  if (!BRIEFING_INGEST_TOKEN) {
    return NextResponse.json(
      { error: "BRIEFING_INGEST_TOKEN ist auf dem Server nicht gesetzt." },
      { status: 500 }
    );
  }
  const token = req.headers.get("x-briefing-token");
  if (token !== BRIEFING_INGEST_TOKEN) {
    return NextResponse.json({ error: "Ungültiges Token." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body.summary !== "string") {
    return NextResponse.json(
      { error: "Body muss mindestens { summary: string } enthalten." },
      { status: 400 }
    );
  }

  await writeBriefing({
    date: body.date || new Date().toISOString().slice(0, 10),
    summary: body.summary,
    items: Array.isArray(body.items) ? body.items : [],
    source: body.source || "cowork-scheduled-task",
    receivedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
