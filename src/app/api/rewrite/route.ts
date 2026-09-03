import { rewriteBullets } from "@/lib/engine";
import type { RewriteSuggestion } from "@/lib/types";

/**
 * POST /api/rewrite — strengthen résumé bullets.
 * Body: { bullets: string[] }.
 * Deterministic by default (rewriteBullets); if ANTHROPIC_API_KEY is set it upgrades
 * each bullet via the Anthropic Messages API, falling back to the deterministic
 * rewrite on any error.
 */

interface RewriteBody {
  bullets?: unknown;
}

interface AnthropicContentBlock {
  type?: string;
  text?: string;
}

async function anthropicRewrite(bullets: string[]): Promise<string[] | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  try {
    const numbered = bullets.map((b, i) => `${i + 1}. ${b}`).join("\n");
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 800,
        system:
          "You rewrite résumé bullet points to be stronger: open with a strong action verb, add scope and a " +
          "quantified result, and cut filler. Return ONLY a JSON array of strings — one rewritten bullet per input, " +
          "in the same order. No commentary, no markdown fences.",
        messages: [{ role: "user", content: `Rewrite these bullets:\n${numbered}` }],
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { content?: AnthropicContentBlock[] };
    const text = Array.isArray(data.content)
      ? data.content
          .filter((b) => b?.type === "text" && typeof b.text === "string")
          .map((b) => b.text as string)
          .join("")
          .trim()
      : "";
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]) as unknown;
    if (!Array.isArray(parsed) || parsed.length !== bullets.length) return null;
    if (!parsed.every((x) => typeof x === "string" && x.trim())) return null;
    return parsed as string[];
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  let body: RewriteBody;
  try {
    body = (await req.json()) as RewriteBody;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const bullets = Array.isArray(body.bullets)
    ? body.bullets.filter((b): b is string => typeof b === "string" && b.trim().length > 0)
    : [];
  if (bullets.length === 0) {
    return Response.json({ error: "Provide at least one bullet." }, { status: 422 });
  }

  const deterministic = rewriteBullets(bullets);
  const live = await anthropicRewrite(bullets);

  const suggestions: RewriteSuggestion[] = deterministic.map((s, i) =>
    live
      ? { original: s.original, rewritten: live[i], reasons: ["Rewritten by AI for impact, scope and a quantified outcome."] }
      : s,
  );

  return Response.json({ suggestions, source: live ? "anthropic" : "engine" });
}
