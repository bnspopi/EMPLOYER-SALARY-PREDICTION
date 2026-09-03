import type { GrowthPlan, Profile } from "../types";
// STUB — replaced by the engine implementation. Keep signatures.
export function buildGrowthPlan(profile: Profile, target: { role: string; salary?: number; location?: string }): GrowthPlan {
  return { targetRole: target.role, targetSalary: target.salary ?? 120000, currentMedian: 89000, currency: profile.location.currency, months: 12, steps: [], certifications: [], ladder: [] };
}
