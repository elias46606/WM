import { NextResponse } from "next/server";
import { abiturStartDate, integrationStatus } from "@/lib/config";
import { fetchSchuleTermine } from "@/lib/notion/schule";

export const dynamic = "force-dynamic";

export async function GET() {
  const envDate = abiturStartDate();
  if (envDate) {
    return NextResponse.json({ targetDate: envDate, source: "env" });
  }

  if (integrationStatus.notion.schule) {
    try {
      const termine = await fetchSchuleTermine();
      const abiturTermin = termine.find(
        (t) =>
          t.datum &&
          (t.titel.toLowerCase().includes("abitur") ||
            t.typ.toLowerCase().includes("abitur"))
      );
      if (abiturTermin) {
        return NextResponse.json({
          targetDate: abiturTermin.datum,
          source: "notion",
        });
      }
    } catch {
      // fällt unten auf "none" zurück
    }
  }

  return NextResponse.json({ targetDate: null, source: "none" });
}
