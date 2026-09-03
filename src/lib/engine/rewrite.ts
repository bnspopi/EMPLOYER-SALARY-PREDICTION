/**
 * Résumé bullet rewriter.
 * rewriteBullet(bullet, profile?) → stronger bullet: action verb, scope/quantification placeholder,
 * role-aware market language, plus the reasons for each change.
 */
import type { Profile, RewriteSuggestion } from "../types";
import { ACTION_VERBS, WEAK_STARTERS, firstWord, hasQuantification, startsWithActionVerb } from "./text";
import { findRoleDef } from "./catalog";

const WEAK_PHRASES = [
  "responsible for",
  "responsibilities included",
  "duties included",
  "worked on",
  "helped with",
  "helped to",
  "assisted with",
  "in charge of",
  "part of a team that",
  "tasked with",
  "involved in",
];

function lowerFirst(s: string): string {
  return s ? s.charAt(0).toLowerCase() + s.slice(1) : s;
}

function pickVerb(role: string): string {
  // Deterministic verb choice by role family.
  const r = role.toLowerCase();
  if (r.includes("manager") || r.includes("product") || r.includes("lead") || r.includes("director")) return "Led";
  if (r.includes("design")) return "Designed";
  if (r.includes("sales") || r.includes("account")) return "Closed";
  if (r.includes("market")) return "Drove";
  if (r.includes("data") || r.includes("scientist") || r.includes("analyst")) return "Analyzed";
  return "Built";
}

export function rewriteBullet(bullet: string, profile?: Profile): RewriteSuggestion {
  const original = (bullet ?? "").trim().replace(/^[-•*·▪\s]+/, "");
  const reasons: string[] = [];
  let text = original;
  const roleName = profile ? findRoleDef(profile.role).name : "your target role";

  // 1. Ensure it opens with a strong action verb.
  if (!startsWithActionVerb(text)) {
    let body = text;
    const low = body.toLowerCase();
    const phrase = WEAK_PHRASES.find((p) => low.startsWith(p));
    if (phrase) {
      body = body.slice(phrase.length).trim();
    } else if (WEAK_STARTERS.includes(firstWord(body))) {
      body = body.replace(/^\S+\s*/, "").trim();
    }
    const verb = pickVerb(roleName);
    text = `${verb} ${lowerFirst(body) || "the initiative end to end"}`;
    reasons.push(`Opened with the action verb "${verb}" instead of a passive phrase.`);
  }

  // 2. Add a quantification placeholder if there is no number yet.
  if (!hasQuantification(text)) {
    text = text.replace(/[.;\s]+$/, "");
    text = `${text}, driving a measurable result (X%).`;
    reasons.push("Added a quantification placeholder (X%) — recruiters weight measurable impact.");
  } else if (!/[.!?]$/.test(text)) {
    text = `${text}.`;
  }

  // 3. Market language for the role.
  if (profile) {
    const topSkill = profile.skills[0]?.name;
    if (topSkill && !text.toLowerCase().includes(topSkill.toLowerCase())) {
      text = text.replace(/\.$/, "") + `, aligned to ${roleName} priorities using ${topSkill}.`;
      reasons.push(`Framed the outcome against ${roleName} market priorities.`);
    }
  }

  if (reasons.length === 0) {
    reasons.push("Already leads with an action verb and a quantified outcome — kept as is.");
  }

  return { original, rewritten: text, reasons };
}

export function rewriteBullets(bullets: string[], profile?: Profile): RewriteSuggestion[] {
  return bullets.map((b) => rewriteBullet(b, profile));
}

/** Exposed so callers can present the verb palette in the UI. */
export const REWRITE_VERBS = ACTION_VERBS;
