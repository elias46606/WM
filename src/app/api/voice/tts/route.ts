import { NextRequest, NextResponse } from "next/server";
import { textToSpeech } from "@/lib/elevenlabs";
import { integrationStatus } from "@/lib/config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!integrationStatus.elevenlabs) {
    return NextResponse.json(
      { error: "ELEVENLABS_API_KEY nicht konfiguriert." },
      { status: 501 }
    );
  }
  const { text } = await req.json().catch(() => ({ text: "" }));
  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "text fehlt." }, { status: 400 });
  }

  try {
    const upstream = await textToSpeech(text);
    return new NextResponse(upstream.body, {
      headers: { "Content-Type": "audio/mpeg" },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "TTS-Fehler" },
      { status: 502 }
    );
  }
}
