/**
 * Market insights.
 * getInsights(role, location, profile?) → 12-month trend, supply/demand label, emerging/declining
 * skills, remote premium, city premiums and a US/CA/UK country comparison.
 */
import type { Country, InsightsReport, Profile, TrendPoint } from "../types";
import { hash, round } from "@/lib/utils";
import { CITIES, COUNTRY_META, FX_TO_USD } from "@/data/cities";
import { SKILLS } from "@/data/skills";
import { findRoleDef, findLocation } from "./catalog";

/** Supply-to-demand labels (thresholds from docs/ARCHITECTURE.md). */
function marketLabel(sd: number): InsightsReport["marketLabel"] {
  if (sd < 0.5) return "Critically Undersupplied";
  if (sd < 2.5) return "Highly Competitive";
  if (sd < 4) return "Competitive";
  if (sd < 6) return "Balanced";
  return "Saturated";
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function last12Months(): string[] {
  const now = new Date();
  const out: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(`${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`);
  }
  return out;
}

/** Deterministic pseudo-random in [-1, 1] from a seed string. */
function noise(seed: string): number {
  return ((hash(seed) % 2000) / 1000) - 1;
}

/** Country representative multiplier (remote baseline for the country). */
function countryMultiplier(country: Country): number {
  const remote = CITIES.find((c) => c.country === country && c.remote);
  return remote?.multiplier ?? 1;
}

export function getInsights(role: string, location: string, profile?: Profile): InsightsReport {
  void profile;
  const roleDef = findRoleDef(role);
  const loc = findLocation(location);
  const currency = loc.currency;
  const nationalMedian = roleDef.medians.mid;
  const localMedian = round(nationalMedian * loc.multiplier, 500);

  // 12-month trend: seeded walk climbing to the current local median.
  const months = last12Months();
  const trend: TrendPoint[] = months.map((m, i) => {
    const progress = i / 11; // 0 → 1
    const growthBand = 0.06; // ~6% YoY drift
    const base = localMedian * (1 - growthBand * (1 - progress));
    const wobble = 1 + noise(`${roleDef.slug}-${loc.city}-${m}`) * 0.012;
    const demandBase = 100 - roleDef.supplyDemandRatio * 8;
    return {
      month: m,
      median: round(base * wobble, 100),
      demand: Math.round(Math.max(20, Math.min(100, demandBase + noise(`d-${roleDef.slug}-${m}`) * 6 + progress * 4))),
    };
  });

  // Emerging / declining skills for this role (core + related, ranked by YoY trend).
  const coreNames = new Set(roleDef.coreSkills.map((c) => c.skill.toLowerCase()));
  const related = SKILLS.filter(
    (s) => coreNames.has(s.name.toLowerCase()) || roleDef.coreSkills.some((c) => c.skill.toLowerCase() === s.name.toLowerCase()),
  );
  // Widen the pool with same-category skills so trends are meaningful.
  const coreCats = new Set(related.map((s) => s.category));
  const pool = SKILLS.filter((s) => coreCats.has(s.category) || coreNames.has(s.name.toLowerCase()));
  const emergingSkills = [...pool]
    .sort((a, b) => b.trend - a.trend)
    .slice(0, 5)
    .map((s) => ({ skill: s.name, growthPct: s.trend }));
  const decliningSkills = [...pool]
    .sort((a, b) => a.trend - b.trend)
    .slice(0, 5)
    .map((s) => ({ skill: s.name, changePct: s.trend }));

  // Remote premium relative to the average priced city in the region.
  const regionCities = CITIES.filter((c) => c.country === loc.country && !c.remote);
  const avgMult = regionCities.reduce((a, c) => a + c.multiplier, 0) / Math.max(regionCities.length, 1);
  const remoteMult = countryMultiplier(loc.country);
  const remotePremiumPct = Math.round((remoteMult / avgMult - 1) * 100);

  // City premiums for the top 8 cities in the region.
  const cityPremiums = regionCities
    .slice()
    .sort((a, b) => b.multiplier - a.multiplier)
    .slice(0, 8)
    .map((c) => ({
      city: c.city,
      premiumPct: Math.round((c.multiplier - avgMult) / avgMult * 100),
      median: round(nationalMedian * c.multiplier, 500),
    }));

  // Country comparison (US / CA / UK) in local currency + USD.
  const countryComparison = (["US", "CA", "UK"] as Country[]).map((country) => {
    const mult = countryMultiplier(country);
    const meta = COUNTRY_META[country];
    const median = round(nationalMedian * mult, 500);
    return {
      country,
      currency: meta.currency,
      median,
      medianUSD: round(median * FX_TO_USD[meta.currency], 500),
    };
  });

  return {
    role: roleDef.name,
    location: loc.label,
    currency,
    trend,
    supplyDemandRatio: roleDef.supplyDemandRatio,
    marketLabel: marketLabel(roleDef.supplyDemandRatio),
    activeRoles: roleDef.activeRolesUS,
    emergingSkills,
    decliningSkills,
    remotePremiumPct,
    cityPremiums,
    countryComparison,
  };
}
