import { fetchImportantUnread } from "@/lib/gmail";
import { withEnvelope } from "@/lib/apiEnvelope";
import { integrationStatus } from "@/lib/config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return withEnvelope(integrationStatus.gmail, () => fetchImportantUnread(8), []);
}
