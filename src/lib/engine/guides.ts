import type { SalaryGuide } from "../types";
import { GUIDES } from "@/data/guides";

/** All 18 salary guides, newest first. */
export function listGuides(): SalaryGuide[] {
  return [...GUIDES].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.title.localeCompare(b.title)));
}

/** Look up a guide by its slug (e.g. "software-engineer-salary-2026"). */
export function getGuide(slug: string): SalaryGuide | undefined {
  const key = slug.trim().toLowerCase();
  return GUIDES.find((g) => g.slug === key);
}

/** Guides that cover the same role family, useful for "further reading". */
export function relatedGuides(slug: string, limit = 3): SalaryGuide[] {
  const current = getGuide(slug);
  if (!current) return listGuides().slice(0, limit);
  const preferred = current.furtherReading ? getGuide(current.furtherReading) : undefined;
  const rest = listGuides().filter((g) => g.slug !== slug && g.slug !== preferred?.slug);
  return [...(preferred ? [preferred] : []), ...rest].slice(0, limit);
}
