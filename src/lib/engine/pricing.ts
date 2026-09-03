/**
 * Deterministic market pricing model.
 * estimate(profile) → MarketEstimate: role base by level × city × industry × skill premium,
 * experience curve, remote adjustment, floor/median/ceiling, percentile and per-skill contributions.
 */
import type { LocationOption, MarketEstimate, Profile, SkillRating } from "../types";
import { clamp, round } from "@/lib/utils";
import { percentileLabel } from "@/lib/format";
import { INDUSTRIES, DEFAULT_INDUSTRY } from "@/data/industries";
import { findRoleDef, skillLookup } from "./catalog";
import { today } from "./text";

export interface EstimateOptions {
  /** Override the location used for pricing (otherwise profile.location). */
  location?: LocationOption;
}

const LEVEL_FACTOR: Record<SkillRating["level"], number> = {
  Expert: 1.0,
  Advanced: 0.7,
  General: 0.4,
  Inferred: 0.25,
};

const EXP_BANDS: Record<string, [number, number]> = {
  entry: [0, 2],
  mid: [2, 5],
  senior: [5, 9],
  lead: [9, 16],
};

function industryMultiplier(name: string): number {
  const found = INDUSTRIES.find((i) => i.name === name);
  return (found ?? DEFAULT_INDUSTRY).multiplier;
}

function remoteAdjustment(loc: LocationOption): number {
  if (!loc.remote) return 0;
  if (loc.country === "US") return -2;
  if (loc.country === "CA") return -3;
  return -2;
}

/** Per-skill percentage-point contribution to the skill premium. */
function skillPct(skill: SkillRating): number {
  const level = LEVEL_FACTOR[skill.level] ?? 0.4;
  return skill.salaryDriver * level * (skill.confidence / 100) * 0.14;
}

export function estimate(profile: Profile, opts: EstimateOptions = {}): MarketEstimate {
  const roleDef = findRoleDef(profile.role);
  const location = opts.location ?? profile.location;
  const level = profile.level;

  const baseUSD = roleDef.medians[level];
  const industryMult = industryMultiplier(profile.industry);
  const localBase = baseUSD * location.multiplier * industryMult;

  // Skill premium (clamped -12%..+22%) with a small baseline subtraction so an average résumé sits near 0.
  const rawSum = profile.skills.reduce((acc, s) => acc + skillPct(s), 0);
  const premiumPct = clamp(rawSum - 3, -12, 22);

  // Experience curve inside the level band.
  const [lo, hi] = EXP_BANDS[level] ?? [0, 2];
  const frac = clamp((profile.yearsExperience - lo) / (hi - lo || 1), 0, 1);
  const expAdjPct = (frac - 0.5) * 6;

  const remoteAdjPct = remoteAdjustment(location);

  const median = round(
    localBase * (1 + premiumPct / 100) * (1 + expAdjPct / 100) * (1 + remoteAdjPct / 100),
    100,
  );
  const floor = round(median * roleDef.p25, 500);
  const ceiling = round(median * roleDef.p75, 500);

  // Percentile: map -12% → 15th, +22% → 92nd, nudged by the experience curve.
  const percentile = clamp(
    Math.round(15 + ((premiumPct + 12) / 34) * 77 + expAdjPct * 0.8),
    5,
    97,
  );

  // Per-skill $ contribution to the median (before premium), used for lifting / dragging.
  const rated: SkillRating[] = profile.skills.map((s) => ({
    ...s,
    contribution: Math.round((localBase * skillPct(s)) / 100),
  }));
  const skillsLifting = rated
    .filter((s) => s.contribution > 0)
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 5);
  const skillsDragging = rated
    .filter((s) => s.contribution < 0)
    .sort((a, b) => a.contribution - b.contribution)
    .slice(0, 5);

  // Skill-up potential: uplift if the 3 highest-demand missing core skills were added.
  const owned = new Set(profile.skills.map((s) => s.name.toLowerCase()));
  const missingCore = roleDef.coreSkills
    .filter((c) => !owned.has(c.skill.toLowerCase()))
    .map((c) => {
      const def = skillLookup(c.skill);
      return { skill: c.skill, weight: c.weight, demand: def?.demand ?? 60, driver: def?.driver ?? 6 };
    })
    .sort((a, b) => b.demand * b.weight - a.demand * a.weight)
    .slice(0, 3);
  const rawUplift = missingCore.reduce((acc, m) => acc + m.driver * (m.weight / 10) * 0.5, 0);
  const skillUpPotentialPct = clamp(Math.round(rawUplift), 5, 18);

  return {
    currency: location.currency,
    floor,
    median,
    ceiling,
    percentile,
    percentileLabel: percentileLabel(percentile),
    role: roleDef.name,
    level,
    location,
    skillUpPotentialPct,
    skillsLifting,
    skillsDragging,
    remoteAdjustmentPct: remoteAdjPct,
    updatedAt: today(),
    dataPoints: roleDef.activeRolesUS * 73,
  };
}
