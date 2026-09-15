import { NextRequest, NextResponse } from "next/server";
import { getBrowserAgent } from "@/lib/mcp/browser";
import { integrationStatus } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!integrationStatus.browserMcp) {
    return NextResponse.json(
      { error: "MCP_BROWSER_ENDPOINT nicht konfiguriert (Grundgerüst, noch nicht aktiv)." },
      { status: 501 }
    );
  }
  const { query } = await req.json().catch(() => ({ query: "" }));
  try {
    const results = await getBrowserAgent().search(query);
    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Suche fehlgeschlagen" },
      { status: 502 }
    );
  }
}
