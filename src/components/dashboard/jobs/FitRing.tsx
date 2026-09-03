"use client";
import { motion } from "framer-motion";
import { cn, clamp } from "@/lib/utils";

/** Circular fit-score ring (e.g. 94%). Colour climbs red → amber → cyan → green with the score. */
export function FitRing({
  score,
  size = 64,
  stroke = 6,
  label = "Fit",
  className,
  animate = true,
}: {
  score: number;
  size?: number;
  stroke?: number;
  label?: string;
  className?: string;
  animate?: boolean;
}) {
  const s = clamp(Math.round(score), 0, 100);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = s >= 85 ? "var(--color-green)" : s >= 70 ? "var(--color-cyan)" : s >= 50 ? "var(--color-gold)" : "var(--color-amber)";
  const offset = c - (c * s) / 100;
  return (
    <div
      className={cn("relative inline-grid shrink-0 place-items-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label}: ${s} percent`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-line-2)" strokeWidth={stroke} />
        {animate ? (
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        ) : (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        )}
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="display tabular-nums leading-none" style={{ fontSize: size * 0.32, color }}>
          {s}
        </div>
      </div>
    </div>
  );
}
