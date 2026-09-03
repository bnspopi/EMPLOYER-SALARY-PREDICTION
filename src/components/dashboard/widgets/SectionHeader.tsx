import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Header for a dashboard report section: eyebrow · title · optional description · optional right-side action. */
export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  as: Tag = "h2",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  as?: "h2" | "h3";
  className?: string;
}) {
  return (
    <div className={cn("mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between", className)}>
      <div className="min-w-0">
        {eyebrow ? <div className="eyebrow mb-1.5">{eyebrow}</div> : null}
        <Tag className={cn("display", Tag === "h2" ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl")}>{title}</Tag>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{description}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div> : null}
    </div>
  );
}

/** Small stat tile used in quick-stat rows. */
export function StatTile({ label, value, sub, tone = "fg", className }: { label: string; value: ReactNode; sub?: ReactNode; tone?: "fg" | "cyan" | "gold" | "green" | "ember"; className?: string }) {
  const t = { fg: "text-fg", cyan: "text-cyan", gold: "text-gold", green: "text-green", ember: "text-ember" }[tone];
  return (
    <div className={cn("panel rounded-xl2 p-4 md:p-5", className)}>
      <div className="mono-caps text-muted">{label}</div>
      <div className={cn("display mt-2 text-3xl tabular-nums md:text-4xl", t)}>{value}</div>
      {sub ? <div className="mt-1.5 text-xs text-dim">{sub}</div> : null}
    </div>
  );
}
