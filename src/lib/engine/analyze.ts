import type { Analysis, Profile } from "../types";
import { findLocation } from "./catalog";
// STUB — replaced by the engine implementation. Keep signatures.
export function parseResume(text: string, opts: { displayName?: string } = {}): Profile {
  return {
    id: "p_stub", displayName: opts.displayName ?? "You", title: "Senior Product Manager", titles: ["Senior Product Manager"], role: "Product Manager",
    level: "senior", yearsExperience: 7, skills: [], education: [], certifications: [], employmentType: "Full-time", employerType: "Startup",
    industry: "Technology", location: findLocation("Los Angeles"), remotePreference: "unknown", summary: "", bullets: [], rawText: text, wordCount: text.split(/\s+/).length,
  };
}
export function analyzeResume(input: { text: string; resumeId?: string; displayName?: string; targetRole?: string; targetLocation?: string }): Analysis {
  const profile = parseResume(input.text, { displayName: input.displayName });
  return {
    id: "a_stub", resumeId: input.resumeId ?? "r_stub", createdAt: new Date().toISOString(), profile,
    estimate: { currency: "USD", floor: 81000, median: 89000, ceiling: 98000, percentile: 75, percentileLabel: "Top 25%", role: profile.role, level: profile.level, location: profile.location, skillUpPotentialPct: 12, skillsLifting: [], skillsDragging: [], remoteAdjustmentPct: 0, updatedAt: new Date().toISOString(), dataPoints: 10_000_000 },
    score: { score: 68, improvements: [], strengths: [], gaps: [] },
    brief: { currency: "USD", floor: 89000, target: 94500, stretch: 98000, openingScript: "", counterTactics: [], leverage: [], talkingPoints: [], totalPotentialGain: 9000 },
    certifications: [], roadmap: [], targetRole: input.targetRole,
  };
}
