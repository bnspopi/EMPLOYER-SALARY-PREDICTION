import { coachReply } from "@/lib/engine";
import type { Analysis, ChatMessage } from "@/lib/types";
import { formatMoney } from "@/lib/format";

/**
 * POST /api/chat — Hunter AI resume coach.
 * Body: { message, history, analysis }.
 * Uses the deterministic engine (coachReply) unless ANTHROPIC_API_KEY is set,
 * in which case it calls the Anthropic Messages API and falls back to the
 * deterministic coach on any error. No secrets required for full functionality.
 */

interface ChatBody {
  message?: unknown;
  history?: unknown;
  analysis?: unknown;
}

const SYSTEM_PREAMBLE =
  "You are Hunter, PayLens's résumé and salary coach. You give concise, specific, actionable advice " +
  "grounded ONLY in the candidate's real analysis below. Prefer concrete numbers, target roles, and next steps. " +
  "Never invent salary figures beyond what is provided. Keep replies under ~180 words unless asked for detail.\n\n" +
  "CANDIDATE ANALYSIS:\n";

function isMessage(v: unknown): v is ChatMessage {
  if (!v || typeof v !== "object") return false;
  const m = v as Record<string, unknown>;
  return (m.role === "user" || m.role === "assistant") && typeof m.content === "string";
}

function analysisSummary(a: Analysis | undefined): string {
  if (!a) return "The user has not analyzed a résumé yet — encourage them to upload or paste one so advice can be grounded in real numbers.";
  const e = a.estimate;
  const cur = e.currency;
  const topSkills = a.profile.skills.slice(0, 6).map((s) => s.name).join(", ") || "none detected";
  const gaps = a.score.gaps.slice(0, 3).map((g) => g.title).join("; ");
  const imps = a.score.improvements
    .slice(0, 3)
    .map((i) => `${i.title} (${i.severity}, ${i.impactLabel})`)
    .join("; ");
  return [
    `Candidate ${a.profile.displayName}: ${e.level} ${e.role} in ${e.location.label}.`,
    `Market range ${formatMoney(e.floor, cur)}–${formatMoney(e.ceiling, cur)}, median ${formatMoney(e.median, cur)}, ${e.percentileLabel} (${e.percentile}th percentile).`,
    `Résumé score ${a.score.score}/100. Skill-up potential +${e.skillUpPotentialPct}%.`,
    `Top skills: ${topSkills}.`,
    gaps ? `Key gaps: ${gaps}.` : "",
    imps ? `Priority improvements: ${imps}.` : "",
    `Negotiation targets — floor ${formatMoney(a.brief.floor, cur)}, target ${formatMoney(a.brief.target, cur)}, stretch ${formatMoney(a.brief.stretch, cur)}.`,
  ]
    .filter(Boolean)
    .join(" ");
}

interface AnthropicContentBlock {
  type?: string;
  text?: string;
}

async function anthropicReply(message: string, history: ChatMessage[], analysis: Analysis | undefined): Promise<string | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  try {
    const messages = [
      ...history.slice(-10).map((m) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content: message },
    ];
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
        system: SYSTEM_PREAMBLE + analysisSummary(analysis),
        messages,
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { content?: AnthropicContentBlock[] };
    const text = Array.isArray(data.content)
      ? data.content
          .filter((b) => b?.type === "text" && typeof b.text === "string")
          .map((b) => b.text as string)
          .join("\n")
          .trim()
      : "";
    return text || null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  let body: ChatBody;
  try {
    body = (await req.json()) as ChatBody;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) {
    return Response.json({ error: "Provide a message." }, { status: 422 });
  }

  const history = Array.isArray(body.history) ? body.history.filter(isMessage) : [];
  const analysis = (body.analysis && typeof body.analysis === "object" ? (body.analysis as Analysis) : undefined) satisfies
    | Analysis
    | undefined;

  const live = await anthropicReply(message, history, analysis);
  if (live) {
    return Response.json({ reply: live, source: "anthropic" });
  }

  const reply = coachReply(message, { profile: analysis?.profile, analysis, history });
  return Response.json({ reply, source: "engine" });
}
