import clsx from "@/lib/clsx";

export type StatusLevel = "online" | "warn" | "offline" | "idle";

const STYLES: Record<StatusLevel, string> = {
  online: "bg-cyan-glow/15 text-cyan-glow border-cyan-glow/40",
  warn: "bg-amber-warn/10 text-amber-warn border-amber-warn/40",
  offline: "bg-red-alert/10 text-red-alert border-red-alert/40",
  idle: "bg-white/5 text-white/40 border-white/15",
};

const LABELS: Record<StatusLevel, string> = {
  online: "LIVE",
  warn: "WARNUNG",
  offline: "OFFLINE",
  idle: "INAKTIV",
};

export function StatusBadge({
  level,
  label,
}: {
  level: StatusLevel;
  label?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-sm border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest",
        STYLES[level]
      )}
    >
      <span
        className={clsx(
          "h-1.5 w-1.5 rounded-full",
          level === "online" && "animate-pulseGlow bg-cyan-glow",
          level === "warn" && "animate-pulseGlow bg-amber-warn",
          level === "offline" && "bg-red-alert",
          level === "idle" && "bg-white/40"
        )}
      />
      {label ?? LABELS[level]}
    </span>
  );
}
