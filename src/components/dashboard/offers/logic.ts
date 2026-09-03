/**
 * Offer-module helpers that layer on top of the deterministic engine
 * (evaluateOffer / compareOffers). Kept inside the offers folder because
 * the shared engine files are frozen. Pure, no React.
 */
import type { NegotiationBrief, OfferInput, OfferVerdict } from "@/lib/types";
import type { BriefEstimate, BriefProfile } from "@/components/brief";
import { clamp } from "@/lib/utils";
import { formatMoney, percentileLabel } from "@/lib/format";

/* ---------------- Decision Helper ---------------- */

export type DecisionKey = "comp" | "growth" | "remote" | "equity" | "stability";

export interface DecisionWeights {
  comp: number;
  growth: number;
  remote: number;
  equity: number;
  stability: number;
}

export const DEFAULT_WEIGHTS: DecisionWeights = { comp: 8, growth: 6, remote: 5, equity: 5, stability: 4 };

export const DECISION_META: { key: DecisionKey; label: string; hint: string }[] = [
  { key: "comp", label: "Total compensation", hint: "Cash + equity vs the market" },
  { key: "growth", label: "Growth & upside", hint: "Equity, seniority, trajectory" },
  { key: "remote", label: "Remote flexibility", hint: "Location freedom" },
  { key: "equity", label: "Equity", hint: "Ownership in the outcome" },
  { key: "stability", label: "Stability", hint: "Guaranteed cash vs at-risk" },
];

export type OfferSignals = Record<DecisionKey, number>;

function isRemote(location: string): boolean {
  return /remote|anywhere|wfh|work from home/i.test(location);
}

/** Deterministic 0-100 signals per dimension for a single evaluated offer. */
export function offerSignals(v: OfferVerdict): OfferSignals {
  const base = Math.max(v.offer.base, 1);
  const bonus = v.offer.bonus ?? 0;
  const equity = v.offer.equity ?? 0;
  const signOn = v.offer.signOn ?? 0;
  const total = Math.max(base + bonus + equity + signOn, 1);

  const compRatio = v.totalComp / Math.max(v.marketTotalComp, 1);
  const comp = clamp(Math.round(50 + (compRatio - 1) * 130), 0, 100);

  const equityShare = equity / total;
  const equityScore = clamp(Math.round(equityShare * 260), 0, 100);

  const baseShare = base / total;
  const stability = clamp(Math.round(baseShare * 100), 0, 100);

  const remote = isRemote(v.offer.location) ? 92 : 50;

  const seniorityBump = v.level === "lead" ? 10 : v.level === "senior" ? 5 : 0;
  const verdictBump = v.verdict === "above" ? 10 : v.verdict === "below" ? -6 : 0;
  const growth = clamp(Math.round(40 + equityShare * 170 + seniorityBump + verdictBump), 0, 100);

  return { comp, growth, remote, equity: equityScore, stability };
}

/** Weighted 0-100 score for an offer given the user's slider weights. */
export function weightedScore(sig: OfferSignals, w: DecisionWeights): number {
  const totalW = w.comp + w.growth + w.remote + w.equity + w.stability;
  if (totalW <= 0) return 0;
  const s =
    sig.comp * w.comp +
    sig.growth * w.growth +
    sig.remote * w.remote +
    sig.equity * w.equity +
    sig.stability * w.stability;
  return clamp(Math.round(s / totalW), 0, 100);
}

export interface RescoredOffer {
  verdict: OfferVerdict;
  signals: OfferSignals;
  score: number;
}

/** Rescore + rank evaluated offers against custom weights (Decision Helper). */
export function rescoreOffers(verdicts: OfferVerdict[], w: DecisionWeights): RescoredOffer[] {
  return verdicts
    .map((verdict) => {
      const signals = offerSignals(verdict);
      return { verdict, signals, score: weightedScore(signals, w) };
    })
    .sort((a, b) => b.score - a.score || b.verdict.totalComp - a.verdict.totalComp);
}

/* ---------------- Negotiation Playbook (6-step) ---------------- */

export interface PlaybookStep {
  n: number;
  title: string;
  channel: "Prep" | "Email" | "Call" | "Counter" | "Close";
  timing: string;
  detail: string;
  script: string;
}

export function buildPlaybook(v: OfferVerdict): PlaybookStep[] {
  const b: NegotiationBrief = v.negotiation;
  const money = (n: number) => formatMoney(n, v.currency);
  const company = v.offer.company || "the team";
  const gapLine =
    v.verdict === "below"
      ? `market data puts this role ${Math.abs(v.pctVsMedian)}% above the base on the table`
      : v.verdict === "above"
        ? "the base is already competitive, so the conversation is about total comp and growth"
        : "the base is in line with market, so small, specific asks land best";

  return [
    {
      n: 1,
      title: "Prepare your case",
      channel: "Prep",
      timing: "Before you reply",
      detail: `Line up the three numbers you'll anchor on and one quantified win. Note that ${gapLine}.`,
      script: `Market range for a ${v.offer.title}: ${money(v.floor)}–${money(v.ceiling)} (median ${money(v.median)}). My target: ${money(b.target)}.`,
    },
    {
      n: 2,
      title: "Acknowledge & buy time",
      channel: "Email",
      timing: "Within 24 hours",
      detail: "Reply warmly, confirm interest, and ask for a short window to review — never accept or counter on the spot.",
      script: `Thank you so much for the offer to join ${company} — I'm genuinely excited. Could I take until the end of the week to review the details? I want to come back to you thoughtfully.`,
    },
    {
      n: 3,
      title: "Anchor on your target",
      channel: "Call",
      timing: "The negotiation call",
      detail: "Open with gratitude, state your research-backed number, and go quiet. The first person to talk after the ask usually concedes.",
      script: b.openingScript,
    },
    {
      n: 4,
      title: "Handle the pushback",
      channel: "Counter",
      timing: "When they resist",
      detail: "If they say the base is fixed, pivot to structure rather than walking away.",
      script: b.counterTactics[0] ?? "Ask what would need to be true to move the base, and which levers are flexible instead.",
    },
    {
      n: 5,
      title: "Trade on non-base levers",
      channel: "Counter",
      timing: "Same conversation",
      detail: "Sign-on, equity, review timing and title all carry real value and are often easier to grant than base.",
      script:
        b.counterTactics[1] ??
        `Anchor on total comp — propose closing the gap to ${money(v.marketTotalComp)} across base, bonus and equity.`,
    },
    {
      n: 6,
      title: "Confirm in writing & close",
      channel: "Close",
      timing: "Before you accept",
      detail: "Get every agreed number in an updated written offer, then accept graciously to start the relationship well.",
      script:
        b.counterTactics[2] ??
        "This works for me — could you send an updated written offer reflecting what we discussed? I'm ready to sign once it's in.",
    },
  ];
}

/* ---------------- Adapters for the Salary Brief ---------------- */

/** Build a BriefEstimate from an evaluated offer (for the Salary Brief PDF/doc). */
export function estimateFromVerdict(v: OfferVerdict): BriefEstimate {
  return {
    currency: v.currency,
    floor: v.floor,
    median: v.median,
    ceiling: v.ceiling,
    percentile: v.percentile,
    percentileLabel: percentileLabel(v.percentile),
    role: v.offer.title,
    location: {
      city: v.offer.location,
      country: "US",
      currency: v.currency,
      label: v.offer.location,
      multiplier: 1,
    },
  };
}

/** Build a BriefProfile from an offer + optional display name. */
export function profileFromOffer(offer: OfferInput, v: OfferVerdict, displayName: string): BriefProfile {
  return {
    displayName: displayName || offer.company || "Candidate",
    role: offer.title,
    level: v.level,
    location: {
      city: offer.location,
      country: "US",
      currency: v.currency,
      label: offer.location,
      multiplier: 1,
    },
    yearsExperience: { entry: 1, mid: 4, senior: 7, lead: 11 }[v.level],
  };
}

/** Short label for a saved offer. */
export function offerLabel(offer: OfferInput): string {
  return offer.company || offer.label || offer.title;
}
