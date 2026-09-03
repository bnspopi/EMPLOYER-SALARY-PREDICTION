/**
 * Career growth + learning roadmap generator.
 * buildGrowthPlan(profile, target) → GrowthPlan (ladder, months, skill steps, certifications).
 * Also exports certificationsFor() and roadmapFor() used by analyzeResume().
 */
import type {
  Certification,
  Course,
  GrowthPlan,
  Level,
  LocationOption,
  Profile,
  RoadmapStep,
} from "../types";
import { clamp, round } from "@/lib/utils";
import { CERTS } from "@/data/certs";
import { COURSES } from "@/data/courses";
import { LEVELS, findRoleDef, skillLookup } from "./catalog";
import { estimate } from "./pricing";

function weeksForSkill(driver: number, demand: number): number {
  // Higher-value, deeper skills take longer to build.
  return clamp(Math.round(4 + driver * 0.7 + (demand > 70 ? 2 : 0)), 3, 16);
}

function coursesForSkill(skill: string, limit = 2): Course[] {
  return COURSES.filter((c) => c.skill.toLowerCase() === skill.toLowerCase())
    .slice(0, limit)
    .map((c) => ({
      name: c.name,
      provider: c.provider,
      duration: c.duration,
      skill: c.skill,
      upliftPct: c.uplift,
    }));
}

/** Certifications ranked by uplift × relevance for a role (excludes ones the profile already holds). */
export function certificationsFor(role: string, _city?: string, profile?: Profile): Certification[] {
  const roleDef = findRoleDef(role);
  const held = new Set((profile?.certifications ?? []).map((c) => c.toLowerCase()));
  const scored = CERTS.filter((c) => !held.has(c.name.toLowerCase())).map((c) => {
    const applies = c.roles.includes(roleDef.name);
    const listed = roleDef.certifications.includes(c.name);
    const relevance = listed ? 100 : applies ? 80 : 20;
    return {
      cert: c,
      relevance,
      rank: c.uplift * relevance,
    };
  });
  return scored
    .filter((s) => s.relevance >= 80)
    .sort((a, b) => b.rank - a.rank)
    .slice(0, 6)
    .map((s) => ({
      name: s.cert.name,
      provider: s.cert.provider,
      duration: s.cert.duration,
      upliftPct: s.cert.uplift,
      relevance: s.relevance,
      url: s.cert.url,
    }));
}

/** Ordered skill roadmap toward a target role; first 3 steps are always unlocked. */
export function roadmapFor(profile: Profile, targetRole?: string, baseMedian?: number): RoadmapStep[] {
  const roleDef = findRoleDef(targetRole ?? profile.role);
  const owned = new Set(profile.skills.map((s) => s.name.toLowerCase()));
  const current = baseMedian ?? estimate(profile).median;

  const missing = roleDef.coreSkills
    .filter((c) => !owned.has(c.skill.toLowerCase()))
    .map((c) => {
      const def = skillLookup(c.skill);
      return { skill: c.skill, weight: c.weight, driver: def?.driver ?? 6, demand: def?.demand ?? 60 };
    })
    .sort((a, b) => b.demand * b.weight - a.demand * a.weight);

  let cumulative = current;
  return missing.slice(0, 8).map((m, i) => {
    const upliftPct = clamp(Math.round(m.driver * (m.weight / 10) * 0.9), 2, 12);
    cumulative = round(cumulative * (1 + upliftPct / 100), 100);
    return {
      order: i + 1,
      skill: m.skill,
      milestone: `Ship a project that demonstrably uses ${m.skill}, then add a quantified bullet for it.`,
      weeks: weeksForSkill(m.driver, m.demand),
      upliftPct,
      cumulativeSalary: cumulative,
      courses: coursesForSkill(m.skill),
      locked: i >= 3,
    };
  });
}

export function buildGrowthPlan(
  profile: Profile,
  target: { role: string; salary?: number; location?: string },
): GrowthPlan {
  const roleDef = findRoleDef(target.role);
  const location: LocationOption = profile.location;
  const currency = location.currency;

  const currentEstimate = estimate(profile);
  const currentMedian = currentEstimate.median;

  // Ladder for the target role in the profile's currency.
  const ladder = LEVELS.map((lvl: Level) => {
    const info = roleDef.ladder[lvl];
    return {
      level: lvl,
      title: info.title,
      median: round(roleDef.medians[lvl] * location.multiplier, 500),
      years: info.years,
      description: info.description,
    };
  });

  // Target salary: explicit, otherwise the next level up on the target ladder.
  const currentIdx = LEVELS.indexOf(profile.level);
  const targetIdx = clamp(currentIdx + 1, 0, LEVELS.length - 1);
  const ladderTarget = ladder[targetIdx].median;
  const targetSalary = target.salary ?? ladderTarget;

  const steps = roadmapFor(profile, target.role, currentMedian);
  const certifications = certificationsFor(target.role, target.location, profile);

  // Months: driven by the salary gap and the level jump.
  const gapRatio = Math.max(0, (targetSalary - currentMedian) / Math.max(currentMedian, 1));
  const levelJump = Math.max(0, targetIdx - currentIdx);
  const months = clamp(Math.round(gapRatio * 24 + levelJump * 4 + steps.length * 0.5), 3, 36);

  return {
    targetRole: roleDef.name,
    targetSalary,
    currentMedian,
    currency,
    months,
    steps,
    certifications,
    ladder,
  };
}
