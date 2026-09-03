"use client";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, BookmarkCheck, Gauge as GaugeIcon } from "lucide-react";
import type { OfferInput } from "@/lib/types";
import { evaluateOffer } from "@/lib/engine";
import { formatMoney } from "@/lib/format";
import { useApp, useActiveAnalysis } from "@/lib/store";
import { Topbar } from "@/components/dashboard/Topbar";
import { Button } from "@/components/ui/Button";
import { Gate } from "@/components/ui/Gate";
import { SalaryBriefDoc } from "@/components/brief";
import {
  DashSkeleton,
  RangeBar,
  SectionHeader,
  StatTile,
} from "@/components/dashboard/widgets";
import { cn } from "@/lib/utils";
import { OfferForm, type OfferDraft } from "./OfferForm";
import { VerdictBanner } from "./VerdictBanner";
import { TotalCompStack } from "./TotalCompStack";
import { NegotiationPlaybook } from "./NegotiationPlaybook";
import { DecisionHelper } from "./DecisionHelper";
import { SavedOffers } from "./SavedOffers";
import { estimateFromVerdict, profileFromOffer } from "./logic";

type TabKey = "verdict" | "comp" | "playbook" | "decision";
const TABS: { key: TabKey; label: string }[] = [
  { key: "verdict", label: "Verdict" },
  { key: "comp", label: "Total comp" },
  { key: "playbook", label: "Negotiation playbook" },
  { key: "decision", label: "Decision helper" },
];

export function OfferEvaluatorClient() {
  const hydrated = useApp((s) => s.hydrated);
  const offers = useApp((s) => s.offers);
  const addOffer = useApp((s) => s.addOffer);
  const displayNameOverride = useApp((s) => s.displayNameOverride);
  const { analysis } = useActiveAnalysis();
  const profile = analysis?.profile;

  const [draft, setDraft] = useState<OfferDraft | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("verdict");

  const offer: OfferInput | null = useMemo(() => (draft ? { ...draft, id: "draft" } : null), [draft]);
  const verdict = useMemo(() => (offer ? evaluateOffer(offer, profile) : null), [offer, profile]);

  const savedVerdicts = useMemo(
    () => offers.map((o) => evaluateOffer(o, profile)),
    [offers, profile],
  );

  if (!hydrated) {
    return (
      <>
        <Topbar title="Offer evaluator" eyebrow="Is your offer fair?" />
        <DashSkeleton rows={2} label="Loading the offer evaluator" />
      </>
    );
  }

  const displayName = profile?.displayName || displayNameOverride;

  const save = () => {
    if (!draft) return;
    const created = addOffer(draft);
    setSavedId(created.id);
  };

  return (
    <>
      <Topbar title="Offer evaluator" eyebrow="Is your offer fair?" />

      {/* Form */}
      <div className="panel rounded-xl2 p-5 md:p-6">
        <SectionHeader
          as="h2"
          eyebrow="Job offer analysis"
          title="Is your job offer actually fair?"
          description="Enter the offer and PayLens prices it against real market data for the role and city — verdict, percentile, full range, total comp and a negotiation brief."
        />
        <OfferForm
          submitLabel="Evaluate offer"
          onSubmit={(d) => {
            setDraft(d);
            setSavedId(null);
            setTab("verdict");
          }}
        />
      </div>

      {/* Results */}
      {verdict && offer ? (
        <div className="mt-6 space-y-6">
          <VerdictBanner verdict={verdict} />

          {/* Range + percentile */}
          <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
            <div className="panel rounded-xl2 p-5 md:p-6">
              <div className="eyebrow mb-6 text-cyan">Your offer vs the market range</div>
              <RangeBar
                floor={verdict.floor}
                median={verdict.median}
                ceiling={verdict.ceiling}
                currency={verdict.currency}
                marker={{ value: offer.base, label: "Your base", tone: "ember" }}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <StatTile
                label="Percentile"
                value={`${verdict.percentile}th`}
                sub="Where your base sits in the band"
                tone="cyan"
              />
              <StatTile
                label="Decision score"
                value={`${verdict.decisionScore}`}
                sub="Overall offer strength / 100"
                tone={verdict.decisionScore >= 60 ? "green" : "gold"}
              />
            </div>
          </div>

          {/* Total comp */}
          <div className="panel rounded-xl2 p-5 md:p-6">
            <div className="eyebrow mb-5">Total compensation</div>
            <TotalCompStack verdict={verdict} />
          </div>

          {/* Salary brief (targets + script + tactics + leverage; PDF gated) */}
          <SalaryBriefDoc
            brief={verdict.negotiation}
            estimate={estimateFromVerdict(verdict)}
            profile={profileFromOffer(offer, verdict, displayName)}
            title="Offer negotiation brief"
            pdfTitle="Offer Salary Brief"
          />

          {/* Save offer */}
          <div className="flex flex-wrap items-center gap-3">
            <Button variant={savedId ? "secondary" : "primary"} size="sm" onClick={save} disabled={!!savedId}>
              {savedId ? (
                <>
                  <BookmarkCheck className="h-4 w-4" aria-hidden /> Saved to compare
                </>
              ) : (
                <>
                  <Bookmark className="h-4 w-4" aria-hidden /> Save offer
                </>
              )}
            </Button>
            <Button variant="ghost" size="sm" href="/dashboard/compare">
              Compare saved offers →
            </Button>
          </div>

          {/* Hunter negotiation suite */}
          <div>
            <SectionHeader
              as="h3"
              eyebrow="Hunter"
              title="Negotiation suite"
              description="Deep-dive tabs: full verdict notes, total-comp breakdown, a 6-step negotiation playbook with ready-to-send scripts, and a weighted decision helper."
            />
            <Gate feature="offerTabs">
              <div className="panel rounded-xl2 p-5 md:p-6">
                <div role="tablist" aria-label="Negotiation suite" className="mb-6 flex flex-wrap gap-2">
                  {TABS.map((t) => (
                    <button
                      key={t.key}
                      role="tab"
                      aria-selected={tab === t.key}
                      onClick={() => setTab(t.key)}
                      className={cn(
                        "mono-caps rounded-md border px-3 py-2 transition-colors",
                        tab === t.key
                          ? "border-cyan/50 bg-cyan/10 text-cyan"
                          : "border-line bg-white/5 text-muted hover:text-fg",
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    {tab === "verdict" ? <VerdictTab verdict={verdict} /> : null}
                    {tab === "comp" ? <CompTab verdict={verdict} /> : null}
                    {tab === "playbook" ? <NegotiationPlaybook verdict={verdict} /> : null}
                    {tab === "decision" ? <DecisionHelper verdicts={savedVerdicts} /> : null}
                  </motion.div>
                </AnimatePresence>
              </div>
            </Gate>
          </div>
        </div>
      ) : null}

      {/* Saved offers */}
      <div className="mt-10">
        <SectionHeader as="h3" eyebrow="Compare offers" title="Saved offers" />
        <SavedOffers profile={profile} />
      </div>
    </>
  );
}

function VerdictTab({ verdict }: { verdict: ReturnType<typeof evaluateOffer> }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div>
        <div className="eyebrow mb-3 flex items-center gap-2">
          <GaugeIcon className="h-3.5 w-3.5 text-cyan" aria-hidden /> What this means
        </div>
        <ul className="space-y-2.5">
          {verdict.notes.map((n, i) => (
            <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-fg">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan" aria-hidden />
              {n}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <div className="eyebrow mb-3">Leverage</div>
        <ul className="space-y-2.5">
          {verdict.negotiation.leverage.map((l, i) => (
            <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-fg">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
              {l}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CompTab({ verdict }: { verdict: ReturnType<typeof evaluateOffer> }) {
  return (
    <div className="space-y-6">
      <TotalCompStack verdict={verdict} />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-sm">
          <tbody>
            {verdict.breakdown.map((row) => (
              <tr key={row.label} className="border-b border-line/60 last:border-0">
                <td className="py-2.5 text-muted">{row.label}</td>
                <td className="py-2.5 text-right font-semibold tabular-nums text-fg">
                  {formatMoney(row.value, verdict.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
