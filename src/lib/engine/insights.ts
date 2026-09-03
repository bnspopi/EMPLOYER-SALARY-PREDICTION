import type { InsightsReport, Profile } from "../types";
// STUB — replaced by the engine implementation. Keep signatures.
export function getInsights(role: string, location: string, profile?: Profile): InsightsReport {
  void profile;
  return { role, location, currency: "USD", trend: [], supplyDemandRatio: 3.46, marketLabel: "Competitive", activeRoles: 137502, emergingSkills: [], decliningSkills: [], remotePremiumPct: -2, cityPremiums: [], countryComparison: [] };
}
