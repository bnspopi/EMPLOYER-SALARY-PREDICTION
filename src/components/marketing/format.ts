/** Date + reading-time helpers for marketing pages (timezone-safe for YYYY-MM-DD strings). */
export function formatDate(iso: string, opts: { month?: "long" | "short" } = {}) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  const d = m ? new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))) : new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: opts.month ?? "long", day: "numeric", timeZone: "UTC" });
}

export function readingTime(paragraphs: string[]) {
  const words = paragraphs.join(" ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

/** Only allow same-origin relative paths as auth callbacks. */
export function safeCallback(url: string | null | undefined, fallback = "/dashboard") {
  if (!url) return fallback;
  if (!url.startsWith("/") || url.startsWith("//") || url.includes("\\") || /^\/[a-z]+:/i.test(url)) return fallback;
  return url;
}
