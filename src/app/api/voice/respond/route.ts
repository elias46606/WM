import { NextRequest, NextResponse } from "next/server";
import { respond } from "@/lib/assistant/respond";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { transcript } = await req.json().catch(() => ({ transcript: "" }));
  if (!transcript || typeof transcript !== "string") {
    return NextResponse.json({ error: "transcript fehlt." }, { status: 400 });
  }
  try {
    const text = await respond(transcript);
    return NextResponse.json({ text });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Antwort-Fehler" },
      { status: 500 }
    );
  }
}
