"use client";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import type { OfferVerdict } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

const TONE = {
  below: {
    ring: "border-ember/40",
    glow: "shadow-[0_0_40px_rgba(255,90,46,0.18)]",
    text: "text-ember",
    chip: "bg-ember/15 text-ember border-ember/40",
    Icon: TrendingDown,
  },
  at: {
    ring: "border-cyan/40",
    glow: "shadow-[0_0_40px_rgba(74,217,255,0.16)]",
    text: "text-cyan",
    chip: "bg-cyan/15 text-cyan border-cyan/40",
    Icon: Minus,
  },
  above: {
    ring: "border-green/40",
    glow: "shadow-[0_0_40px_rgba(74,200,120,0.18)]",
    text: "text-green",
    chip: "bg-green/15 text-green border-green/40",
    Icon: TrendingUp,
  },
} as const;

/** Color-coded verdict headline: "Below market · 12% under median". */
export function VerdictBanner({ verdict: v }: { verdict: OfferVerdict }) {
  const tone = TONE[v.verdict];
  const { Icon } = tone;
  const money = (n: number) => formatMoney(n, v.currency);
  return (
    <div className={cn("panel grid-bg relative overflow-hidden rounded-xl2 border p-6 md:p-7", tone.ring, tone.glow)}>
      <div className="vignette pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className={cn("mono-caps inline-flex items-center gap-2 rounded-sm border px-2.5 py-1", tone.chip)}>
            <Icon className="h-3.5 w-3.5" aria-hidden />
            {v.verdict === "below" ? "Below market" : v.verdict === "above" ? "Above market" : "At market"}
          </div>
          <h2 className={cn("display mt-3 text-3xl md:text-4xl", tone.text)}>{v.verdictLabel}</h2>
          <p className="mt-2 text-sm text-muted">
            {v.notes[0]}
          </p>
        </div>
        <div className="grid shrink-0 grid-cols-3 gap-4 md:gap-6">
          <Fig label="Your base" value={money(v.offer.base)} />
          <Fig label="Market median" value={money(v.median)} tone="cyan" />
          <Fig label="Percentile" value={`${v.percentile}th`} tone={v.verdict === "above" ? "green" : v.verdict === "below" ? "ember" : "cyan"} />
        </div>
      </div>
    </div>
  );
}

function Fig({ label, value, tone = "fg" }: { label: string; value: string; tone?: "fg" | "cyan" | "green" | "ember" }) {
  const t = { fg: "text-fg", cyan: "text-cyan", green: "text-green", ember: "text-ember" }[tone];
  return (
    <div className="text-right">
      <div className="mono-caps text-muted">{label}</div>
      <div className={cn("mt-1 text-xl font-semibold tabular-nums md:text-2xl", t)}>{value}</div>
    </div>
  );
}
