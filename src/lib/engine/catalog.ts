/**
 * Pure, fast lookup helpers over the seed data in src/data.
 * No React, no network — every function is deterministic.
 */
import type { Country, Level, LocationOption } from "../types";
import type { CityDef, RoleDef, SkillDef } from "@/data/types";
import { ROLES } from "@/data/roles";
import { CITIES, COUNTRY_META, cityLabel } from "@/data/cities";
import { SKILLS } from "@/data/skills";

/* ---------------- Levels ---------------- */

export const LEVELS: Level[] = ["entry", "mid", "senior", "lead"];

/** Map raw years of experience onto a career level. */
export function levelFromYears(years: number): Level {
  if (!Number.isFinite(years) || years < 2) return "entry";
  if (years < 5) return "mid";
  if (years < 9) return "senior";
  return "lead";
}

/* ---------------- Text helpers ---------------- */

function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/[._/]+/g, " ")
    .replace(/[^a-z0-9\s+#&,-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Words that describe seniority/segment but do not identify the role itself. */
const NOISE = new Set([
  "sr", "snr", "senior", "jr", "junior", "lead", "principal", "staff", "associate", "entry",
  "level", "mid", "intermediate", "chief", "head", "of", "the", "a", "an", "and", "i", "ii",
  "iii", "iv", "v", "1", "2", "3", "4", "vp", "svp", "evp", "global", "regional",
]);

function tokens(s: string): string[] {
  return norm(s)
    .split(/[\s,]+/)
    .filter((t) => t.length > 0 && !NOISE.has(t));
}

/* ---------------- Roles ---------------- */

export function listRoles(): string[] {
  return ROLES.map((r) => r.name);
}

/** Build a normalized alias → canonical map once, at module load. */
const ROLE_INDEX: { canonical: string; keys: string[]; tokenSet: Set<string>; def: RoleDef }[] = ROLES.map(
  (r) => {
    const keys = [r.name, ...r.aliases].map(norm);
    const tokenSet = new Set<string>();
    tokens(r.name).forEach((t) => tokenSet.add(t));
    r.aliases.forEach((a) => tokens(a).forEach((t) => tokenSet.add(t)));
    return { canonical: r.name, keys, tokenSet, def: r };
  },
);

/** Fuzzy-match an arbitrary job title to a canonical role name. */
export function findRole(query: string): string {
  return findRoleDef(query).name;
}

/** Fuzzy-match to the full RoleDef; always returns a role (falls back to Software Engineer). */
export function findRoleDef(query: string): RoleDef {
  const q = norm(query ?? "");
  if (!q) return ROLES[0];

  // 1. exact name / alias hit
  for (const entry of ROLE_INDEX) {
    if (entry.keys.includes(q)) return entry.def;
  }

  const qTokens = tokens(query ?? "");
  if (qTokens.length === 0) return ROLES[0];
  const qSet = new Set(qTokens);

  // 2. substring alias hit (e.g. "senior product manager ii" contains "product manager")
  for (const entry of ROLE_INDEX) {
    for (const key of entry.keys) {
      if (key.length >= 4 && (q.includes(key) || key.includes(q))) return entry.def;
    }
  }

  // 3. best token-overlap score (Jaccard-ish, weighted by coverage of the role's tokens)
  let best: RoleDef | null = null;
  let bestScore = 0;
  for (const entry of ROLE_INDEX) {
    let shared = 0;
    for (const t of entry.tokenSet) if (qSet.has(t)) shared += 1;
    if (shared === 0) continue;
    const coverage = shared / entry.tokenSet.size;
    const precision = shared / qSet.size;
    const score = shared + coverage * 0.6 + precision * 0.4;
    if (score > bestScore) {
      bestScore = score;
      best = entry.def;
    }
  }
  if (best) return best;

  // 4. fall back to the default role
  return ROLES[0];
}

/* ---------------- Skills ---------------- */

const SKILL_INDEX = new Map<string, SkillDef>();
for (const skill of SKILLS) {
  SKILL_INDEX.set(norm(skill.name), skill);
  for (const alias of skill.aliases) SKILL_INDEX.set(norm(alias), skill);
}

/** Return the SkillDef for a name or alias, or undefined. */
export function skillLookup(name: string): SkillDef | undefined {
  if (!name) return undefined;
  return SKILL_INDEX.get(norm(name));
}

/** Return the canonical skill name for a raw string, or undefined if unknown. */
export function normalizeSkill(raw: string): string | undefined {
  return skillLookup(raw)?.name;
}

/* ---------------- Cities / locations ---------------- */

function toLocation(c: CityDef): LocationOption {
  return {
    city: c.city,
    country: c.country,
    currency: c.currency,
    label: cityLabel(c),
    multiplier: c.multiplier,
    remote: c.remote,
  };
}

const DEFAULT_CITY: CityDef =
  CITIES.find((c) => c.country === "US" && c.remote) ?? CITIES[0];

export function listLocations(): LocationOption[] {
  return CITIES.map(toLocation);
}

/** Explicit abbreviations and colloquial names that token matching would miss. */
const CITY_ALIASES: Record<string, { city: string; country: Country }> = {
  la: { city: "Los Angeles", country: "US" },
  "l a": { city: "Los Angeles", country: "US" },
  sf: { city: "San Francisco", country: "US" },
  "san fran": { city: "San Francisco", country: "US" },
  "bay area": { city: "San Francisco", country: "US" },
  silicon: { city: "San Francisco", country: "US" },
  nyc: { city: "New York", country: "US" },
  ny: { city: "New York", country: "US" },
  "new york city": { city: "New York", country: "US" },
  manhattan: { city: "New York", country: "US" },
  dc: { city: "Washington DC", country: "US" },
  "washington d c": { city: "Washington DC", country: "US" },
  washington: { city: "Washington DC", country: "US" },
  philly: { city: "Philadelphia", country: "US" },
  atl: { city: "Atlanta", country: "US" },
  "the bay": { city: "San Francisco", country: "US" },
  yyz: { city: "Toronto", country: "CA" },
  ldn: { city: "London", country: "UK" },
};

function countryFromToken(t: string): Country | undefined {
  if (["us", "usa", "united states", "u s", "america", "american"].includes(t)) return "US";
  if (["ca", "canada", "canadian"].includes(t)) return "CA";
  if (["uk", "gb", "gbr", "united kingdom", "britain", "british", "england"].includes(t)) return "UK";
  return undefined;
}

/**
 * Resolve almost any location string to a LocationOption.
 * Accepts "Los Angeles", "los angeles, us", "LA", "London", "Remote", "remote uk",
 * "San Francisco, US", "Remote (CA)", etc. Always returns a value.
 */
export function findLocation(query: string): LocationOption {
  const raw = norm(query ?? "");
  if (!raw) return toLocation(DEFAULT_CITY);

  // Detect an explicit country anywhere in the string.
  let country: Country | undefined;
  const parenthetical = raw.match(/\(([^)]+)\)/);
  if (parenthetical) country = countryFromToken(parenthetical[1].trim());
  if (!country) {
    const parts = raw.split(",").map((p) => p.trim());
    for (const p of parts) {
      const c = countryFromToken(p);
      if (c) country = c;
    }
  }
  if (!country) {
    for (const t of raw.split(/[\s,()]+/)) {
      const c = countryFromToken(t);
      if (c) {
        country = c;
        break;
      }
    }
  }

  const isRemote = /\bremote\b|\banywhere\b|work from home|wfh/.test(raw);
  if (isRemote) {
    const remoteCountry = country ?? "US";
    const remoteCity = CITIES.find((c) => c.remote && c.country === remoteCountry);
    if (remoteCity) return toLocation(remoteCity);
  }

  // Strip country/remote noise to isolate the city phrase.
  const cityPhrase = raw
    .replace(/\(([^)]+)\)/g, " ")
    .replace(/\b(remote|anywhere|hybrid|onsite|on-site|us|usa|united states|america|ca|canada|uk|gb|united kingdom|britain|england)\b/g, " ")
    .replace(/,/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Alias table (respect a detected country when the alias is ambiguous).
  const aliasHit = CITY_ALIASES[cityPhrase];
  if (aliasHit) {
    const match = CITIES.find(
      (c) => c.city === aliasHit.city && c.country === (country ?? aliasHit.country),
    ) ?? CITIES.find((c) => c.city === aliasHit.city);
    if (match) return toLocation(match);
  }

  // Direct city-name match (optionally constrained to the detected country).
  const candidates = country ? CITIES.filter((c) => c.country === country) : CITIES;
  if (cityPhrase) {
    const exact = candidates.find((c) => norm(c.city) === cityPhrase && !c.remote);
    if (exact) return toLocation(exact);
    const partial = candidates.find(
      (c) => !c.remote && (norm(c.city).includes(cityPhrase) || cityPhrase.includes(norm(c.city))),
    );
    if (partial) return toLocation(partial);
    // Metro-area match (e.g. "puget sound" → Seattle).
    const metro = candidates.find((c) => c.metro && norm(c.metro).includes(cityPhrase));
    if (metro) return toLocation(metro);
  }

  // Country known but city unresolved → that country's remote baseline.
  if (country) {
    const remoteCity = CITIES.find((c) => c.remote && c.country === country);
    if (remoteCity) return toLocation(remoteCity);
    const anyCity = CITIES.find((c) => c.country === country);
    if (anyCity) return toLocation(anyCity);
  }

  return toLocation(DEFAULT_CITY);
}

/** Resolve a label or bare city name to the underlying CityDef. */
export function findCity(labelOrCity: string): CityDef {
  const raw = norm(labelOrCity ?? "");
  if (!raw) return DEFAULT_CITY;

  // Match against the canonical "City, CC" / remote label first.
  for (const c of CITIES) {
    if (norm(cityLabel(c)) === raw) return c;
    if (norm(COUNTRY_META[c.country].remoteLabel) === raw && c.remote) return c;
  }
  // Fall back to the resolver, then map the LocationOption back to a CityDef.
  const loc = findLocation(labelOrCity);
  return (
    CITIES.find((c) => c.city === loc.city && c.country === loc.country && !!c.remote === !!loc.remote) ??
    CITIES.find((c) => c.city === loc.city && c.country === loc.country) ??
    DEFAULT_CITY
  );
}
