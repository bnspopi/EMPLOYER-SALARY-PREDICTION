"use client";
import { motion } from "framer-motion";
import { cn, clamp } from "@/lib/utils";
import { ordinal } from "@/lib/format";

/**
 * Percentile gauge — a 180° SVG arc. `percentile` 0-100 maps left → right.
 * Reads as "where you sit in your market"; the label is the human phrase (e.g. "Top 25%").
 */
export function Gauge({
  percentile,
  label,
  caption = "of professionals in your market earn less",
  size = 260,
  className,
}: {
  percentile: number;
  label: string;
  caption?: string;
  size?: number;
  className?: string;
}) {
  const pct = clamp(Math.round(percentile), 0, 100);
  const r = 82;
  const cx = 100;
  const cy = 104;
  const angle = Math.PI - (Math.PI * pct) / 100;
  const dotX = cx + r * Math.cos(angle);
  const dotY = cy - r * Math.sin(angle);
  const ticks = [0, 25, 50, 75, 100];
  const gradientId = "paylens-gauge-grad";
  return (
    <div className={cn("flex flex-col items-center", className)} role="img" aria-label={`${ordinal(pct)} percentile — ${label}`}>
      <svg viewBox="0 0 200 124" width={size} height={(size * 124) / 200} className="max-w-full overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1fb6e0" />
            <stop offset="60%" stopColor="#4ad9ff" />
            <stop offset="100%" stopColor="#d9b45a" />
          </linearGradient>
        </defs>
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="var(--color-line-2)" strokeWidth="10" strokeLinecap="round" />
        <motion.path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="10"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray="100"
          initial={{ strokeDashoffset: 100 }}
          animate={{ strokeDashoffset: 100 - pct }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: "drop-shadow(0 0 8px rgba(74,217,255,0.45))" }}
        />
        {ticks.map((t) => {
          const a = Math.PI - (Math.PI * t) / 100;
          const x1 = cx + (r + 11) * Math.cos(a);
          const y1 = cy - (r + 11) * Math.sin(a);
          const x2 = cx + (r + 15) * Math.cos(a);
          const y2 = cy - (r + 15) * Math.sin(a);
          return <line key={t} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--color-dim)" strokeWidth="1" />;
        })}
        <motion.circle
          cx={dotX}
          cy={dotY}
          r={5.5}
          fill="var(--color-bg)"
          stroke="var(--color-cyan)"
          strokeWidth="3"
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9, duration: 0.4 }}
          style={{ filter: "drop-shadow(0 0 10px rgba(74,217,255,0.8))", transformOrigin: `${dotX}px ${dotY}px` }}
        />
        <text x={cx} y={cy - 22} textAnchor="middle" className="fill-fg" style={{ fontFamily: "var(--font-display)", fontSize: 44, letterSpacing: "0.02em" }}>
          {label}
        </text>
        <text x={cx} y={cy - 2} textAnchor="middle" fill="var(--color-muted)" style={{ fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase" }}>
          {ordinal(pct)} percentile
        </text>
        <text x={cx - r} y={cy + 16} textAnchor="middle" fill="var(--color-dim)" style={{ fontSize: 8, letterSpacing: "0.14em" }}>
          P0
        </text>
        <text x={cx + r} y={cy + 16} textAnchor="middle" fill="var(--color-dim)" style={{ fontSize: 8, letterSpacing: "0.14em" }}>
          P100
        </text>
      </svg>
      {caption ? (
        <p className="mt-1 max-w-[260px] text-center text-xs text-muted">
          <span className="font-semibold tabular-nums text-fg">{pct}%</span> {caption}
        </p>
      ) : null}
    </div>
  );
}
