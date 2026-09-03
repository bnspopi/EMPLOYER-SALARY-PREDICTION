"use client";
import { useMemo, useState } from "react";
import { Plus, Trophy, Trash2, GitCompare } from "lucide-react";
import type { OfferVerdict } from "@/lib/types";
import { compareOffers } from "@/lib/engine";
import { formatMoney, formatPct } from "@/lib/format";
import { useApp, useActiveAnalysis } from "@/lib/store";
import { Topbar } from "@/components/dashboard/Topbar";
import { Button } from "@/components/ui/Button";
import { Gate } from "@/components/ui/Gate";
import { DashSkeleton, SectionHeader } from "@/components/dashboard/widgets";
import { cn } from "@/lib/utils";
import { OfferForm } from "./OfferForm";
import { offerLabel } from "./logic";

interface Row {
  label: string;
  render: (v: OfferVerdict) => string;
  tone?: (v: OfferVerdict) => string;
}

const ROWS: Row[] = [
  { label: "Base", render: (v) => formatMoney(v.offer.base, v.currency) },
  { label: "Bonus", render: (v) => formatMoney(v.offer.bonus ?? 0, v.currency) },
  { label: "Equity / yr", render: (v) => formatMoney(v.offer.equity ?? 0, v.currency) },
  { label: "Sign-on", render: (v) => formatMoney(v.offer.signOn ?? 0, v.currency) },
  { label: "Total comp", render: (v) => formatMoney(v.totalComp, v.currency) },
  { label: "Market median", render: (v) => formatMoney(v.median, v.currency) },
  {
    label: "% vs median",
    render: (v) => formatPct(v.pctVsMedian),
    tone: (v) => (v.verdict === "below" ? "text-ember" : v.verdict === "above" ? "text-green" : "text-cyan"),
  },
  { label: "Percentile", render: (v) => `${v.percentile}th` },
  { label: "Decision score", render: (v) => `${v.decisionScore}`, tone: () => "text-gold" },
];

export function CompareClient() {
  const hydrated = useApp((s) => s.hydrated);
  const offers = useApp((s) => s.offers);
  const addOffer = useApp((s) => s.addOffer);
  const removeOffer = useApp((s) => s.removeOffer);
  const { analysis } = useActiveAnalysis();
  const profile = analysis?.profile;
  const [adding, setAdding] = useState(false);

  const comparison = useMemo(
    () => (offers.length ? compareOffers(offers, profile) : null),
    [offers, profile],
  );

  if (!hydrated) {
    return (
      <>
        <Topbar title="Compare offers" eyebrow="Side by side" />
        <DashSkeleton rows={2} label="Loading your offers" />
      </>
    );
  }

  return (
    <>
      <Topbar title="Compare offers" eyebrow="Side by side" />

      <SectionHeader
        as="h2"
        eyebrow="Offer comparison"
        title="Every offer, side by side"
        description="Base, bonus, equity, sign-on and total comp for each saved offer, each priced against its own market median — with a recommended pick."
        action={
          <Button variant="secondary" size="sm" onClick={() => setAdding((v) => !v)}>
            <Plus className="h-4 w-4" aria-hidden /> Add offer
          </Button>
        }
      />

      {adding ? (
        <div className="panel mb-6 rounded-xl2 p-5 md:p-6">
          <div className="eyebrow mb-3">New offer</div>
          <OfferForm
            submitLabel="Add offer"
            compact
            onSubmit={(draft) => {
              addOffer(draft);
              setAdding(false);
            }}
            onCancel={() => setAdding(false)}
          />
        </div>
      ) : null}

      {offers.length === 0 ? (
        <div className="panel rounded-xl2 p-10 text-center">
          <GitCompare className="mx-auto h-8 w-8 text-dim" aria-hidden />
          <p className="mx-auto mt-4 max-w-md text-sm text-muted">
            No offers to compare yet. Add one above, or evaluate an offer and save it from the{" "}
            <a href="/dashboard/offer-evaluator" className="text-cyan hover:underline">
              offer evaluator
            </a>
            .
          </p>
        </div>
      ) : (
        <Gate feature="compareOffers">
          {comparison ? (
            <div className="space-y-6">
              {/* Best pick */}
              <div className="panel grid-bg relative overflow-hidden rounded-xl2 border border-gold/40 p-6 shadow-glow-gold">
                <div className="vignette pointer-events-none absolute inset-0" aria-hidden />
                <div className="relative">
                  <div className="mono-caps inline-flex items-center gap-2 rounded-sm border border-gold/40 bg-gold/10 px-2.5 py-1 text-gold">
                    <Trophy className="h-3.5 w-3.5" aria-hidden /> Recommended pick
                  </div>
                  <h3 className="display mt-3 text-3xl text-gold md:text-4xl">
                    {offerLabel(
                      comparison.verdicts.find((v) => v.offer.id === comparison.bestId)?.offer ?? offers[0],
                    )}
                  </h3>
                  <ul className="mt-4 space-y-2">
                    {comparison.reasons.map((r, i) => (
                      <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-fg">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Comparison table */}
              <div className="panel overflow-x-auto rounded-xl2">
                <table className="w-full min-w-[520px] border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className="sticky left-0 z-10 bg-panel px-4 py-4 text-left mono-caps text-muted">Metric</th>
                      {comparison.verdicts.map((v) => {
                        const best = v.offer.id === comparison.bestId;
                        return (
                          <th
                            key={v.offer.id}
                            className={cn(
                              "px-4 py-4 text-right align-bottom",
                              best && "bg-gold/[0.06]",
                            )}
                          >
                            <div className="flex items-center justify-end gap-1.5">
                              {best ? <Trophy className="h-3.5 w-3.5 text-gold" aria-hidden /> : null}
                              <span className={cn("text-sm font-semibold", best ? "text-gold" : "text-fg")}>
                                {offerLabel(v.offer)}
                              </span>
                            </div>
                            <div className="mt-0.5 text-[11px] font-normal text-dim">{v.offer.title}</div>
                            <button
                              type="button"
                              onClick={() => removeOffer(v.offer.id)}
                              aria-label={`Remove ${offerLabel(v.offer)}`}
                              className="mt-1 inline-flex items-center gap-1 text-[10px] text-dim transition-colors hover:text-red"
                            >
                              <Trash2 className="h-3 w-3" aria-hidden /> Remove
                            </button>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {ROWS.map((row) => (
                      <tr key={row.label} className="border-t border-line/60">
                        <td className="sticky left-0 z-10 bg-panel px-4 py-3 text-left mono-caps text-muted">
                          {row.label}
                        </td>
                        {comparison.verdicts.map((v) => {
                          const best = v.offer.id === comparison.bestId;
                          return (
                            <td
                              key={v.offer.id}
                              className={cn(
                                "px-4 py-3 text-right font-semibold tabular-nums",
                                best && "bg-gold/[0.06]",
                                row.tone ? row.tone(v) : "text-fg",
                              )}
                            >
                              {row.render(v)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </Gate>
      )}
    </>
  );
}
