/**
 * Canonical cities for the salary engine.
 * `multiplier` converts a USD national median into the LOCAL NOMINAL figure for the city
 * (e.g. London 0.82 → a $115,000 US median becomes £94,300).
 */
import type { CityDef } from "./types";
import type { Country, Currency } from "@/lib/types";

export const COUNTRY_META: Record<Country, { currency: Currency; name: string; flag: string; remoteLabel: string }> = {
  US: { currency: "USD", name: "United States", flag: "🇺🇸", remoteLabel: "Remote (US)" },
  CA: { currency: "CAD", name: "Canada", flag: "🇨🇦", remoteLabel: "Remote (CA)" },
  UK: { currency: "GBP", name: "United Kingdom", flag: "🇬🇧", remoteLabel: "Remote (UK)" },
};

/** Approximate 2026 spot rates used to compare local figures on a USD basis. */
export const FX_TO_USD: Record<Currency, number> = { USD: 1, CAD: 0.73, GBP: 1.27 };

export const CITIES: CityDef[] = [
  // ---- United States (USD) ----
  { city: "San Francisco", country: "US", currency: "USD", multiplier: 1.42, metro: "Bay Area" },
  { city: "New York", country: "US", currency: "USD", multiplier: 1.25, metro: "NYC Metro" },
  { city: "Seattle", country: "US", currency: "USD", multiplier: 1.18, metro: "Puget Sound" },
  { city: "Boston", country: "US", currency: "USD", multiplier: 1.12, metro: "Greater Boston" },
  { city: "Washington DC", country: "US", currency: "USD", multiplier: 1.12, metro: "DMV" },
  { city: "Los Angeles", country: "US", currency: "USD", multiplier: 1.08, metro: "Greater LA" },
  { city: "San Diego", country: "US", currency: "USD", multiplier: 1.06, metro: "San Diego County" },
  { city: "Chicago", country: "US", currency: "USD", multiplier: 1.02, metro: "Chicagoland" },
  { city: "Portland", country: "US", currency: "USD", multiplier: 1.02, metro: "Portland Metro" },
  { city: "Austin", country: "US", currency: "USD", multiplier: 1.0, metro: "Central Texas" },
  { city: "Denver", country: "US", currency: "USD", multiplier: 1.0, metro: "Front Range" },
  { city: "Philadelphia", country: "US", currency: "USD", multiplier: 1.0, metro: "Delaware Valley" },
  { city: "Dallas", country: "US", currency: "USD", multiplier: 0.98, metro: "DFW" },
  { city: "Minneapolis", country: "US", currency: "USD", multiplier: 0.98, metro: "Twin Cities" },
  { city: "Atlanta", country: "US", currency: "USD", multiplier: 0.97, metro: "Metro Atlanta" },
  { city: "Miami", country: "US", currency: "USD", multiplier: 0.96, metro: "South Florida" },
  { city: "Phoenix", country: "US", currency: "USD", multiplier: 0.94, metro: "Valley of the Sun" },
  { city: "Remote", country: "US", currency: "USD", multiplier: 1.0, remote: true },
  // ---- Canada (CAD) ----
  { city: "Toronto", country: "CA", currency: "CAD", multiplier: 1.08, metro: "GTA" },
  { city: "Vancouver", country: "CA", currency: "CAD", multiplier: 1.04, metro: "Lower Mainland" },
  { city: "Waterloo", country: "CA", currency: "CAD", multiplier: 1.0, metro: "Kitchener–Waterloo" },
  { city: "Ottawa", country: "CA", currency: "CAD", multiplier: 1.0, metro: "National Capital Region" },
  { city: "Calgary", country: "CA", currency: "CAD", multiplier: 0.98, metro: "Calgary Metro" },
  { city: "Montreal", country: "CA", currency: "CAD", multiplier: 0.96, metro: "Greater Montreal" },
  { city: "Remote", country: "CA", currency: "CAD", multiplier: 0.98, remote: true },
  // ---- United Kingdom (GBP) ----
  { city: "London", country: "UK", currency: "GBP", multiplier: 0.82, metro: "Greater London" },
  { city: "Cambridge", country: "UK", currency: "GBP", multiplier: 0.72, metro: "Cambridgeshire" },
  { city: "Manchester", country: "UK", currency: "GBP", multiplier: 0.66, metro: "Greater Manchester" },
  { city: "Edinburgh", country: "UK", currency: "GBP", multiplier: 0.66, metro: "Lothian" },
  { city: "Bristol", country: "UK", currency: "GBP", multiplier: 0.66, metro: "West of England" },
  { city: "Birmingham", country: "UK", currency: "GBP", multiplier: 0.62, metro: "West Midlands" },
  { city: "Leeds", country: "UK", currency: "GBP", multiplier: 0.62, metro: "West Yorkshire" },
  { city: "Glasgow", country: "UK", currency: "GBP", multiplier: 0.62, metro: "Greater Glasgow" },
  { city: "Remote", country: "UK", currency: "GBP", multiplier: 0.68, remote: true },
];

/** The 13 + 6 + 7 cities the product surfaces by default (matches the canonical list in the spec). */
export const PRIMARY_CITY_LABELS = [
  "San Francisco, US", "New York, US", "Seattle, US", "Boston, US", "Los Angeles, US", "Chicago, US", "Austin, US",
  "Denver, US", "Atlanta, US", "Dallas, US", "Miami, US", "Washington DC, US", "Remote (US)",
  "Toronto, CA", "Vancouver, CA", "Montreal, CA", "Calgary, CA", "Ottawa, CA", "Remote (CA)",
  "London, UK", "Manchester, UK", "Edinburgh, UK", "Birmingham, UK", "Bristol, UK", "Cambridge, UK", "Remote (UK)",
] as const;

export function cityLabel(c: Pick<CityDef, "city" | "country" | "remote">): string {
  return c.remote ? COUNTRY_META[c.country].remoteLabel : `${c.city}, ${c.country}`;
}
