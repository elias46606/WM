import { NextRequest, NextResponse } from "next/server";
import { speechToText } from "@/lib/elevenlabs";
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
  const form = await req.formData().catch(() => null);
  const audio = form?.get("audio");
  if (!audio || !(audio instanceof Blob)) {
    return NextResponse.json({ error: "audio fehlt." }, { status: 400 });
  }

  try {
    const transcript = await speechToText(audio);
    return NextResponse.json({ transcript });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "STT-Fehler" },
      { status: 502 }
    );
  }
}
