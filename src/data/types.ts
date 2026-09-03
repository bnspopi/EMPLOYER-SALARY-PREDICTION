/** Shared shapes for seed data modules in src/data. Engine code imports these; data files export typed constants. */
import type { Country, Currency, Level, Job } from "@/lib/types";

export interface RoleDef {
  /** canonical display name, e.g. "Software Engineer" */
  name: string;
  slug: string;
  category: "engineering" | "data" | "product" | "design" | "marketing" | "sales" | "operations" | "people" | "finance" | "healthcare" | "support" | "management";
  aliases: string[];
  /** US national median base salary (USD) per level */
  medians: Record<Level, number>;
  /** P25 / P75 as multipliers of the median (e.g. 0.82 / 1.18) */
  p25: number;
  p75: number;
  /** skills that matter most for this role, with weight 1-10 */
  coreSkills: { skill: string; weight: number }[];
  certifications: string[];
  /** supply-to-demand ratio (candidates per open role) */
  supplyDemandRatio: number;
  activeRolesUS: number;
  ladder: Record<Level, { title: string; years: string; description: string; dayToDay: string }>;
  whatTheyDo: string;
  specializations: { name: string; description: string }[];
  topEmployers: { company: string; openings: number }[];
}

export interface CityDef {
  city: string;
  country: Country;
  currency: Currency;
  /** multiplier applied to the USD national median, expressed in the local currency nominal (e.g. London 0.78 → £ figures) */
  multiplier: number;
  remote?: boolean;
  metro?: string;
}

export interface SkillDef {
  name: string;
  category: "programming" | "cloud" | "data" | "ai" | "product" | "design" | "leadership" | "marketing" | "sales" | "operations" | "finance" | "soft" | "tooling" | "domain";
  aliases: string[];
  /** -10..+25: how strongly this skill moves pay */
  driver: number;
  /** 0-100 market demand */
  demand: number;
  /** growth trend % YoY */
  trend: number;
}

export interface CertDef {
  name: string;
  provider: string;
  duration: string;
  /** salary uplift % */
  uplift: number;
  roles: string[]; // canonical role names it applies to
  url?: string;
}

export interface CourseDef {
  name: string;
  provider: string;
  duration: string;
  skill: string;
  uplift: number;
  url?: string;
}

export interface IndustryDef {
  name: string;
  multiplier: number;
  aliases: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  category: "Guide" | "Analytics" | "Report" | "News";
  date: string;
  author: string;
  summary: string;
  /** markdown-ish paragraphs (plain strings) */
  body: string[];
  tags: string[];
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  source: string;
}

export type JobDef = Job;
