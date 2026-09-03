"use client";
import { motion } from "framer-motion";
import { formatMoney } from "@/lib/format";
import type { Currency } from "@/lib/types";
import { cn, clamp } from "@/lib/utils";

export interface RangeMarker {
  value: number;
  label: string;
  tone?: "ember" | "gold" | "green" | "cyan";
}

/**
 * Floor / median / ceiling salary range. Optional extra marker (e.g. "Your offer").
 * `medianHidden` renders the median position without its value (Curious plan).
 */
export function RangeBar({
  floor,
  median,
  ceiling,
  currency,
  medianHidden = false,
  marker,
  compact = false,
  className,
}: {
  floor: number;
  median: number;
  ceiling: number;
  currency: Currency;
  medianHidden?: boolean;
  marker?: RangeMarker;
  compact?: boolean;
  className?: string;
}) {
  const span = Math.max(1, ceiling - floor);
  const pos = (v: number) => clamp(((v - floor) / span) * 100, 0, 100);
  const medianPos = pos(median);
  const money = (v: number) => formatMoney(v, currency, { compact });
  const markerTone = marker?.tone ?? "ember";
  const markerColor = { ember: "var(--color-ember)", gold: "var(--color-gold)", green: "var(--color-green)", cyan: "var(--color-cyan)" }[markerTone];
  const clampLabel = (p: number) => (p < 12 ? "left-0 translate-x-0 items-start text-left" : p > 88 ? "right-0 translate-x-0 items-end text-right" : "-translate-x-1/2 items-center text-center");
  const markerPos = marker ? pos(marker.value) : 0;
  return (
    <div className={cn("w-full", className)} role="group" aria-label={`Salary range: floor ${money(floor)}, ${medianHidden ? "median hidden" : `median ${money(median)}`}, ceiling ${money(ceiling)}`}>
      {marker ? (
        <div className="relative mb-1 h-9">
          <div className={cn("absolute top-0 flex flex-col", clampLabel(markerPos))} style={{ left: markerPos < 12 ? 0 : markerPos > 88 ? undefined : `${markerPos}%`, right: markerPos > 88 ? 0 : undefined }}>
            <span className="mono-caps" style={{ color: markerColor }}>
              {marker.label}
            </span>
            <span className="text-sm font-semibold tabular-nums text-fg">{money(marker.value)}</span>
          </div>
        </div>
      ) : null}
      <div className="relative h-3">
        <div className="absolute inset-y-0 left-0 right-0 rounded-full bg-line-2/70" />
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          style={{ background: "linear-gradient(90deg, rgba(74,217,255,0.25), rgba(74,217,255,0.9) 50%, rgba(217,180,90,0.9))", boxShadow: "0 0 18px rgba(74,217,255,0.35)" }}
        />
        <div className="absolute top-1/2 h-5 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg shadow-[0_0_10px_rgba(255,255,255,0.6)]" style={{ left: `${medianPos}%` }} aria-hidden />
        {marker ? (
          <div className="absolute top-1/2 h-7 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ left: `${markerPos}%`, background: markerColor, boxShadow: `0 0 12px ${markerColor}` }} aria-hidden />
        ) : null}
      </div>
      <div className="relative mt-3 h-12">
        <div className="absolute left-0 top-0 flex flex-col">
          <span className="mono-caps text-muted">Floor · P25</span>
          <span className="text-base font-semibold tabular-nums text-fg">{money(floor)}</span>
        </div>
        <div className={cn("absolute top-0 flex flex-col", clampLabel(medianPos))} style={{ left: medianPos < 12 ? 0 : medianPos > 88 ? undefined : `${medianPos}%`, right: medianPos > 88 ? 0 : undefined }}>
          <span className="mono-caps text-cyan">Median</span>
          {medianHidden ? (
            <span className="text-sm font-medium text-dim" title="Upgrade to Explorer to see the exact median">
              Hidden on Curious
            </span>
          ) : (
            <span className="text-base font-semibold tabular-nums text-fg">{money(median)}</span>
          )}
        </div>
        <div className="absolute right-0 top-0 flex flex-col items-end text-right">
          <span className="mono-caps text-muted">Ceiling · P75</span>
          <span className="text-base font-semibold tabular-nums text-fg">{money(ceiling)}</span>
        </div>
      </div>
    </div>
  );
}
