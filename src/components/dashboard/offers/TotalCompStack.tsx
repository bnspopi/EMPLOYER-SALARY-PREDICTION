"use client";
import { motion } from "framer-motion";
import type { OfferVerdict } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

const PARTS = [
  { key: "base", label: "Base", color: "var(--color-cyan)" },
  { key: "bonus", label: "Bonus", color: "var(--color-gold)" },
  { key: "equity", label: "Equity", color: "var(--color-green)" },
  { key: "signOn", label: "Sign-on", color: "var(--color-ember)" },
] as const;

/**
 * Stacked total-comp bar (base/bonus/equity/sign-on) compared against the
 * market total-comp bar, scaled to whichever is larger.
 */
export function TotalCompStack({ verdict: v }: { verdict: OfferVerdict }) {
  const money = (n: number) => formatMoney(n, v.currency);
  const segments = PARTS.map((p) => ({ ...p, value: v.offer[p.key] ?? 0 })).filter((s) => s.value > 0);
  const max = Math.max(v.totalComp, v.marketTotalComp, 1);
  const delta = v.totalComp - v.marketTotalComp;

  return (
    <div className="space-y-6">
      {/* Your total comp — stacked */}
      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <span className="mono-caps text-muted">Your total compensation</span>
          <span className="text-lg font-semibold tabular-nums text-fg">{money(v.totalComp)}</span>
        </div>
        <div className="flex h-6 w-full overflow-hidden rounded-full bg-line-2/60">
          {segments.map((s, i) => (
            <motion.div
              key={s.key}
              className="h-full"
              initial={{ width: 0 }}
              animate={{ width: `${(s.value / max) * 100}%` }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
              style={{ background: s.color }}
              title={`${s.label}: ${money(s.value)}`}
            />
          ))}
        </div>
      </div>

      {/* Market total comp */}
      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <span className="mono-caps text-muted">Market total compensation</span>
          <span className="text-lg font-semibold tabular-nums text-cyan">{money(v.marketTotalComp)}</span>
        </div>
        <div className="h-6 w-full overflow-hidden rounded-full bg-line-2/60">
          <motion.div
            className="h-full"
            initial={{ width: 0 }}
            animate={{ width: `${(v.marketTotalComp / max) * 100}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ background: "linear-gradient(90deg, rgba(74,217,255,0.35), rgba(74,217,255,0.75))" }}
          />
        </div>
      </div>

      {/* Legend + delta */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {segments.map((s) => (
            <li key={s.key} className="flex items-center gap-2 text-xs text-muted">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} aria-hidden />
              {s.label} <span className="tabular-nums text-fg">{money(s.value)}</span>
            </li>
          ))}
        </ul>
        <span
          className={cn(
            "rounded-sm border px-2 py-1 text-xs font-semibold tabular-nums",
            delta >= 0 ? "border-green/40 bg-green/10 text-green" : "border-ember/40 bg-ember/10 text-ember",
          )}
        >
          {delta >= 0 ? "+" : "−"}
          {money(Math.abs(delta))} vs market
        </span>
      </div>
    </div>
  );
}
