import type { Level, SkillLevel } from "@/lib/types";

export const LEVEL_LABEL: Record<Level, string> = { entry: "Entry", mid: "Mid-level", senior: "Senior", lead: "Lead" };

export const SKILL_LEVEL_TONE: Record<SkillLevel, "cyan" | "gold" | "neutral" | "amber"> = {
  Expert: "cyan",
  Advanced: "gold",
  General: "neutral",
  Inferred: "amber",
};

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", opts);
}

export function formatCompactNumber(n: number) {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (Math.abs(n) >= 1000) return `${Math.round(n / 1000)}K`;
  return `${Math.round(n)}`;
}

export function demandLabel(demand: number): { label: string; tone: "green" | "cyan" | "amber" | "neutral" } {
  if (demand >= 80) return { label: "Very high", tone: "green" };
  if (demand >= 60) return { label: "High", tone: "cyan" };
  if (demand >= 40) return { label: "Medium", tone: "amber" };
  return { label: "Low", tone: "neutral" };
}

export function wordCount(text: string) {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}
