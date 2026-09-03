import type { Currency } from "./types";

const SYMBOL: Record<Currency, string> = { USD: "$", CAD: "CA$", GBP: "£" };

export function formatMoney(amount: number, currency: Currency = "USD", opts: { compact?: boolean } = {}) {
  const sym = SYMBOL[currency] ?? "$";
  if (opts.compact) {
    if (Math.abs(amount) >= 1_000_000) return `${sym}${(amount / 1_000_000).toFixed(1)}M`;
    if (Math.abs(amount) >= 1000) return `${sym}${Math.round(amount / 1000)}K`;
    return `${sym}${Math.round(amount)}`;
  }
  return `${sym}${Math.round(amount).toLocaleString("en-US")}`;
}

export function formatPct(n: number, digits = 0) {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(digits)}%`;
}

export function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`;
}

export function percentileLabel(p: number) {
  if (p >= 90) return "Top 10%";
  if (p >= 75) return "Top 25%";
  if (p >= 50) return "Top 50%";
  if (p >= 25) return "Bottom 50%";
  return "Bottom 25%";
}
