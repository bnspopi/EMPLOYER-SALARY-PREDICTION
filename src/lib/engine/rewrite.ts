import type { Profile, RewriteSuggestion } from "../types";
// STUB — replaced by the engine implementation. Keep signatures.
export function rewriteBullet(bullet: string, profile?: Profile): RewriteSuggestion { void profile; return { original: bullet, rewritten: bullet, reasons: [] }; }
export function rewriteBullets(bullets: string[], profile?: Profile): RewriteSuggestion[] { return bullets.map((b) => rewriteBullet(b, profile)); }
