import type { RecruiterReport } from "../types";
// STUB — replaced by the engine implementation. Keep signatures.
export function benchmarkJobDescription(input: { title?: string; description: string; location?: string; industry?: string }): RecruiterReport {
  return { title: input.title ?? "Role", role: "Software Engineer", level: "mid", currency: "USD", median: 115000, range: { min: 95000, max: 140000 }, byCity: [], byLevel: [], byIndustry: [], requiredSkills: [], niceToHave: [], recommendedBand: { min: 105000, max: 130000 }, notes: [] };
}
