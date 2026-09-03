/**
 * Shared, pure helpers for the jobs / pipeline / application-pack modules.
 * Kept inside the jobs folder so it never collides with the frozen shared libs.
 * Every function is deterministic and leans only on the exported engine contract.
 */
import type {
  Course,
  Currency,
  Job,
  Level,
  Profile,
} from "@/lib/types";
import type { CheckFitJob } from "@/lib/engine/jobs";
import { buildGrowthPlan, evaluateOffer, findLocation, findRole } from "@/lib/engine";
import { uid } from "@/lib/utils";

export const LEVEL_ORDER: Level[] = ["entry", "mid", "senior", "lead"];
export const LEVEL_TITLE: Record<Level, string> = { entry: "Entry", mid: "Mid", senior: "Senior", lead: "Lead" };

/** Title prefixes that force evaluateOffer's title-based level detection to a known level. */
const LEVEL_PREFIX: Record<Level, string> = { entry: "Junior", mid: "", senior: "Senior", lead: "Lead" };

export interface LevelBenchmark {
  level: Level;
  floor: number;
  median: number;
  ceiling: number;
}

/**
 * Entry → Lead salary benchmarks for a role + city, sourced from the offer engine
 * (which prices role × city × level). Currency follows the job listing.
 */
export function levelBenchmarks(role: string, location: string, currency: Currency): LevelBenchmark[] {
  return LEVEL_ORDER.map((level) => {
    const prefix = LEVEL_PREFIX[level];
    const title = `${prefix ? `${prefix} ` : ""}${role}`.trim();
    const verdict = evaluateOffer(
      { id: uid("bench"), title, location, base: 0, currency },
      undefined,
    );
    return { level, floor: verdict.floor, median: verdict.median, ceiling: verdict.ceiling };
  });
}

/** De-duplicated course picks that close the gaps between a profile and a target role. */
export function coursePicks(profile: Profile, job: Pick<Job, "role" | "location">, limit = 4): Course[] {
  const plan = buildGrowthPlan(profile, { role: job.role, location: job.location });
  const seen = new Set<string>();
  const out: Course[] = [];
  for (const step of plan.steps) {
    for (const course of step.courses) {
      const key = course.name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(course);
      if (out.length >= limit) return out;
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/*  Free-text job-description parsing for the "Check My Fit" panel      */
/* ------------------------------------------------------------------ */

const SENIOR_RE = /\b(senior|sr\.?|architect)\b/i;
const ENTRY_RE = /\b(intern|junior|jr\.?|entry|graduate|associate)\b/i;
const LEAD_RE = /\b(lead|staff|principal|head|director|vp|chief)\b/i;

function levelFromText(text: string): Level {
  if (LEAD_RE.test(text)) return "lead";
  if (SENIOR_RE.test(text)) return "senior";
  if (ENTRY_RE.test(text)) return "entry";
  return "mid";
}

/** Detect one or two plausible annual-salary figures ($120,000 / $120k / 120k). */
export function detectSalary(text: string): { min: number; max: number } | null {
  const values: number[] = [];
  const re = /\$?\s*(\d{2,3})(?:,(\d{3})|\s*k\b|(\d{3}))?/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    let value: number;
    if (m[2]) value = parseInt(`${m[1]}${m[2]}`, 10);
    else if (m[3]) value = parseInt(`${m[1]}${m[3]}`, 10);
    else if (/k/i.test(m[0])) value = parseInt(m[1], 10) * 1000;
    else continue;
    if (value >= 20000 && value <= 700000) values.push(value);
  }
  if (values.length === 0) return null;
  return { min: Math.min(...values), max: Math.max(...values) };
}

/** Split a pasted JD into individual requirement lines / sentences. */
function extractRequirements(text: string): string[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.replace(/^[\s•\-*·–—>]+/, "").trim())
    .filter((l) => l.length >= 12 && l.length <= 220);
  const bulletish = lines.filter((l) => /\d|experience|years|skill|degree|ability|proficien|strong|knowledge|familiar|require|responsib|manage|lead|build|design|develop/i.test(l));
  const source = bulletish.length >= 3 ? bulletish : lines;
  if (source.length >= 3) return source.slice(0, 12);
  // Fall back to sentence splitting.
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 16 && s.length <= 240)
    .slice(0, 10);
}

export interface ParsedJD {
  job: CheckFitJob;
  title: string;
  salaryDetected: boolean;
}

/** Turn an arbitrary pasted job description into a CheckFitJob for the fit engine. */
export function parseJobDescription(text: string, fallbackRole?: string): ParsedJD {
  const clean = text.trim();
  const firstLine = clean.split(/\r?\n/).map((l) => l.trim()).find((l) => l.length > 0) ?? "";
  const role = findRole(clean || fallbackRole || "");
  const location = findLocation(clean);
  const level = levelFromText(clean);
  const salary = detectSalary(clean);
  const title = firstLine.length >= 3 && firstLine.length <= 90 ? firstLine : role;
  const requirements = extractRequirements(clean);

  const job: CheckFitJob = {
    title,
    description: clean,
    requirements: requirements.length ? requirements : [`Experience relevant to ${role}`],
    skills: [],
    role,
    level,
    location: location.label,
    country: location.country,
    currency: location.currency,
    salaryMin: salary?.min ?? 0,
    salaryMax: salary?.max ?? 0,
  };
  return { job, title, salaryDetected: salary !== null };
}
