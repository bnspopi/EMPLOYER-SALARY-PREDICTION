"use client";
import { motion } from "framer-motion";
import { cn, clamp } from "@/lib/utils";

type Tone = "cyan" | "gold" | "ember" | "green" | "red";
const TONE_VAR: Record<Tone, string> = {
  cyan: "var(--color-cyan)",
  gold: "var(--color-gold)",
  ember: "var(--color-ember)",
  green: "var(--color-green)",
  red: "var(--color-red)",
};

/** Robot-HUD style stat row: label · value · thin glowing bar. */
export function StatBar({
  label,
  value,
  pct,
  tone = "cyan",
  className,
  hint,
}: {
  label: string;
  value: string;
  /** 0-100 fill */
  pct: number;
  tone?: Tone;
  className?: string;
  hint?: string;
}) {
  const width = clamp(pct, 0, 100);
  const color = TONE_VAR[tone];
  return (
    <div className={cn("min-w-0", className)} role="group" aria-label={`${label}: ${value}`}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="mono-caps truncate text-muted">{label}</span>
        <span className="shrink-0 text-sm font-semibold tabular-nums text-fg">{value}</span>
      </div>
      <div className="stat-bar rounded-full">
        <motion.span
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{ background: color, boxShadow: `0 0 12px ${color}` }}
        />
      </div>
      {hint ? <div className="mt-1 text-[11px] text-dim">{hint}</div> : null}
    </div>
  );
}
