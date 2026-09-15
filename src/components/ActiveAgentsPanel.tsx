"use client";

import { Panel, PanelHeader } from "./hud/Panel";
import { StatusBadge, type StatusLevel } from "./hud/StatusBadge";
import { usePolling } from "@/lib/hooks/usePolling";
import type { AgentState } from "@/lib/agents/types";

type AgentRow = {
  id: string;
  name: string;
  role: string;
  state: AgentState;
  detail: string;
};

const EMPTY: { agents: AgentRow[] } = { agents: [] };

const STATE_TO_BADGE: Record<AgentState, StatusLevel> = {
  online: "online",
  warn: "warn",
  offline: "offline",
  idle: "idle",
};

export function ActiveAgentsPanel() {
  const { data } = usePolling("/api/agents", 30_000, EMPTY);

  return (
    <Panel className="flex h-full flex-col">
      <PanelHeader title="Active Agents" subtitle="Sub-Agent-Architektur" />
      <ul className="flex-1 space-y-2.5 overflow-y-auto">
        {data.agents.map((agent) => (
          <li key={agent.id} className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-xs font-medium text-white/90">{agent.name}</div>
              <div className="text-[10px] uppercase tracking-wider text-cyan-glow/40">
                {agent.role}
              </div>
              <div className="mt-0.5 text-[10px] text-white/40">{agent.detail}</div>
            </div>
            <StatusBadge level={STATE_TO_BADGE[agent.state]} />
          </li>
        ))}
      </ul>
    </Panel>
  );
}
