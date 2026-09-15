import { NextResponse } from "next/server";
import type { ApiEnvelope } from "@/types/notion";

export async function withEnvelope<T>(
  configured: boolean,
  loader: () => Promise<T>,
  emptyValue: T
): Promise<NextResponse<ApiEnvelope<T>>> {
  if (!configured) {
    return NextResponse.json({
      state: "not_configured",
      data: emptyValue,
      fetchedAt: new Date().toISOString(),
    });
  }
  try {
    const data = await loader();
    return NextResponse.json({
      state: "live",
      data,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      {
        state: "error",
        data: emptyValue,
        error: err instanceof Error ? err.message : "Unbekannter Fehler",
        fetchedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}
