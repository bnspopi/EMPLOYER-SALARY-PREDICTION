/* ---------- Plans ---------- */
export type Plan = "curious" | "explorer" | "hunter";
export type Currency = "USD" | "CAD" | "GBP";
export type Country = "US" | "CA" | "UK";
export type Level = "entry" | "mid" | "senior" | "lead";
export type SkillLevel = "Expert" | "Advanced" | "General" | "Inferred";
export type Severity = "HIGH" | "MED" | "LOW";

/* ---------- Profile (parsed resume) ---------- */
export interface SkillRating {
  name: string;
  category: string;
  level: SkillLevel;
  /** 0-100 confidence that the skill is real and current */
  confidence: number;
  /** -100..100 — how strongly this skill moves pay (positive lifts, negative drags) */
  salaryDriver: number;
  /** 0-100 — market demand for this skill in the role/region */
  demand: number;
  /** estimated $ contribution to the median */
  contribution: number;
}

export interface Profile {
  id: string;
  displayName: string;
  title: string;
  titles: string[];
  role: string; // normalized role key from src/data/roles.ts
  level: Level;
  yearsExperience: number;
  skills: SkillRating[];
  education: string[];
  certifications: string[];
  employmentType: string;
  employerType: string;
  industry: string;
  location: LocationOption;
  remotePreference: "remote" | "hybrid" | "onsite" | "unknown";
  summary: string;
  bullets: string[];
  rawText: string;
  wordCount: number;
}

export interface LocationOption {
  city: string;
  country: Country;
  currency: Currency;
  label: string; // "Los Angeles, US"
  multiplier: number;
  remote?: boolean;
}

/* ---------- Market estimate ---------- */
export interface MarketEstimate {
  currency: Currency;
  floor: number;
  median: number;
  ceiling: number;
  percentile: number; // 0-100
  percentileLabel: string;
  role: string;
  level: Level;
  location: LocationOption;
  skillUpPotentialPct: number;
  skillsLifting: SkillRating[];
  skillsDragging: SkillRating[];
  remoteAdjustmentPct: number;
  updatedAt: string;
  dataPoints: number;
}

export interface Improvement {
  id: string;
  severity: Severity;
  impactLabel: string; // "+8–12% salary signal"
  impactMin: number;
  impactMax: number;
  title: string;
  fix: string;
  section: "experience" | "skills" | "education" | "summary" | "leadership" | "format";
}

export interface ResumeScore {
  score: number; // 0-100
  improvements: Improvement[];
  strengths: Strength[];
  gaps: Gap[];
}

export interface Strength {
  title: string;
  detail: string;
  demand: number;
}
export interface Gap {
  title: string;
  detail: string;
  severity: Severity;
  fix: string;
  impactLabel: string;
}

export interface Certification {
  name: string;
  provider: string;
  duration: string;
  upliftPct: number;
  relevance: number;
  url?: string;
}

export interface Course {
  name: string;
  provider: string;
  duration: string;
  skill: string;
  upliftPct: number;
}

export interface RoadmapStep {
  order: number;
  skill: string;
  milestone: string;
  weeks: number;
  upliftPct: number;
  cumulativeSalary: number;
  courses: Course[];
  locked?: boolean; // plan-gated beyond first 3
}

export interface NegotiationBrief {
  currency: Currency;
  floor: number;
  target: number;
  stretch: number;
  openingScript: string;
  counterTactics: string[];
  leverage: string[];
  talkingPoints: string[];
  totalPotentialGain: number;
}

export interface Analysis {
  id: string;
  resumeId: string;
  createdAt: string;
  profile: Profile;
  estimate: MarketEstimate;
  score: ResumeScore;
  brief: NegotiationBrief;
  certifications: Certification[];
  roadmap: RoadmapStep[];
  targetRole?: string;
}

/* ---------- Offers ---------- */
export interface OfferInput {
  id: string;
  label?: string;
  company?: string;
  title: string;
  location: string; // label or city
  base: number;
  bonus?: number;
  equity?: number; // annualized
  signOn?: number;
  description?: string;
  currency?: Currency;
}

export type Verdict = "below" | "at" | "above";

export interface OfferVerdict {
  offer: OfferInput;
  verdict: Verdict;
  verdictLabel: string;
  pctVsMedian: number;
  percentile: number;
  currency: Currency;
  floor: number;
  median: number;
  ceiling: number;
  totalComp: number;
  marketTotalComp: number;
  negotiation: NegotiationBrief;
  breakdown: { label: string; value: number }[];
  level: Level;
  decisionScore: number; // 0-100 for Decision Helper
  notes: string[];
}

export interface OfferComparison {
  verdicts: OfferVerdict[];
  bestId: string;
  reasons: string[];
}

/* ---------- Jobs ---------- */
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  country: Country;
  remote: boolean;
  salaryMin: number;
  salaryMax: number;
  currency: Currency;
  level: Level;
  role: string;
  skills: string[];
  requirements: string[];
  description: string;
  postedDaysAgo: number;
  industry: string;
}

export interface JobQuery {
  role?: string;
  location?: string;
  minSalary?: number;
  remoteOnly?: boolean;
  query?: string;
}

export interface FitRequirement {
  requirement: string;
  status: "matched" | "partial" | "gap";
  note?: string;
}

export interface JobFit {
  score: number; // 0-100
  matched: number;
  partial: number;
  gaps: number;
  requirements: FitRequirement[];
  marketMedian: number;
  salaryContext: string; // "Pays 8% above your market median"
}

export interface JobMatch {
  job: Job;
  fit: JobFit;
}

export type Stage = "saved" | "applied" | "interviewing" | "offered";
export const STAGES: Stage[] = ["saved", "applied", "interviewing", "offered"];

export interface PipelineCard {
  id: string;
  jobId: string;
  job: Job;
  stage: Stage;
  fitScore: number;
  marketMedian: number;
  addedAt: string;
  notes?: string;
}

export interface ApplicationPack {
  jobId: string;
  tailoredSummary: string;
  tailoredBullets: string[];
  coverLetter: string;
  interviewPrep: { question: string; answerOutline: string }[];
  fit: JobFit;
}

/* ---------- Growth & insights ---------- */
export interface GrowthPlan {
  targetRole: string;
  targetSalary: number;
  currentMedian: number;
  currency: Currency;
  months: number;
  steps: RoadmapStep[];
  certifications: Certification[];
  ladder: { level: Level; title: string; median: number; years: string; description: string }[];
}

export interface TrendPoint {
  month: string;
  median: number;
  demand: number;
}

export interface InsightsReport {
  role: string;
  location: string;
  currency: Currency;
  trend: TrendPoint[];
  supplyDemandRatio: number;
  marketLabel: "Critically Undersupplied" | "Highly Competitive" | "Competitive" | "Balanced" | "Saturated";
  activeRoles: number;
  emergingSkills: { skill: string; growthPct: number }[];
  decliningSkills: { skill: string; changePct: number }[];
  remotePremiumPct: number;
  cityPremiums: { city: string; premiumPct: number; median: number }[];
  countryComparison: { country: Country; currency: Currency; median: number; medianUSD: number }[];
}

/* ---------- Salary guides ---------- */
export interface SalaryGuide {
  slug: string;
  title: string;
  role: string;
  date: string;
  summary: string;
  nationalMedian: number;
  entryMedian: number;
  leadMedian: number;
  activeRoles: number;
  supplyDemandRatio: number;
  marketLabel: string;
  intro: string[];
  whatTheyDo: string;
  levels: { level: string; years: string; median: number; p25: number; p75: number; description: string; dayToDay: string }[];
  cities: { city: string; entry: number | null; mid: number | null; senior: number | null; lead: number | null }[];
  whatMovesTheNumber: string[];
  types: { name: string; description: string }[];
  employers: { company: string; openings: number }[];
  faq: { q: string; a: string }[];
  furtherReading?: string;
}

/* ---------- Recruiter ---------- */
export interface RecruiterReport {
  title: string;
  role: string;
  level: Level;
  currency: Currency;
  median: number;
  range: { min: number; max: number };
  byCity: { city: string; min: number; max: number }[];
  byLevel: { level: string; min: number; max: number }[];
  byIndustry: { industry: string; min: number; max: number }[];
  requiredSkills: string[];
  niceToHave: string[];
  recommendedBand: { min: number; max: number };
  notes: string[];
}

/* ---------- Misc ---------- */
export interface ResumeVersion {
  id: string;
  name: string;
  text: string;
  createdAt: string;
  isOther?: boolean; // someone else's resume, for comparison
}

export interface User {
  name: string;
  email: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface RewriteSuggestion {
  original: string;
  rewritten: string;
  reasons: string[];
}

export interface Targets {
  role?: string;
  location?: string;
  salary?: number;
}
