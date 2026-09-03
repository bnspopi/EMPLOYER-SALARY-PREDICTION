/**
 * Résumé / job-description parser + top-level analysis composer.
 * parseResume(text) → Profile (skills, level, years, education, location, …), contacts stripped.
 * analyzeResume(input) → Analysis (parse → estimate → score → brief → certifications → roadmap).
 * Pure, deterministic, runs client-side. Target: < 50 ms for a 900-word résumé.
 */
import type {
  Analysis,
  Level,
  LocationOption,
  Profile,
  SkillLevel,
  SkillRating,
} from "../types";
import { clamp, hash } from "@/lib/utils";
import { SKILLS } from "@/data/skills";
import { CITIES } from "@/data/cities";
import { CERTS } from "@/data/certs";
import { INDUSTRIES } from "@/data/industries";
import { findLocation, findRole, findRoleDef, levelFromYears } from "./catalog";
import { estimate } from "./pricing";
import { score } from "./scoring";
import { brief } from "./negotiation";
import { certificationsFor, roadmapFor } from "./roadmap";
import { ACTION_VERBS, uniq } from "./text";

/* ------------------------------------------------------------------ */
/*  Text utilities                                                     */
/* ------------------------------------------------------------------ */

const EMAIL_RE = /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi;
const PHONE_RE = /(\+?\d[\d\s().-]{7,}\d)/g;
const URL_RE = /\b(?:https?:\/\/|www\.)\S+/gi;
const HANDLE_RE = /\b(?:linkedin\.com|github\.com|twitter\.com|x\.com)\/\S+/gi;

/** Remove emails, phones, URLs and social handles for pricing. */
function stripContacts(text: string): string {
  return text
    .replace(EMAIL_RE, " ")
    .replace(URL_RE, " ")
    .replace(HANDLE_RE, " ")
    .replace(PHONE_RE, " ");
}

/** Normalize to lowercase, keeping tokens the skill/alias tables use (+ # .). */
function normForMatch(text: string): string {
  return ` ${text.toLowerCase().replace(/[^a-z0-9+#.]/g, " ").replace(/\s+/g, " ").trim()} `;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Count boundary-aware occurrences of a token inside pre-normalized text. */
function countToken(normText: string, token: string): number {
  if (!token) return 0;
  const esc = escapeRe(token.toLowerCase());
  const re = new RegExp(`(?<![a-z0-9])${esc}(?![a-z0-9])`, "g");
  const m = normText.match(re);
  return m ? m.length : 0;
}

const HEADING_RE =
  /^(summary|profile|about|objective|professional summary|experience|employment|work experience|work history|education|skills|technical skills|core competencies|competencies|tools|tech stack|projects|certifications?|licenses?|awards|interests|contact|references)\b/i;

function isHeading(line: string): boolean {
  const t = line.trim();
  if (!t || t.length > 40) return false;
  return HEADING_RE.test(t);
}

/** Return the text block that follows a heading matched by `re`, up to the next heading. */
function sectionText(lines: string[], re: RegExp): string {
  const idx = lines.findIndex((l) => re.test(l.trim()));
  if (idx === -1) return "";
  const out: string[] = [];
  for (let i = idx + 1; i < lines.length; i++) {
    if (isHeading(lines[i])) break;
    out.push(lines[i]);
  }
  return out.join("\n");
}

/* ------------------------------------------------------------------ */
/*  Field extractors                                                   */
/* ------------------------------------------------------------------ */

const ENTRY_WORDS = /\b(intern|internship|junior|jr\.?|associate|entry[- ]level|graduate|trainee|apprentice)\b/i;
const LEAD_WORDS = /\b(lead|staff|principal|head|director|vp|svp|evp|chief|cto|ceo|founder)\b/i;

const ROLE_KEYWORD_RE =
  /\b(engineer|developer|manager|designer|analyst|scientist|architect|specialist|consultant|lead|director|administrator|recruiter|nurse|accountant|representative|executive|strategist|master|coordinator|programmer|marketer|operations|producer|writer|technician|nurse)\b/i;

function detectTitles(lines: string[]): { titles: string[]; primary: string } {
  const candidates: string[] = [];
  // Top-of-résumé lines (name/title block).
  for (const l of lines.slice(0, 8)) {
    const t = l.trim();
    if (t && t.length <= 70 && ROLE_KEYWORD_RE.test(t)) candidates.push(t);
  }
  // Titles inside experience blocks.
  const exp = sectionText(lines, /^(experience|employment|work experience|work history)\b/i);
  for (const l of exp.split("\n")) {
    const t = l.trim();
    if (t && t.length <= 70 && ROLE_KEYWORD_RE.test(t)) candidates.push(t);
  }
  if (candidates.length === 0) {
    // Fall back to any role-ish line.
    for (const l of lines) {
      const t = l.trim();
      if (t && t.length <= 70 && ROLE_KEYWORD_RE.test(t)) {
        candidates.push(t);
        break;
      }
    }
  }
  const roles = uniq(candidates.map((c) => findRole(c)));
  const primary = candidates[0] ?? roles[0] ?? "Software Engineer";
  return { titles: roles.length ? roles : ["Software Engineer"], primary };
}

function detectYears(text: string): number {
  let years = 0;
  const nowYear = 2026;

  // Explicit "N years" phrases.
  let phrase = 0;
  const pm = text.matchAll(/(\d{1,2})\s*\+?\s*years?(?:\s+of)?/gi);
  for (const m of pm) {
    const n = parseInt(m[1], 10);
    if (n <= 45 && n > phrase) phrase = n;
  }

  // Date ranges → career span (earliest start → latest end).
  // An optional leading month token is allowed on each side so "Jan 2020 — Mar 2022"
  // and "January 2018 - December 2023" parse the same as bare year ranges.
  const rangeRe =
    /(?:[A-Za-z]{3,9}\.?\s+)?((?:19|20)\d{2})\s*(?:–|-|—|to|until)\s*(?:[A-Za-z]{3,9}\.?\s+)?((?:19|20)\d{2}|present|current|now|today)/gi;
  let minStart = Infinity;
  let maxEnd = -Infinity;
  for (const m of text.matchAll(rangeRe)) {
    const start = parseInt(m[1], 10);
    const endTok = m[2].toLowerCase();
    const end = /\d{4}/.test(endTok) ? parseInt(endTok, 10) : nowYear;
    if (start >= 1970 && start <= nowYear) minStart = Math.min(minStart, start);
    if (end >= 1970 && end <= nowYear + 1) maxEnd = Math.max(maxEnd, end);
  }
  const span = Number.isFinite(minStart) && Number.isFinite(maxEnd) ? Math.max(0, maxEnd - minStart) : 0;

  years = Math.max(phrase, span);
  return clamp(years, 0, 45);
}

function levelFromTitle(title: string, years: number): Level {
  if (ENTRY_WORDS.test(title)) return "entry";
  if (LEAD_WORDS.test(title)) return "lead";
  if (/\b(senior|sr\.?|architect)\b/i.test(title)) return "senior";
  return levelFromYears(years);
}

/** Skill inference from context phrases (rated "Inferred"). */
const INFERENCE: { re: RegExp; skill: string }[] = [
  { re: /\ba\/b test|split test|experiment(?:ation|s)?\b/i, skill: "A/B Testing" },
  { re: /\broadmap/i, skill: "Product Roadmapping" },
  { re: /\bstakeholder/i, skill: "Stakeholder Management" },
  { re: /\bmentor(?:ed|ing|ship)?\b/i, skill: "Mentoring" },
  { re: /\bmanaged a team|team of \d|direct reports?\b/i, skill: "Team Leadership" },
  { re: /\bcross[- ]functional/i, skill: "Cross-functional Leadership" },
  { re: /\bwrote (?:tests|unit tests)|test coverage\b/i, skill: "Unit Testing" },
  { re: /\bci\/cd|continuous (?:integration|deployment)\b/i, skill: "CI/CD" },
  { re: /\bgo[- ]to[- ]market|product launch(?:es)?\b/i, skill: "Go-to-Market Strategy" },
];

function detectSkills(
  normText: string,
  normSkills: string,
  normSummary: string,
  rawText: string,
): SkillRating[] {
  const ratings: SkillRating[] = [];
  const owned = new Set<string>();

  for (const def of SKILLS) {
    const tokens: string[] = [];
    if (!(def.name.length <= 2 && !/[+#]/.test(def.name))) tokens.push(def.name);
    tokens.push(...def.aliases);

    let freq = 0;
    for (const tk of tokens) freq += countToken(normText, tk);
    if (freq === 0) continue;

    const inSkills = tokens.some((tk) => countToken(normSkills, tk) > 0);
    const inSummary = tokens.some((tk) => countToken(normSummary, tk) > 0);

    let level: SkillLevel;
    if ((inSkills && freq >= 2) || freq >= 3) level = "Expert";
    else if (inSkills || freq === 2) level = "Advanced";
    else level = "General";

    const confidence = clamp(45 + freq * 12 + (inSkills ? 12 : 0) + (inSummary ? 6 : 0), 40, 98);

    ratings.push({
      name: def.name,
      category: def.category,
      level,
      confidence,
      salaryDriver: def.driver,
      demand: def.demand,
      contribution: 0,
    });
    owned.add(def.name.toLowerCase());
  }

  // Inferred skills from context (only if not already explicit).
  for (const inf of INFERENCE) {
    if (owned.has(inf.skill.toLowerCase())) continue;
    if (!inf.re.test(rawText)) continue;
    const def = SKILLS.find((s) => s.name === inf.skill);
    if (!def) continue;
    ratings.push({
      name: def.name,
      category: def.category,
      level: "Inferred",
      confidence: clamp(42 + (inSummaryFlag(normSummary, def.name) ? 6 : 0), 40, 60),
      salaryDriver: def.driver,
      demand: def.demand,
      contribution: 0,
    });
    owned.add(inf.skill.toLowerCase());
  }

  const levelRank: Record<SkillLevel, number> = { Expert: 0, Advanced: 1, General: 2, Inferred: 3 };
  ratings.sort(
    (a, b) => levelRank[a.level] - levelRank[b.level] || b.confidence + b.salaryDriver - (a.confidence + a.salaryDriver),
  );
  return ratings.slice(0, 30);
}

function inSummaryFlag(normSummary: string, name: string): boolean {
  return countToken(normSummary, name.toLowerCase()) > 0;
}

function detectEducation(lines: string[]): string[] {
  const eduRe =
    /\b(university|college|institute of technology|b\.?s\.?c?\.?|b\.?a\.?|m\.?s\.?c?\.?|m\.?b\.?a\.?|bachelor|master|ph\.?d|doctorate|degree|diploma)\b/i;
  const edu = sectionText(lines, /^education\b/i);
  const pool = edu ? edu.split("\n") : lines;
  const out: string[] = [];
  for (const l of pool) {
    const t = l.trim();
    if (t && t.length <= 120 && eduRe.test(t)) out.push(t.replace(/^[-•*\s]+/, ""));
  }
  return uniq(out).slice(0, 4);
}

function detectCertifications(normText: string): string[] {
  const out: string[] = [];
  for (const cert of CERTS) {
    if (countToken(normText, cert.name.toLowerCase()) > 0) {
      out.push(cert.name);
      continue;
    }
    // Distinctive short forms.
    const short = cert.name.match(/\(([^)]+)\)/);
    if (short && short[1].length >= 3 && countToken(normText, short[1].toLowerCase()) > 0) {
      out.push(cert.name);
    }
  }
  return uniq(out).slice(0, 8);
}

function detectIndustry(normText: string): string {
  let best = "Technology";
  let bestScore = 0;
  for (const ind of INDUSTRIES) {
    let sc = 0;
    for (const alias of [ind.name, ...ind.aliases]) sc += countToken(normText, alias.toLowerCase());
    if (sc > bestScore) {
      bestScore = sc;
      best = ind.name;
    }
  }
  return best;
}

function detectEmploymentType(normText: string): string {
  if (/\bintern(ship)?\b/.test(normText)) return "Internship";
  if (/\b(contract|contractor|freelance|consultant)\b/.test(normText)) return "Contract";
  if (/\bpart.time\b/.test(normText)) return "Part-time";
  return "Full-time";
}

function detectEmployerType(normText: string): string {
  if (/\b(startup|early.stage|seed|series [abcd]|pre.seed|founding)\b/.test(normText)) return "Startup";
  if (/\b(agency|consultancy|consulting|systems integrator)\b/.test(normText)) return "Agency";
  if (/\b(government|public sector|federal|municipal|nonprofit|non.profit|ngo|civil service)\b/.test(normText))
    return "Public sector";
  return "Enterprise";
}

function detectLocation(normText: string, rawLines: string[]): { loc: LocationOption; remote: Profile["remotePreference"] } {
  let remote: Profile["remotePreference"] = "unknown";
  if (/\bremote\b|work from home|\bwfh\b/.test(normText)) remote = "remote";
  else if (/\bhybrid\b/.test(normText)) remote = "hybrid";
  else if (/\bon.?site\b|in office|in-office/.test(normText)) remote = "onsite";

  // Find the earliest known city name mentioned.
  let bestCity = "";
  let bestPos = Infinity;
  const uniqueCityNames = uniq(CITIES.filter((c) => !c.remote).map((c) => c.city));
  for (const city of uniqueCityNames) {
    const pos = normText.indexOf(` ${city.toLowerCase()} `);
    if (pos !== -1 && pos < bestPos) {
      bestPos = pos;
      bestCity = city;
    }
  }
  void rawLines;

  if (bestCity) {
    const loc = findLocation(bestCity);
    return { loc: remote === "remote" ? { ...loc, remote: true } : loc, remote };
  }
  if (remote === "remote") return { loc: findLocation("Remote (US)"), remote };
  return { loc: findLocation(""), remote };
}

function detectSummary(lines: string[]): string {
  const explicit = sectionText(lines, /^(summary|profile|about|objective|professional summary)\b/i);
  if (explicit.trim()) {
    return explicit.split("\n").map((l) => l.trim()).filter(Boolean).join(" ").slice(0, 400);
  }
  // First substantial paragraph that is not a heading / contact line.
  for (let i = 0; i < Math.min(lines.length, 12); i++) {
    const t = lines[i].trim();
    if (!t || isHeading(t)) continue;
    if (/@|\bhttps?:|\bwww\.|\+?\d[\d\s().-]{7,}/.test(t)) continue;
    if (t.length >= 60 && /\s/.test(t)) return t.slice(0, 400);
  }
  return "";
}

function detectBullets(lines: string[]): string[] {
  const verbRe = new RegExp(`^(?:${ACTION_VERBS.join("|")})\\b`, "i");
  const out: string[] = [];
  for (const l of lines) {
    const t = l.trim();
    if (!t) continue;
    if (/^[-•*·▪]/.test(t)) {
      out.push(t.replace(/^[-•*·▪\s]+/, "").trim());
    } else if (verbRe.test(t) && t.length > 20 && t.length < 300) {
      out.push(t);
    }
  }
  return out.slice(0, 40);
}

/* ------------------------------------------------------------------ */
/*  parseResume                                                        */
/* ------------------------------------------------------------------ */

export function parseResume(text: string, opts: { displayName?: string } = {}): Profile {
  const rawText = text ?? "";
  const clean = stripContacts(rawText);
  const lines = rawText.split(/\r?\n/);
  const normText = normForMatch(clean);

  const skillsSection = sectionText(lines, /^(skills|technical skills|core competencies|competencies|tools|tech stack)\b/i);
  const summary = detectSummary(lines);
  const normSkills = normForMatch(skillsSection);
  const normSummary = normForMatch(summary);

  const { titles, primary } = detectTitles(lines);
  const role = findRole(primary);
  const roleDef = findRoleDef(primary);

  // Parse dates from the raw text, not the contact-stripped text: the phone stripper's
  // char-class also eats hyphenated year ranges ("2015 - 2022"), zeroing career span.
  const years = detectYears(rawText);
  const level = levelFromTitle(primary, years);
  const effectiveYears = years > 0 ? years : { entry: 1, mid: 3, senior: 6, lead: 11 }[level];

  const skills = detectSkills(normText, normSkills, normSummary, rawText);
  const education = detectEducation(lines);
  const certifications = detectCertifications(normText);
  const industry = detectIndustry(normText);
  const employmentType = detectEmploymentType(normText);
  const employerType = detectEmployerType(normText);
  const { loc, remote } = detectLocation(normText, lines);
  const bullets = detectBullets(lines);
  const wordCount = clean.split(/\s+/).filter(Boolean).length;

  const displayName = opts.displayName?.trim() || "You";
  const title = primary.length <= 70 ? primary : roleDef.ladder[level].title;

  return {
    id: `p_${hash(rawText)}`,
    displayName,
    title,
    titles,
    role,
    level,
    yearsExperience: effectiveYears,
    skills,
    education,
    certifications,
    employmentType,
    employerType,
    industry,
    location: loc,
    remotePreference: remote,
    summary,
    bullets,
    rawText,
    wordCount,
  };
}

/* ------------------------------------------------------------------ */
/*  analyzeResume                                                      */
/* ------------------------------------------------------------------ */

export interface AnalyzeInput {
  text: string;
  resumeId?: string;
  displayName?: string;
  targetRole?: string;
  targetLocation?: string;
}

export function analyzeResume(input: AnalyzeInput): Analysis {
  const profile = parseResume(input.text, { displayName: input.displayName });
  if (input.targetLocation) {
    profile.location = findLocation(input.targetLocation);
  }

  const est = estimate(profile);
  const sc = score(profile, est);
  const br = brief(est, profile);
  const certifications = certificationsFor(profile.role, profile.location.label, profile);
  const roadmap = roadmapFor(profile, input.targetRole, est.median);

  return {
    id: `a_${hash(input.text ?? "")}`,
    resumeId: input.resumeId ?? `r_${hash(input.text ?? "")}`,
    createdAt: new Date().toISOString(),
    profile,
    estimate: est,
    score: sc,
    brief: br,
    certifications,
    roadmap,
    targetRole: input.targetRole,
  };
}
