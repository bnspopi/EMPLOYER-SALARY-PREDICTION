import type { OfferComparison, OfferInput, OfferVerdict, Profile } from "../types";
import { findLocation } from "./catalog";
// STUB — replaced by the engine implementation. Keep signatures.
export function evaluateOffer(offer: OfferInput, profile?: Profile): OfferVerdict {
  const loc = findLocation(offer.location);
  const median = 119000, floor = 100000, ceiling = 138000;
  const totalComp = offer.base + (offer.bonus ?? 0) + (offer.equity ?? 0) + (offer.signOn ?? 0);
  return {
    offer, verdict: "below", verdictLabel: "Below market", pctVsMedian: -12, percentile: 30, currency: loc.currency, floor, median, ceiling, totalComp,
    marketTotalComp: median * 1.1, negotiation: { currency: loc.currency, floor: 112000, target: 122000, stretch: 130000, openingScript: "", counterTactics: [], leverage: [], talkingPoints: [], totalPotentialGain: 17000 },
    breakdown: [{ label: "Base", value: offer.base }], level: profile?.level ?? "mid", decisionScore: 60, notes: [],
  };
}
export function compareOffers(offers: OfferInput[], profile?: Profile): OfferComparison {
  const verdicts = offers.map((o) => evaluateOffer(o, profile));
  return { verdicts, bestId: verdicts[0]?.offer.id ?? "", reasons: [] };
}
