/**
 * Offer evaluation + comparison.
 * evaluateOffer(offer, profile?) → OfferVerdict (verdict, % vs median, percentile, total comp,
 * offer-specific negotiation targets + script, decision score).
 * compareOffers(offers, profile?) → ranked OfferComparison.
 */
import type {
  Level,
  NegotiationBrief,
  OfferComparison,
  OfferInput,
  OfferVerdict,
  Profile,
  Verdict,
} from "../types";
import { clamp, round } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import { findRoleDef, findLocation } from "./catalog";
import { INDUSTRIES } from "@/data/industries";

const SENIOR_RE = /\b(senior|sr\.?|architect)\b/i;
const ENTRY_RE = /\b(intern|junior|jr\.?|associate|entry|graduate)\b/i;
const LEAD_RE = /\b(lead|staff|principal|head|director|vp|chief)\b/i;
const TECH_CATS = new Set(["engineering", "data", "product", "design"]);

function levelFromTitle(title: string): Level {
  if (ENTRY_RE.test(title)) return "entry";
  if (LEAD_RE.test(title)) return "lead";
  if (SENIOR_RE.test(title)) return "senior";
  return "mid";
}

function industryMultiplierFromText(text: string): number {
  const low = ` ${text.toLowerCase()} `;
  for (const ind of INDUSTRIES) {
    for (const alias of [ind.name, ...ind.aliases]) {
      if (low.includes(` ${alias.toLowerCase()} `)) return ind.multiplier;
    }
  }
  return 1;
}

function percentileOfBase(base: number, floor: number, median: number, ceiling: number): number {
  if (base <= floor) return clamp(Math.round(10 * (base / Math.max(floor, 1))), 3, 12);
  if (base <= median) return clamp(Math.round(10 + ((base - floor) / (median - floor || 1)) * 40), 3, 97);
  if (base <= ceiling) return clamp(Math.round(50 + ((base - median) / (ceiling - median || 1)) * 42), 3, 97);
  return clamp(Math.round(92 + ((base - ceiling) / Math.max(ceiling, 1)) * 20), 3, 97);
}

export function evaluateOffer(offer: OfferInput, profile?: Profile): OfferVerdict {
  const roleDef = findRoleDef(offer.title);
  const location = findLocation(offer.location);
  const currency = offer.currency ?? location.currency;
  const level: Level = profile ? profile.level : levelFromTitle(offer.title);

  const industryMult = offer.description ? industryMultiplierFromText(offer.description) : 1;
  const median = round(roleDef.medians[level] * location.multiplier * industryMult, 100);
  const floor = round(median * roleDef.p25, 500);
  const ceiling = round(median * roleDef.p75, 500);

  const base = offer.base;
  const bonus = offer.bonus ?? 0;
  const equity = offer.equity ?? 0;
  const signOn = offer.signOn ?? 0;
  const totalComp = base + bonus + equity + signOn;

  const pctVsMedian = Math.round(((base - median) / median) * 100);
  let verdict: Verdict;
  let verdictLabel: string;
  if (base < median * 0.95) {
    verdict = "below";
    verdictLabel = `Below market · ${Math.abs(pctVsMedian)}% under median`;
  } else if (base > median * 1.05) {
    verdict = "above";
    verdictLabel = `Above market · ${pctVsMedian}% over median`;
  } else {
    verdict = "at";
    verdictLabel = "At market · in line with median";
  }

  const percentile = percentileOfBase(base, floor, median, ceiling);

  const isTech = TECH_CATS.has(roleDef.category);
  const marketTotalComp = round(median * (isTech ? 1.12 : 1.06), 100);

  // Offer-specific negotiation targets.
  const negFloor = round(Math.max(base, median * 0.94), 500);
  const negTarget = round(clamp(Math.max(median * 1.03, base * 1.1), 0, ceiling), 500);
  const negStretch = round(ceiling * 0.95, 500);
  const years = profile ? Math.round(profile.yearsExperience) : { entry: 1, mid: 4, senior: 7, lead: 11 }[level];
  const rangeStr = `${formatMoney(floor, currency, { compact: true })}–${formatMoney(ceiling, currency, { compact: true })}`;

  const openingScript =
    `Thank you for the offer. Based on my research, the market rate for a ${offer.title} in ${location.city} is ` +
    `${rangeStr} for someone with my background. Given my ${years} year${years === 1 ? "" : "s"} of experience` +
    `${profile && profile.skills[0] ? ` and my work with ${profile.skills[0].name}` : ""}, ` +
    `I'd like to discuss a base of ${formatMoney(negTarget, currency)}.`;

  const negotiation: NegotiationBrief = {
    currency,
    floor: negFloor,
    target: negTarget,
    stretch: negStretch,
    openingScript,
    counterTactics: [
      "If they say the base budget is fixed, ask about a sign-on bonus or additional equity instead.",
      `Anchor on total comp: propose closing the gap to ${formatMoney(marketTotalComp, currency, { compact: true })} across base, bonus and equity.`,
      "Request a written 6-month review with a defined raise trigger if the base can't move today.",
    ],
    leverage: [
      `Your base sits at the ${percentile}th percentile of this role's range in ${location.city}.`,
      verdict === "below"
        ? `You're ${Math.abs(pctVsMedian)}% under the market median — that gap is your negotiating room.`
        : `You're near the top of the band; push on equity and title rather than base.`,
      `Market ceiling here is ${formatMoney(ceiling, currency, { compact: true })}.`,
    ],
    talkingPoints: (profile?.skills.slice(0, 3).map((s) => `Cite a concrete outcome you drove with ${s.name}.`) ?? [
      "Lead with your most quantified achievement.",
    ]),
    totalPotentialGain: negStretch - negFloor,
  };

  // Decision score: total comp vs market (dominant), plus remote/equity/growth signals.
  const compRatio = totalComp / Math.max(marketTotalComp, 1);
  let decisionScore = clamp(Math.round(45 + (compRatio - 1) * 120), 0, 85);
  if (location.remote) decisionScore += 6;
  if (equity > 0) decisionScore += 6;
  if (bonus > 0) decisionScore += 3;
  if (verdict === "above") decisionScore += 4;
  decisionScore = clamp(decisionScore, 0, 100);

  const notes: string[] = [];
  notes.push(
    verdict === "below"
      ? `The base is ${Math.abs(pctVsMedian)}% below the ${location.city} median — there is clear room to negotiate.`
      : verdict === "above"
        ? `The base is above the ${location.city} median — a strong offer; focus on total comp and growth.`
        : `The base is in line with the ${location.city} median.`,
  );
  if (equity === 0) notes.push("No equity component — ask whether equity or an annual bonus is available.");
  if (signOn === 0 && verdict === "below") notes.push("No sign-on bonus — a common lever to close a base-salary gap.");
  notes.push(
    `Total compensation of ${formatMoney(totalComp, currency, { compact: true })} vs a market total of ${formatMoney(marketTotalComp, currency, { compact: true })}.`,
  );

  const breakdown = [
    { label: "Base", value: base },
    { label: "Bonus", value: bonus },
    { label: "Equity (annualized)", value: equity },
    { label: "Sign-on", value: signOn },
    { label: "Total compensation", value: totalComp },
    { label: "Market median (base)", value: median },
    { label: "Market total comp", value: marketTotalComp },
  ];

  return {
    offer,
    verdict,
    verdictLabel,
    pctVsMedian,
    percentile,
    currency,
    floor,
    median,
    ceiling,
    totalComp,
    marketTotalComp,
    negotiation,
    breakdown,
    level,
    decisionScore,
    notes,
  };
}

export function compareOffers(offers: OfferInput[], profile?: Profile): OfferComparison {
  const verdicts = offers.map((o) => evaluateOffer(o, profile));
  const ranked = [...verdicts].sort((a, b) => b.decisionScore - a.decisionScore || b.totalComp - a.totalComp);
  const best = ranked[0];
  const reasons: string[] = [];
  if (best) {
    const label = best.offer.company || best.offer.label || best.offer.title;
    reasons.push(`${label} ranks highest with a decision score of ${best.decisionScore}/100.`);
    reasons.push(
      `Highest effective total compensation at ${formatMoney(best.totalComp, best.currency, { compact: true })}.`,
    );
    if (best.verdict !== "below") reasons.push(`Its base is ${best.verdictLabel.toLowerCase()}.`);
    const runnerUp = ranked[1];
    if (runnerUp) {
      const rl = runnerUp.offer.company || runnerUp.offer.label || runnerUp.offer.title;
      reasons.push(
        `It edges out ${rl} by ${Math.max(1, best.decisionScore - runnerUp.decisionScore)} points on the decision score.`,
      );
    }
  }
  return { verdicts, bestId: best?.offer.id ?? "", reasons };
}
