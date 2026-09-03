/**
 * Recruiter benchmarking.
 * benchmarkJobDescription({title, description, location, industry}) → RecruiterReport with
 * city / level / industry bands, extracted skills and a recommended P40–P65 band.
 */
import type { Level, RecruiterReport } from "../types";
import { round } from "@/lib/utils";
import { CITIES } from "@/data/cities";
import { INDUSTRIES } from "@/data/industries";
import { SKILLS } from "@/data/skills";
import { findLocation, findRoleDef, levelFromYears } from "./catalog";
import { uniq } from "./text";

export interface RecruiterInput {
  title?: string;
  description: string;
  location?: string;
  industry?: string;
}

const ENTRY_RE = /\b(intern|junior|jr\.?|associate|entry|graduate)\b/i;
const SENIOR_RE = /\b(senior|sr\.?|architect)\b/i;
const LEAD_RE = /\b(lead|staff|principal|head|director|vp|chief)\b/i;

function levelFromText(title: string, description: string): Level {
  if (ENTRY_RE.test(title)) return "entry";
  if (LEAD_RE.test(title)) return "lead";
  if (SENIOR_RE.test(title)) return "senior";
  const m = description.match(/(\d{1,2})\s*\+?\s*(?:years?|yrs?)/i);
  if (m) return levelFromYears(parseInt(m[1], 10));
  return "mid";
}

function cityMultiplier(name: string, countryFallback: string): number {
  const inCountry = CITIES.find((c) => c.city === name && c.country === countryFallback && !c.remote);
  if (inCountry) return inCountry.multiplier;
  const any = CITIES.find((c) => c.city === name && !c.remote);
  return any?.multiplier ?? findLocation(name).multiplier;
}

export function benchmarkJobDescription(input: RecruiterInput): RecruiterReport {
  const text = `${input.title ?? ""}\n${input.description ?? ""}`;
  const roleDef = findRoleDef(input.title || input.description || "");
  const level = levelFromText(input.title ?? "", input.description ?? "");
  const loc = findLocation(input.location ?? "");
  const currency = loc.currency;

  const requestedIndustry = input.industry
    ? INDUSTRIES.find((i) => [i.name, ...i.aliases].some((a) => a.toLowerCase() === input.industry!.toLowerCase()))
    : undefined;
  const industryMult = requestedIndustry?.multiplier ?? 1;

  const median = round(roleDef.medians[level] * loc.multiplier * industryMult, 500);
  const range = { min: round(median * roleDef.p25, 500), max: round(median * roleDef.p75, 500) };

  // ---- By city ----
  // Benchmark against cities in the report's OWN country so every row shares the
  // report currency. Reusing US-nominal multipliers under a non-US currency label
  // (e.g. SF figures printed as GBP) mixes currencies in one table.
  const baseCities = CITIES.filter((c) => c.country === loc.country && !c.remote)
    .sort((a, b) => b.multiplier - a.multiplier)
    .slice(0, 4)
    .map((c) => c.city);
  const cityNames = uniq([...baseCities, "__REMOTE__", loc.remote ? "__REMOTE__" : loc.city]);
  const byCity = cityNames.map((name) => {
    if (name === "__REMOTE__") {
      const remote = CITIES.find((c) => c.country === loc.country && c.remote) ?? CITIES.find((c) => c.remote)!;
      const m = remote.multiplier;
      const cityMed = roleDef.medians[level] * m * industryMult;
      return { city: "Remote", min: round(cityMed * 0.9, 500), max: round(cityMed * 1.15, 500) };
    }
    const m = cityMultiplier(name, loc.country);
    const cityMed = roleDef.medians[level] * m * industryMult;
    return { city: name, min: round(cityMed * 0.9, 500), max: round(cityMed * 1.15, 500) };
  });

  // ---- By level ----
  const levelLabels: { label: string; level: Level }[] = [
    { label: "Junior", level: "entry" },
    { label: "Mid-Level", level: "mid" },
    { label: "Senior", level: "senior" },
    { label: "Lead", level: "lead" },
  ];
  const byLevel = levelLabels.map(({ label, level: lvl }) => {
    const med = roleDef.medians[lvl] * loc.multiplier * industryMult;
    return { level: label, min: round(med * 0.9, 500), max: round(med * 1.12, 500) };
  });

  // ---- By industry ----
  const industryNames = ["Technology", "Finance", "Healthcare", "E-commerce"];
  const byIndustry = industryNames.map((name) => {
    const def = INDUSTRIES.find((i) => i.name === name);
    const med = roleDef.medians[level] * loc.multiplier * (def?.multiplier ?? 1);
    return { industry: name, min: round(med * 0.9, 500), max: round(med * 1.12, 500) };
  });

  // ---- Skills extracted from the description ----
  const norm = ` ${text.toLowerCase().replace(/[^a-z0-9+#.]/g, " ").replace(/\s+/g, " ").trim()} `;
  const foundSkills = SKILLS.filter((s) =>
    [s.name, ...s.aliases]
      .filter((t) => !(t.length <= 2 && !/[+#]/.test(t)))
      .some((t) => norm.includes(` ${t.toLowerCase()} `)),
  );
  const coreSet = new Set(roleDef.coreSkills.map((c) => c.skill.toLowerCase()));
  const requiredSkills = uniq(
    foundSkills
      .filter((s) => coreSet.has(s.name.toLowerCase()) || s.demand >= 70)
      .sort((a, b) => b.demand - a.demand)
      .map((s) => s.name),
  ).slice(0, 8);
  const niceToHave = uniq(
    foundSkills
      .filter((s) => !requiredSkills.includes(s.name))
      .sort((a, b) => b.driver - a.driver)
      .map((s) => s.name),
  ).slice(0, 6);

  // ---- Recommended band (P40–P65) ----
  const recommendedBand = { min: round(median * 0.96, 500), max: round(median * 1.08, 500) };

  const notes = [
    `${roleDef.name} · ${level} level benchmark for ${loc.label}, median ${median.toLocaleString("en-US")} ${currency}.`,
    `Supply-to-demand for this role runs ${roleDef.supplyDemandRatio}:1 across ${roleDef.activeRolesUS.toLocaleString("en-US")} active US roles.`,
    requiredSkills.length
      ? `Screen hardest for: ${requiredSkills.slice(0, 4).join(", ")}.`
      : "No standout hard skills detected — lean on level and scope for the band.",
    `Post in the recommended ${recommendedBand.min.toLocaleString("en-US")}–${recommendedBand.max.toLocaleString("en-US")} ${currency} band (P40–P65) to stay competitive without overpaying.`,
  ];

  return {
    title: input.title ?? roleDef.name,
    role: roleDef.name,
    level,
    currency,
    median,
    range,
    byCity,
    byLevel,
    byIndustry,
    requiredSkills,
    niceToHave,
    recommendedBand,
    notes,
  };
}
