"use client";

import { Panel, PanelHeader } from "./hud/Panel";
import { StatusBadge } from "./hud/StatusBadge";
import { usePolling } from "@/lib/hooks/usePolling";
import type { EmailPreview } from "@/lib/gmail";
import type { ApiEnvelope } from "@/types/notion";

const EMPTY: ApiEnvelope<EmailPreview[]> = {
  state: "not_configured",
  data: [],
  fetchedAt: "",
};

function fromName(from: string): string {
  const match = from.match(/^"?([^"<]+)"?\s*</);
  return (match ? match[1] : from).trim();
}

export function EmailPanel() {
  const { data: envelope } = usePolling("/api/email", 90_000, EMPTY);
  const unreadCount = envelope.data.filter((e) => e.unread).length;

  return (
    <Panel className="flex h-full flex-col">
      <PanelHeader
        title="Posteingang"
        subtitle="Gmail"
        right={
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <span className="rounded-sm border border-cyan-glow/40 px-1.5 py-0.5 text-[9px] font-bold text-cyan-glow">
                {unreadCount} NEU
              </span>
            )}
            <StatusBadge
              level={
                envelope.state === "live"
                  ? "online"
                  : envelope.state === "error"
                    ? "offline"
                    : "idle"
              }
            />
          </div>
        }
      />
      {envelope.state === "not_configured" && (
        <p className="text-xs text-cyan-glow/40">
          Gmail nicht konfiguriert (GMAIL_CLIENT_ID / SECRET / REFRESH_TOKEN).
        </p>
      )}
      {envelope.state === "error" && (
        <p className="text-xs text-red-alert/80">{envelope.error}</p>
      )}
      {envelope.state === "live" && envelope.data.length === 0 && (
        <p className="text-xs text-cyan-glow/40">Posteingang aufgeräumt.</p>
      )}
      <ul className="flex-1 space-y-2 overflow-y-auto">
        {envelope.data.map((mail) => (
          <li
            key={mail.id}
            className="border-b border-cyan-glow/10 pb-2 last:border-0"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-xs font-medium text-white/90">
                {fromName(mail.from)}
              </span>
              {mail.important && (
                <span className="shrink-0 text-[9px] font-bold uppercase text-amber-warn">
                  Wichtig
                </span>
              )}
            </div>
            <div className="truncate text-[11px] text-cyan-glow/60">
              {mail.subject}
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
