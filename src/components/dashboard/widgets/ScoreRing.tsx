"use client";
import { motion } from "framer-motion";
import { cn, clamp } from "@/lib/utils";

/** Resume score ring (0-100). Colour shifts red → amber → cyan → green with the score. */
export function ScoreRing({ score, size = 132, stroke = 9, label = "Resume score", className }: { score: number; size?: number; stroke?: number; label?: string; className?: string }) {
  const s = clamp(Math.round(score), 0, 100);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = s >= 80 ? "var(--color-green)" : s >= 60 ? "var(--color-cyan)" : s >= 40 ? "var(--color-amber)" : "var(--color-red)";
  return (
    <div className={cn("relative inline-grid place-items-center", className)} style={{ width: size, height: size }} role="img" aria-label={`${label}: ${s} out of 100`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-line-2)" strokeWidth={stroke} />
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
          animate={{ strokeDashoffset: c - (c * s) / 100 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center leading-none">
          <div className="display tabular-nums" style={{ fontSize: size * 0.34 }}>
            {s}
          </div>
          <div className="mono-caps mt-1 text-dim" style={{ fontSize: Math.max(8, size * 0.07) }}>
            / 100
          </div>
        </div>
      </div>
    </div>
  );
}
