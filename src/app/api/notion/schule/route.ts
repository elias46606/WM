import { fetchSchuleTermine } from "@/lib/notion/schule";
import { withEnvelope } from "@/lib/apiEnvelope";
import { integrationStatus } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  return withEnvelope(integrationStatus.notion.schule, fetchSchuleTermine, []);
}
