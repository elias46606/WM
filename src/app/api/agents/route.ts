import { NextResponse } from "next/server";
import { agentRegistry } from "@/lib/agents/registry";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const agents = await Promise.all(
    agentRegistry.map(async (agent) => {
      const status = await agent.describeStatus();
      return {
        id: agent.id,
        name: agent.name,
        role: agent.role,
        ...status,
      };
    })
  );
  return NextResponse.json({ agents });
}
