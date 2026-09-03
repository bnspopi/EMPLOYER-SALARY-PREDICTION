/**
 * Résumé scoring model.
 * score(profile, estimate) → ResumeScore: 0-100 plus prioritized Improvement[], strengths and gaps.
 * Impact ranges mirror docs/payscope-feature-catalog.md §4.
 */
import type { Gap, Improvement, MarketEstimate, Profile, ResumeScore, Strength } from "../types";
import { clamp } from "@/lib/utils";
import { impactRange } from "./text";
import { findRoleDef, skillLookup } from "./catalog";

const AI_CATEGORIES = new Set(["ai"]);

function hasLeadershipSignal(profile: Profile): boolean {
  const leadershipSkills = profile.skills.some(
    (s) => s.category === "leadership" || /leadership|manage|mentor|team|stakeholder|cross-functional|hiring|people/i.test(s.name),
  );
  const text = profile.rawText.toLowerCase();
  const scopeMention = /team of \d|\d+\s+(?:engineers|reports|people|direct reports)|managed a team|led a team|cross-functional/.test(text);
  return leadershipSkills || scopeMention;
}

function quantifiedBulletCount(profile: Profile): number {
  return profile.bullets.filter((b) => /(\$\s?\d|\d+\s?%|\b\d{2,}\b)/.test(b)).length;
}

export function score(profile: Profile, estimate: MarketEstimate): ResumeScore {
  const roleDef = findRoleDef(profile.role);
  const text = profile.rawText.toLowerCase();

  const quantified = quantifiedBulletCount(profile);
  const actionBullets = profile.bullets.filter((b) => /^(led|built|shipped|launched|designed|developed|created|drove|delivered|owned|managed|scaled|grew|increased|reduced|improved|optimized|cut|automated|architected|implemented|spearheaded|directed|generated|boosted|streamlined|mentored)/i.test(b.trim().replace(/^[-•*\s]+/, ""))).length;

  const owned = new Set(profile.skills.map((s) => s.name.toLowerCase()));
  const coreMatched = roleDef.coreSkills.filter((c) => owned.has(c.skill.toLowerCase())).length;
  const coreCoverage = roleDef.coreSkills.length ? coreMatched / roleDef.coreSkills.length : 0;
  const missingCore = roleDef.coreSkills.filter((c) => !owned.has(c.skill.toLowerCase()));

  const hasAI = profile.skills.some((s) => AI_CATEGORIES.has(s.category)) || /\b(ai|ml|machine learning|llm|gpt|copilot|genai)\b/i.test(text);
  const summaryStatesRole = !!profile.summary &&
    (profile.summary.toLowerCase().includes(roleDef.name.toLowerCase().split(" ")[0]) ||
      /senior|lead|principal|manager|engineer|designer|analyst|scientist|architect|years/i.test(profile.summary));
  const educationOk = profile.education.length > 0;
  const certsOk = profile.certifications.length > 0;
  const leadershipOk = hasLeadershipSignal(profile);
  const wc = profile.wordCount;
  const lengthOk = wc >= 350 && wc <= 900;

  // ---- Weighted 0-100 score ----
  let raw = 0;
  raw += clamp(quantified, 0, 3) / 3 * 18; // quantified achievements density
  raw += clamp(actionBullets, 0, 5) / 5 * 12; // action verbs
  raw += coreCoverage * 18; // skills coverage vs role
  raw += lengthOk ? 8 : wc < 350 ? clamp(wc / 350, 0, 1) * 5 : 4; // length 350-900
  raw += summaryStatesRole ? 8 : profile.summary ? 4 : 0; // summary presence + quality
  raw += educationOk ? 8 : 0; // education
  raw += certsOk ? 8 : 0; // certifications
  raw += leadershipOk ? 8 : profile.level === "entry" || profile.level === "mid" ? 4 : 0; // leadership scope
  raw += hasAI ? 8 : 0; // AI/ML tooling mention
  raw += profile.yearsExperience > 0 ? 6 : 3; // recency / dated experience
  raw += 4; // contact-free (contacts stripped during parsing)
  const scoreValue = clamp(Math.round(raw), 0, 100);

  // ---- Improvements (catalog-matched) ----
  const improvements: Improvement[] = [];
  if (quantified < 3) {
    improvements.push({
      id: "quantified",
      severity: "HIGH",
      impactLabel: `${impactRange(8, 12)} salary signal`,
      impactMin: 8,
      impactMax: 12,
      title: "Missing quantified achievements",
      fix: "Add revenue, growth, or scope numbers to at least 3 experience bullets.",
      section: "experience",
    });
  }
  if (!hasAI) {
    improvements.push({
      id: "ai-tooling",
      severity: "HIGH",
      impactLabel: `${impactRange(6, 9)} in tech-adjacent roles`,
      impactMin: 6,
      impactMax: 9,
      title: "No mention of AI/ML tooling",
      fix: "Add the specific AI tools you use — even basic day-to-day usage counts.",
      section: "skills",
    });
  }
  if (!educationOk) {
    improvements.push({
      id: "education",
      severity: "MED",
      impactLabel: `${impactRange(3, 5)} for entry-mid levels`,
      impactMin: 3,
      impactMax: 5,
      title: "Education section too sparse",
      fix: "Add relevant coursework, degrees, or certifications.",
      section: "education",
    });
  }
  if (!leadershipOk && (profile.level === "senior" || profile.level === "lead")) {
    improvements.push({
      id: "leadership",
      severity: "MED",
      impactLabel: `${impactRange(4, 7)} for senior roles`,
      impactMin: 4,
      impactMax: 7,
      title: "No leadership scope indicated",
      fix: "Specify team size managed or cross-functional coverage.",
      section: "leadership",
    });
  }
  if (missingCore.length > 0) {
    const names = missingCore.slice(0, 3).map((c) => c.skill).join(", ");
    improvements.push({
      id: "core-skills",
      severity: "MED",
      impactLabel: `${impactRange(5, 9)} salary signal`,
      impactMin: 5,
      impactMax: 9,
      title: "Skills list missing high-demand core skills",
      fix: `Add and evidence the core skills employers screen for: ${names}.`,
      section: "skills",
    });
  }
  if (!summaryStatesRole) {
    improvements.push({
      id: "summary",
      severity: "LOW",
      impactLabel: `${impactRange(2, 4)} clarity signal`,
      impactMin: 2,
      impactMax: 4,
      title: "Summary doesn't state level/role",
      fix: `Open with a one-line summary naming your level and target role (e.g. "${roleDef.ladder[profile.level].title}").`,
      section: "summary",
    });
  }
  if (profile.bullets.length > 0 && actionBullets < Math.ceil(profile.bullets.length / 2)) {
    improvements.push({
      id: "outcomes",
      severity: "MED",
      impactLabel: `${impactRange(3, 6)} salary signal`,
      impactMin: 3,
      impactMax: 6,
      title: "Bullets are duties, not outcomes",
      fix: "Start each bullet with an action verb and end with a measurable result.",
      section: "experience",
    });
  }
  if (!lengthOk) {
    const tooLong = wc > 900;
    improvements.push({
      id: "length",
      severity: "LOW",
      impactLabel: `${impactRange(2, 4)} readability signal`,
      impactMin: 2,
      impactMax: 4,
      title: tooLong ? "Resume too long" : "Resume too short",
      fix: tooLong
        ? "Trim to 1–2 pages (350–900 words); keep only outcome-driven bullets."
        : "Expand to 350–900 words with more evidenced accomplishments.",
      section: "format",
    });
  }

  const severityRank = { HIGH: 0, MED: 1, LOW: 2 };
  improvements.sort((a, b) => severityRank[a.severity] - severityRank[b.severity] || b.impactMax - a.impactMax);

  // ---- Strengths (prefer the pay-lifting skills the pricing model surfaced) ----
  const liftByName = new Map(estimate.skillsLifting.map((s) => [s.name, s.contribution]));
  const strengthPool = estimate.skillsLifting.length
    ? estimate.skillsLifting
    : profile.skills.filter((s) => (s.level === "Expert" || s.level === "Advanced") && s.demand >= 55);
  const strengths: Strength[] = strengthPool
    .sort((a, b) => b.demand + b.salaryDriver - (a.demand + a.salaryDriver))
    .slice(0, 4)
    .map((s) => {
      const lift = liftByName.get(s.name) ?? 0;
      return {
        title: s.name,
        detail: `${s.level} · demand ${s.demand}/100${lift > 0 ? ` · adds ~${lift.toLocaleString("en-US")} ${estimate.currency}` : ""}`,
        demand: s.demand,
      };
    });

  // ---- Gaps (missing core skills) ----
  const gaps: Gap[] = missingCore
    .map((c) => ({ ...c, def: skillLookup(c.skill) }))
    .sort((a, b) => (b.def?.demand ?? 0) * b.weight - (a.def?.demand ?? 0) * a.weight)
    .slice(0, 4)
    .map((c) => {
      const impactMin = clamp(Math.round(c.weight / 2), 3, 8);
      const impactMax = impactMin + 4;
      return {
        title: c.skill,
        detail: `High-demand core skill for ${roleDef.name} (weight ${c.weight}/10, demand ${c.def?.demand ?? 60}/100).`,
        severity: (c.weight >= 8 ? "HIGH" : c.weight >= 6 ? "MED" : "LOW") as Gap["severity"],
        fix: `Build ${c.skill} and add a bullet that evidences it in production.`,
        impactLabel: `${impactRange(impactMin, impactMax)} salary signal`,
      };
    });

  return { score: scoreValue, improvements, strengths, gaps };
}
