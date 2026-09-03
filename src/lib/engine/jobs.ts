/**
 * Job search + fit scoring over the seed listings in src/data/jobs.ts.
 * searchJobs(query, profile?) → JobMatch[] (filtered, sorted by fit desc).
 * checkFit(job, profile?) → JobFit with a matched / partial / gap requirement matrix.
 */
import type { FitRequirement, Job, JobFit, JobMatch, JobQuery, Profile } from "../types";
import { clamp, round } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import { JOBS } from "@/data/jobs";
import { SKILLS } from "@/data/skills";
import { LEVELS, findLocation, findRole, findRoleDef } from "./catalog";
import { estimate } from "./pricing";

export type CheckFitJob = Pick<
  Job,
  | "title"
  | "description"
  | "requirements"
  | "skills"
  | "role"
  | "level"
  | "location"
  | "country"
  | "currency"
  | "salaryMin"
  | "salaryMax"
>;

export function listJobs(): Job[] {
  return JOBS;
}

export function getJob(id: string): Job | undefined {
  return JOBS.find((j) => j.id === id);
}

function lc(s: string): string {
  return ` ${s.toLowerCase().replace(/\s+/g, " ").trim()} `;
}

/** Parse a "5+ years" style requirement, returning the required year count if present. */
function requiredYears(text: string): number | null {
  const m = text.match(/(\d{1,2})\s*\+?\s*(?:years?|yrs?)/i);
  return m ? parseInt(m[1], 10) : null;
}

/** Skills (canonical names) referenced inside a requirement sentence. */
function skillsInText(text: string): string[] {
  const norm = lc(text);
  const found: string[] = [];
  for (const def of SKILLS) {
    const tokens = [def.name, ...def.aliases].filter((t) => !(t.length <= 2 && !/[+#]/.test(t)));
    if (tokens.some((t) => norm.includes(` ${t.toLowerCase()} `))) found.push(def.name);
  }
  return found;
}

const LEADERSHIP_RE = /\b(lead|leadership|manage|management|mentor|stakeholder|cross-functional|team|strategy|executive|communication|present)\b/i;

export function checkFit(job: CheckFitJob, profile?: Profile): JobFit {
  const owned = new Set((profile?.skills ?? []).map((s) => s.name.toLowerCase()));
  const profileYears = profile?.yearsExperience ?? 0;
  const profileLevelIdx = profile ? LEVELS.indexOf(profile.level) : -1;

  const requirements: FitRequirement[] = job.requirements.map((req) => {
    const reqYears = requiredYears(req);
    const skills = skillsInText(req);
    const components: number[] = [];
    const notes: string[] = [];

    if (reqYears !== null) {
      if (!profile) {
        components.push(0.55);
      } else if (profileYears >= reqYears) {
        components.push(1);
        notes.push(`${reqYears}+ yrs vs your ${profileYears}`);
      } else if (profileYears >= reqYears - 2) {
        components.push(0.5);
        notes.push(`${reqYears}+ yrs vs your ${profileYears}`);
      } else {
        components.push(0);
        notes.push(`needs ${reqYears}+ yrs, you have ${profileYears}`);
      }
    }

    if (skills.length) {
      if (!profile) {
        components.push(0.5);
      } else {
        const matchedSkills = skills.filter((s) => owned.has(s.toLowerCase()));
        components.push(matchedSkills.length / skills.length);
        if (matchedSkills.length) notes.push(`${matchedSkills.slice(0, 3).join(", ")} ✓`);
        else notes.push(`${skills.slice(0, 2).join(", ")} not evidenced`);
      }
    }

    if (components.length === 0) {
      // Soft / general requirement.
      const leadership = LEADERSHIP_RE.test(req);
      if (!profile) components.push(0.55);
      else if (leadership && (profile.level === "senior" || profile.level === "lead")) components.push(0.85);
      else components.push(0.6);
    }

    const val = components.reduce((a, b) => a + b, 0) / components.length;
    const status: FitRequirement["status"] = val >= 0.75 ? "matched" : val >= 0.35 ? "partial" : "gap";
    return { requirement: req, status, note: notes.join(" · ") || undefined };
  });

  const matched = requirements.filter((r) => r.status === "matched").length;
  const partial = requirements.filter((r) => r.status === "partial").length;
  const gaps = requirements.filter((r) => r.status === "gap").length;

  const reqScore = requirements.length
    ? requirements.reduce((a, r) => a + (r.status === "matched" ? 1 : r.status === "partial" ? 0.5 : 0), 0) /
      requirements.length
    : 0.55;

  const jobSkills = job.skills.map((s) => s.toLowerCase());
  const skillCoverage = jobSkills.length
    ? jobSkills.filter((s) => owned.has(s)).length / jobSkills.length
    : 0.5;

  let levelMatch = 0.6;
  if (profileLevelIdx >= 0) {
    const dist = Math.abs(profileLevelIdx - LEVELS.indexOf(job.level));
    levelMatch = dist === 0 ? 1 : dist === 1 ? 0.6 : 0.3;
  }

  const rawFit = profile ? reqScore * 55 + skillCoverage * 30 + levelMatch * 15 : reqScore * 70 + 20;
  const scoreValue = clamp(Math.round(rawFit), 30, 100);

  // Market median for the job's role + city.
  const roleDef = findRoleDef(job.role);
  const loc = findLocation(job.location);
  const marketMedian = round(roleDef.medians[job.level] * loc.multiplier, 500);

  const jobMid = (job.salaryMin + job.salaryMax) / 2;
  const reference = profile && profile.location.currency === job.currency ? estimate(profile).median : marketMedian;
  const pct = Math.round(((jobMid - reference) / reference) * 100);
  let salaryContext: string;
  const ref = profile && profile.location.currency === job.currency ? "your market median" : "the market median";
  if (Math.abs(pct) <= 3) salaryContext = `Pays about in line with ${ref} (${formatMoney(jobMid, job.currency, { compact: true })}).`;
  else if (pct > 0) salaryContext = `Pays ~${pct}% above ${ref} (${formatMoney(jobMid, job.currency, { compact: true })}).`;
  else salaryContext = `Pays ~${Math.abs(pct)}% below ${ref} (${formatMoney(jobMid, job.currency, { compact: true })}).`;

  return { score: scoreValue, matched, partial, gaps, requirements, marketMedian, salaryContext };
}

function roleMatches(job: Job, roleQuery: string): boolean {
  const canonQ = findRole(roleQuery);
  if (findRole(job.role) === canonQ) return true;
  const jr = lc(job.role);
  const jt = lc(job.title);
  const q = lc(roleQuery).trim();
  if (jr.includes(q) || (q.length >= 4 && jr.trim().includes(q))) return true;
  if (jt.includes(q)) return true;
  return false;
}

export function searchJobs(query: JobQuery, profile?: Profile): JobMatch[] {
  let pool = JOBS.slice();

  if (query.role && query.role.trim()) {
    pool = pool.filter((j) => roleMatches(j, query.role as string));
  }
  if (query.location && query.location.trim()) {
    const loc = findLocation(query.location);
    pool = pool.filter((j) => j.country === loc.country || j.remote);
  }
  if (typeof query.minSalary === "number" && query.minSalary > 0) {
    pool = pool.filter((j) => j.salaryMax >= (query.minSalary as number));
  }
  if (query.remoteOnly) {
    pool = pool.filter((j) => j.remote);
  }
  if (query.query && query.query.trim()) {
    const q = query.query.toLowerCase();
    pool = pool.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.industry.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q) ||
        j.skills.some((s) => s.toLowerCase().includes(q)),
    );
  }

  return pool
    .map((job) => ({ job, fit: checkFit(job, profile) }))
    .sort((a, b) => b.fit.score - a.fit.score || a.job.postedDaysAgo - b.job.postedDaysAgo);
}
