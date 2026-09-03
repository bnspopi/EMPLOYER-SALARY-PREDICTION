/**
 * Verbatim landing copy pulled from docs/payscope-feature-catalog.md and
 * docs/design-brief.md. Kept in one module so sections stay pure/presentational.
 */
import type { LucideIcon } from "lucide-react";
import {
  FileSearch,
  TrendingUp,
  Scale,
  Briefcase,
  Rocket,
  GitBranch,
  BookOpen,
  Users,
  LineChart,
  ShieldCheck,
} from "lucide-react";

export interface ModuleTile {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

/** Hero left HUD — "MODULES S — A". */
export const HERO_MODULES: ModuleTile[] = [
  { key: "analyze", label: "Analyze", href: "/analyze", icon: FileSearch },
  { key: "improve", label: "Improve", href: "/dashboard/improve", icon: TrendingUp },
  { key: "offer", label: "Offer", href: "/dashboard/offer-evaluator", icon: Scale },
  { key: "jobs", label: "Jobs", href: "/dashboard/job-search", icon: Briefcase },
  { key: "growth", label: "Growth", href: "/dashboard/career-growth", icon: Rocket },
];

/** Hero right HUD — LEVEL-style readout + stat bars. */
export interface StatRow {
  label: string;
  value: string;
  /** stat-bar fill 0-100 */
  width: number;
}
export const HERO_STATS: StatRow[] = [
  { label: "Market position", value: "75", width: 75 },
  { label: "Skill-up", value: "+12%", width: 58 },
  { label: "Resume score", value: "68", width: 68 },
  { label: "Data points", value: "10M", width: 92 },
];

/** Section 2 — stats strip (count-up). */
export interface StatItem {
  value: number;
  suffix: string;
  decimals?: number;
  label: string;
}
export const STATS_STRIP: StatItem[] = [
  { value: 5.0, suffix: "★", decimals: 1, label: "Average user rating" },
  { value: 3, suffix: "", label: "Countries covered" },
  { value: 12, suffix: "K+", label: "Analyses completed" },
  { value: 93, suffix: "%", label: "Would recommend" },
  { value: 100, suffix: "%", label: "Data stays private" },
];

/** Section 3 — "Where are you right now?" intent cards (copy verbatim). */
export interface IntentCard {
  eyebrow: string;
  headline: string;
  cta: string;
  href: string;
  icon: LucideIcon;
}
export const INTENT_CARDS: IntentCard[] = [
  {
    eyebrow: "Just got an offer",
    headline: "Is it fair? Find out in minutes.",
    cta: "Evaluate My Offer",
    href: "/dashboard/offer-evaluator",
    icon: Scale,
  },
  {
    eyebrow: "Am I underpaid?",
    headline: "See exactly where you stand.",
    cta: "Analyze My Resume",
    href: "/dashboard/market-value",
    icon: TrendingUp,
  },
  {
    eyebrow: "Looking for a new role",
    headline: "Find jobs that actually fit your profile.",
    cta: "Start Job Search",
    href: "/dashboard/job-search",
    icon: Briefcase,
  },
  {
    eyebrow: "Want to earn more",
    headline: "Map your path to a higher salary.",
    cta: "Build My Plan",
    href: "/dashboard/career-growth",
    icon: Rocket,
  },
];

/** Section 4 — watch chapters. */
export interface Chapter {
  num: string;
  title: string;
  body: string;
  /** progress window [start, end] in which the chapter is fully visible */
  range: [number, number];
}
export const WATCH_CHAPTERS: Chapter[] = [
  {
    num: "01",
    title: "Parsing Model",
    body: "Resume and job description become the same vectors.",
    range: [0.0, 0.33],
  },
  {
    num: "02",
    title: "Pricing Model",
    body: "Trained on vacancies with known pay.",
    range: [0.33, 0.66],
  },
  {
    num: "03",
    title: "Updated Daily",
    body: "10 million data points a month.",
    range: [0.66, 1.0],
  },
];

/** Section 5 — employee at work. */
export const EMPLOYEE_BULLETS: string[] = [
  "Salary range based on your actual skills",
  "Market percentile ranking",
  "Strengths and gaps mapped to demand",
  "Skill ROI analysis",
  "Job recommendations matched to profile",
];
export interface OrbitCard {
  label: string;
  value: string;
}
export const EMPLOYEE_CARDS: OrbitCard[] = [
  { label: "Product Strategy", value: "85%" },
  { label: "Median", value: "$89K" },
  { label: "Percentile", value: "Top 25%" },
  { label: "Skill-up", value: "+12%" },
];

/** Section 6 — how it works. */
export interface Step {
  index: string;
  timing: string;
  title: string;
  body: string;
}
export const HOW_STEPS: Step[] = [
  {
    index: "01",
    timing: "30 seconds",
    title: "Upload",
    body: "Drop your resume or paste a job description. A basic analysis is available for everyone – sign up to unleash your power!",
  },
  {
    index: "02",
    timing: "2 minutes",
    title: "Get your analysis",
    body: "Salary range, market percentile, skill gaps, job matches, improvement priorities – personalized to your actual profile, updated daily.",
  },
  {
    index: "03",
    timing: "Ongoing",
    title: "Apply and improve",
    body: "Rewrite your resume, find jobs, generate tailored application packs, apply and track your pipeline. Then come back with an updated version and see what changed.",
  },
];

/** Section 7 — resume as center. */
export const CENTER_BULLETS: string[] = [
  "Salary range based on your actual skills",
  "Market percentile ranking",
  "Strengths and gaps mapped to demand",
  "Skill ROI analysis",
  "Job recommendations matched to profile",
];
export const CENTER_RANGE = { floor: 81000, median: 89000, ceiling: 98000 };
export const CENTER_TARGETS = { floor: 89000, target: 94500, stretch: 98000 };

/** Section 8 — fixes it with you. */
export const FIXES_LINES: string[] = [
  "Prioritized improvements by market value impact",
  "AI-assisted section rewrites",
  "Salary uplift-ranked certifications",
];

/** Section 9 — proof of work modules. */
export interface ModuleCard {
  num: string;
  title: string;
  description: string;
  soon?: boolean;
}
export const PROOF_MODULES: ModuleCard[] = [
  { num: "01", title: "Jobs Pipeline", description: "Kanban from saved to offered, drag-and-drop, fit on every card." },
  { num: "02", title: "Learning Roadmap", description: "Milestones ranked by salary impact, courses that pay." },
  { num: "03", title: "Compare Offers", description: "Base, bonus, equity and total comp side by side." },
  { num: "04", title: "Multiple Resume Versions", description: "Keep versions, switch active, see what each one prices." },
  { num: "05", title: "Market Insights", description: "Trends, demand shifts and emerging skills for your role." },
  { num: "06", title: "Recruiter Mode", description: "Benchmark any job description before you post it.", soon: true },
];

/** Section 11 — testimonials (Product Hunt). */
export interface Quote {
  quote: string;
  name: string;
  role: string;
}
export const LANDING_QUOTES: Quote[] = [
  {
    quote: "I finally have a clearer sense of where my salary should sit. Super easy to use and unexpectedly insightful.",
    name: "Likfong Yeung",
    role: "Integrated Marketing @ Paraflow",
  },
  {
    quote: "Super clean and genuinely useful.",
    name: "Annet",
    role: "Social Media Content Creator at Loki.Build",
  },
];

/** Section 12 — FAQ fallback (used only if @/data/faq is unavailable at build time). */
export const FAQ_FALLBACK: { q: string; a: string }[] = [
  {
    q: "How accurate is the market value estimate?",
    a: "PayLens prices your profile against live vacancies that publish a known salary, not against self-reported surveys, and the model re-trains daily across roughly 10 million data points a month.",
  },
  {
    q: "What markets does PayLens cover?",
    a: "The United States, Canada and the United Kingdom, with city and metro-level pricing and each market shown in its local currency.",
  },
  {
    q: "How is this different from Glassdoor or Levels.fyi?",
    a: "Glassdoor and Levels.fyi price a job title. PayLens reads your actual resume, rates every skill for how much it moves pay, and prices you.",
  },
  {
    q: "What's the difference between the Professional and Recruiter plans?",
    a: "Professional plans are built for individuals; the Recruiter track turns a job description into a salary benchmark for hiring teams and starts with a 14-day free trial.",
  },
  {
    q: "Is my resume data private?",
    a: "Yes. Your resume is encrypted, never sold and never used to train our models. Contact details are stripped before analysis and you can delete everything at any time.",
  },
  {
    q: "Can I upload multiple versions of my resume?",
    a: "Yes. Keep as many versions as you like, switch the active one with a click, and compare how each one prices.",
  },
];

/** Proof-of-work / everything-inside side icons for module cards. */
export const MODULE_ICONS: LucideIcon[] = [GitBranch, BookOpen, Scale, FileSearch, LineChart, Users];
export const TRUST_ICONS = { shield: ShieldCheck };
