import { ReactNode } from "react";
import clsx from "@/lib/clsx";

export function Panel({
  children,
  className,
  glow = false,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={clsx(
        "hud-panel relative rounded-sm p-4",
        glow && "shadow-glow",
        className
      )}
    >
      <span className="hud-corner hud-corner-tl" />
      <span className="hud-corner hud-corner-tr" />
      <span className="hud-corner hud-corner-bl" />
      <span className="hud-corner hud-corner-br" />
      {children}
    </div>
  );
}

export function PanelHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-start justify-between border-b border-cyan-glow/15 pb-2">
      <div>
        <h2 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-cyan-glow text-glow">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 text-[10px] uppercase tracking-widest text-cyan-glow/40">
            {subtitle}
          </p>
        )}
      </div>
      {right}
    </div>
  );
}
