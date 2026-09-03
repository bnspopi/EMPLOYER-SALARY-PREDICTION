import { formatMoney } from "@/lib/format";
import type { Currency } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface RangeRow {
  label: string;
  min: number;
  max: number;
}

export function rangeScale(rows: RangeRow[]): { min: number; max: number } {
  if (!rows.length) return { min: 0, max: 1 };
  const lo = Math.min(...rows.map((r) => r.min));
  const hi = Math.max(...rows.map((r) => r.max));
  const pad = Math.max((hi - lo) * 0.12, hi * 0.04);
  return { min: Math.max(0, lo - pad), max: hi + pad };
}

const ACCENT = {
  cyan: "bg-cyan shadow-[0_0_14px_rgba(74,217,255,0.45)]",
  gold: "bg-gold shadow-[0_0_14px_rgba(217,180,90,0.45)]",
  ember: "bg-ember shadow-[0_0_14px_rgba(255,90,46,0.45)]",
};

/** Horizontal min–max band bars on a shared scale (pure markup, prints cleanly). */
export function RangeBars({
  rows,
  currency = "USD",
  accent = "cyan",
  scale,
  highlight,
  className,
  labelWidth = "w-28",
  emptyText = "No band data available.",
}: {
  rows: RangeRow[];
  currency?: Currency;
  accent?: keyof typeof ACCENT;
  scale?: { min: number; max: number };
  highlight?: string;
  className?: string;
  labelWidth?: string;
  emptyText?: string;
}) {
  if (!rows.length) return <p className={cn("text-sm text-dim", className)}>{emptyText}</p>;
  const s = scale ?? rangeScale(rows);
  const span = Math.max(1, s.max - s.min);
  return (
    <ul className={cn("space-y-3.5", className)}>
      {rows.map((r) => {
        const left = ((r.min - s.min) / span) * 100;
        const width = Math.max(1.5, ((r.max - r.min) / span) * 100);
        const hot = highlight && r.label.toLowerCase() === highlight.toLowerCase();
        return (
          <li key={r.label} className="grid grid-cols-[minmax(0,7rem)_1fr_auto] items-center gap-3 md:gap-4">
            <span className={cn("truncate text-sm", labelWidth, hot ? "font-semibold text-fg" : "text-muted")}>{r.label}</span>
            <div className="relative h-2.5 overflow-hidden rounded-full bg-line-2 print:bg-neutral-200" aria-hidden>
              <span className={cn("absolute inset-y-0 rounded-full", ACCENT[accent], hot && "brightness-110")} style={{ left: `${left}%`, width: `${width}%` }} />
            </div>
            <span className="mono-caps whitespace-nowrap text-[11px] text-fg tabular-nums">
              {formatMoney(r.min, currency, { compact: true })} – {formatMoney(r.max, currency, { compact: true })}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
