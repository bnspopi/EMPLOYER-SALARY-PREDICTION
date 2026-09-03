/**
 * Shared, dependency-free text helpers for the engine.
 * Pure functions only — no React, no network, deterministic.
 */

/** Strong action verbs used to detect and generate outcome-oriented bullets. */
export const ACTION_VERBS: string[] = [
  "led", "built", "shipped", "launched", "designed", "developed", "created", "drove", "delivered",
  "owned", "managed", "scaled", "grew", "increased", "reduced", "improved", "optimized", "cut",
  "accelerated", "automated", "architected", "implemented", "engineered", "spearheaded", "founded",
  "established", "directed", "coordinated", "negotiated", "closed", "generated", "boosted", "streamlined",
  "migrated", "refactored", "modernized", "mentored", "coached", "hired", "restructured", "transformed",
  "championed", "orchestrated", "pioneered", "unified", "consolidated", "standardized", "shortened",
  "resolved", "analyzed", "researched", "defined", "prioritized", "roadmapped", "partnered", "aligned",
];

const ACTION_SET = new Set(ACTION_VERBS);

/** Weak verbs / duty phrases that signal a bullet describes responsibilities, not outcomes. */
export const WEAK_STARTERS: string[] = [
  "responsible", "responsibilities", "worked", "helped", "assisted", "handled", "involved",
  "participated", "supported", "tasked", "duties", "in charge", "part of", "contributed",
];

const WEAK_SET = new Set(WEAK_STARTERS);

/** Matches a quantified signal: %, $, k/K/M suffixes, or a bare number of 2+ digits. */
const QUANT_RE = /(\$\s?\d|\d+\s?%|\b\d{2,}(?:[.,]\d+)?\s?(?:k|m|bn|b|x|users|customers|people|engineers|reports|months?|weeks?|days?|hours?|percent|million|thousand|billion)?\b)/i;

export function hasQuantification(s: string): boolean {
  return QUANT_RE.test(s);
}

export function firstWord(s: string): string {
  const m = s.trim().replace(/^[-•*•\s]+/, "").match(/[A-Za-z']+/);
  return m ? m[0].toLowerCase() : "";
}

export function startsWithActionVerb(s: string): boolean {
  return ACTION_SET.has(firstWord(s));
}

export function isDutyBullet(s: string): boolean {
  const w = firstWord(s);
  if (WEAK_SET.has(w)) return true;
  const low = s.toLowerCase();
  return WEAK_STARTERS.some((p) => p.includes(" ") && low.includes(p));
}

/** Split a block of text into sentences (rough but deterministic). */
export function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?;])\s+|\s*[\n\r]+\s*/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}

/** De-duplicate while preserving order. */
export function uniq<T>(items: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const it of items) {
    const key = typeof it === "string" ? it.toLowerCase() : JSON.stringify(it);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  return out;
}

/** Turn a min/max pair into a "+8–12%" style label. */
export function impactRange(min: number, max: number, suffix = "%"): string {
  return `+${min}–${max}${suffix}`;
}

/** Join a list into an English clause: "a, b and c". */
export function joinAnd(items: string[]): string {
  const clean = items.filter(Boolean);
  if (clean.length === 0) return "";
  if (clean.length === 1) return clean[0];
  if (clean.length === 2) return `${clean[0]} and ${clean[1]}`;
  return `${clean.slice(0, -1).join(", ")} and ${clean[clean.length - 1]}`;
}

/** Today's date as an ISO date string (deterministic per day). */
export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Count occurrences of a lowercase needle across a lowercased haystack. */
export function countMatches(haystack: string, re: RegExp): number {
  const m = haystack.match(re);
  return m ? m.length : 0;
}
