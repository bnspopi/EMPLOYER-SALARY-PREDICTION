import type { Plan } from "./types";

export const PLAN_RANK: Record<Plan, number> = { curious: 0, explorer: 1, hunter: 2 };

export const PLAN_META: Record<Plan, { name: string; priceMonthly: number; priceAnnual: number; tagline: string }> = {
  curious: { name: "Curious", priceMonthly: 0, priceAnnual: 0, tagline: "Get started for free" },
  explorer: { name: "Explorer", priceMonthly: 5, priceAnnual: 50, tagline: "For serious job seekers" },
  hunter: { name: "Hunter", priceMonthly: 18, priceAnnual: 180, tagline: "Full career toolkit" },
};

export const FEATURES = {
  basicRange: "curious",
  marketScore: "curious",
  skillNames: "curious",
  jobSearch: "curious",
  offerVerdict: "curious",
  exactMedian: "explorer",
  salaryBreakdown: "explorer",
  skillScores: "explorer",
  strengthsGaps: "explorer",
  gapAnalysis: "explorer",
  salaryBrief: "explorer",
  careerGrowth: "explorer",
  courses: "explorer",
  roadmapBasic: "explorer",
  countryComparison: "explorer",
  checkMyFit: "explorer",
  compareOffers: "explorer",
  compensationMap: "explorer",
  roadmapExtended: "hunter",
  pipeline: "hunter",
  negotiationPlaybook: "hunter",
  offerTabs: "hunter",
  decisionHelper: "hunter",
  levelBenchmarks: "hunter",
  resumeChat: "hunter",
  applicationPack: "hunter",
  briefPdf: "hunter",
  prioritySupport: "hunter",
} as const satisfies Record<string, Plan>;

export type Feature = keyof typeof FEATURES;

export function can(plan: Plan, feature: Feature) {
  return PLAN_RANK[plan] >= PLAN_RANK[FEATURES[feature]];
}

export function requiredPlan(feature: Feature): Plan {
  return FEATURES[feature];
}

export const PLAN_BULLETS: Record<Plan, string[]> = {
  curious: ["Job search", "Unlimited analyses", "Skill names list", "Market score overview", "Basic salary range"],
  explorer: [
    "Recommended courses & certifications",
    "Career growth recommendations",
    "Country comparison",
    "Gap analysis (resume vs job)",
    "Strengths & improvements analysis",
    "Skill assessment scores",
    "Detailed salary breakdown",
    "Salary Brief for negotiations",
    "Skill Roadmap — first 3 skills",
    "Check My Fit & Compare tab",
    "Everything in Curious",
  ],
  hunter: [
    "Priority support",
    "Application Pack (tailored resume, cover letter, interview prep)",
    "AI recommendations",
    "AI resume improvement chat",
    "Job Pipeline & Kanban board",
    "Negotiation Playbook & Decision Helper",
    "Extended Skill Roadmap",
    "Salary Brief PDF export",
    "Everything in Explorer",
  ],
};
