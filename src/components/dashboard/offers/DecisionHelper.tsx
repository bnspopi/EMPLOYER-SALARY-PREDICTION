"use client";
import { useMemo, useState } from "react";
import { RotateCcw, Trophy } from "lucide-react";
import type { OfferVerdict } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  DECISION_META,
  DEFAULT_WEIGHTS,
  offerLabel,
  rescoreOffers,
  type DecisionKey,
  type DecisionWeights,
} from "./logic";

/**
 * Hunter: weighted sliders (comp / growth / remote / equity / stability) that
 * rescore and re-rank the user's saved offers live.
 */
export function DecisionHelper({ verdicts }: { verdicts: OfferVerdict[] }) {
  const [weights, setWeights] = useState<DecisionWeights>(DEFAULT_WEIGHTS);
  const ranked = useMemo(() => rescoreOffers(verdicts, weights), [verdicts, weights]);

  if (verdicts.length === 0) {
    return (
      <div className="panel rounded-xl2 p-6 text-center">
        <p className="text-sm text-muted">
          Save at least one offer to rank your options by what matters most to you.
        </p>
      </div>
    );
  }

  const setWeight = (key: DecisionKey, value: number) => setWeights((w) => ({ ...w, [key]: value }));
  const best = ranked[0];

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      {/* Sliders */}
      <div className="panel rounded-xl2 p-5">
        <div className="flex items-center justify-between">
          <div className="eyebrow">What matters to you</div>
          <button
            type="button"
            onClick={() => setWeights(DEFAULT_WEIGHTS)}
            className="inline-flex items-center gap-1 text-[11px] text-muted transition-colors hover:text-cyan"
          >
            <RotateCcw className="h-3 w-3" aria-hidden /> Reset
          </button>
        </div>
        <div className="mt-4 space-y-5">
          {DECISION_META.map((m) => (
            <div key={m.key}>
              <div className="mb-1.5 flex items-baseline justify-between">
                <label htmlFor={`w-${m.key}`} className="text-sm font-medium text-fg">
                  {m.label}
                </label>
                <span className="mono-caps tabular-nums text-cyan">{weights[m.key]}</span>
              </div>
              <input
                id={`w-${m.key}`}
                type="range"
                min={0}
                max={10}
                step={1}
                value={weights[m.key]}
                onChange={(e) => setWeight(m.key, Number(e.target.value))}
                className="w-full accent-cyan"
                aria-label={`${m.label} importance`}
              />
              <div className="mt-1 text-[11px] text-dim">{m.hint}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Ranked offers */}
      <div className="space-y-3">
        {ranked.map(({ verdict, signals, score }, i) => {
          const isBest = verdict.offer.id === best?.verdict.offer.id;
          return (
            <div
              key={verdict.offer.id}
              className={cn(
                "panel rounded-xl2 p-5 transition-colors",
                isBest && "border-gold/50 shadow-glow-gold",
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="display text-2xl tabular-nums text-dim">{i + 1}</span>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-fg">
                      {offerLabel(verdict.offer)}
                      {isBest ? (
                        <span className="mono-caps inline-flex items-center gap-1 rounded-sm border border-gold/40 bg-gold/10 px-1.5 py-0.5 text-gold">
                          <Trophy className="h-3 w-3" aria-hidden /> Best fit
                        </span>
                      ) : null}
                    </div>
                    <div className="text-[11px] text-dim">
                      {verdict.offer.title} · {formatMoney(verdict.totalComp, verdict.currency, { compact: true })} total comp
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn("display text-3xl tabular-nums", isBest ? "text-gold" : "text-fg")}>{score}</div>
                  <div className="mono-caps text-dim">Weighted score</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-2 sm:grid-cols-5">
                {DECISION_META.map((m) => (
                  <div key={m.key}>
                    <div className="mono-caps truncate text-dim" title={m.label}>
                      {m.label.split(" ")[0]}
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line-2/60">
                      <div className="h-full rounded-full bg-cyan" style={{ width: `${signals[m.key]}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
