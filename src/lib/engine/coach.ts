/**
 * Deterministic résumé / career coach.
 * coachReply(message, ctx) → a helpful answer grounded in the user's real analysis
 * (score, gaps, target numbers), routed by intent.
 */
import type { Analysis, ChatMessage, Profile } from "../types";
import { formatMoney } from "@/lib/format";
import { joinAnd } from "./text";

export interface CoachContext {
  profile?: Profile;
  analysis?: Analysis;
  history: ChatMessage[];
}

function topSkills(profile: Profile | undefined, n: number): string[] {
  return (profile?.skills ?? []).slice(0, n).map((s) => s.name);
}

function fixFirst(analysis: Analysis): string {
  const imp = analysis.score.improvements[0];
  if (!imp) return "Your résumé is already strong — focus on tailoring it per application.";
  return `Start with "${imp.title}" (${imp.severity}). ${imp.fix} Expected lift: ${imp.impactLabel}.`;
}

export function coachReply(message: string, ctx: CoachContext): string {
  const msg = (message ?? "").toLowerCase().trim();
  const { profile, analysis } = ctx;
  const currency = analysis?.estimate.currency ?? profile?.location.currency ?? "USD";

  const noData = "Upload or paste a résumé first and I'll ground my advice in your real numbers.";

  // --- rewrite my summary ---
  if (/rewrite.*(summary|profile)|new summary|improve my summary/.test(msg)) {
    if (!profile) return noData;
    const skills = topSkills(profile, 3);
    const years = Math.max(1, Math.round(profile.yearsExperience));
    const rewritten =
      `${profile.title} with ${years}+ years driving measurable outcomes in ${profile.industry.toLowerCase()}. ` +
      `Deep in ${joinAnd(skills.length ? skills : ["your core stack"])}, with a record of shipping work that moves the metrics that matter. ` +
      `Seeking a ${analysis?.estimate.role ?? profile.role} role where I can own strategy end to end.`;
    return `Here's a tighter summary that states your level and leads with impact:\n\n"${rewritten}"\n\nSwap the generic phrases for one quantified result (e.g. "grew activation 18%").`;
  }

  // --- what should I fix first ---
  if (/fix first|what.*(fix|improve|priorit)|where.*start|biggest (issue|problem|gap)/.test(msg)) {
    if (!analysis) return noData;
    const lines = analysis.score.improvements.slice(0, 3).map((i, idx) => `${idx + 1}. ${i.title} (${i.severity}) — ${i.fix} [${i.impactLabel}]`);
    return `Your résumé scores ${analysis.score.score}/100. In priority order:\n${lines.join("\n")}\n\n${fixFirst(analysis)}`;
  }

  // --- am I underpaid ---
  if (/underpaid|paid enough|market value|worth|what.*(should|could).*(earn|make)|salary range/.test(msg)) {
    if (!analysis) return noData;
    const e = analysis.estimate;
    return (
      `For a ${e.level} ${e.role} in ${e.location.city}, the market range is ${formatMoney(e.floor, currency)}–${formatMoney(e.ceiling, currency)}, ` +
      `median ${formatMoney(e.median, currency)}. You sit around the ${e.percentile}th percentile (${e.percentileLabel}). ` +
      `Closing your top skill gaps could add about +${e.skillUpPotentialPct}%. If you're offered below ${formatMoney(e.median, currency)}, you have room to negotiate.`
    );
  }

  // --- how do I negotiate ---
  if (/negotiat|counter.?offer|ask for more|raise|counter the offer/.test(msg)) {
    if (!analysis) return noData;
    const b = analysis.brief;
    return (
      `Anchor on the market. Opening line:\n\n"${b.openingScript}"\n\n` +
      `Targets: floor ${formatMoney(b.floor, currency)} · target ask ${formatMoney(b.target, currency)} · stretch ${formatMoney(b.stretch, currency)} ` +
      `(total potential gain ${formatMoney(b.totalPotentialGain, currency)}). ` +
      `If base is frozen: ${b.counterTactics[0]}`
    );
  }

  // --- which certification ---
  if (/certification|cert\b|certs|which cert|should i get.*cert/.test(msg)) {
    if (!analysis || analysis.certifications.length === 0) return noData;
    const top = analysis.certifications.slice(0, 3);
    const lines = top.map((c) => `• ${c.name} (${c.provider}, ${c.duration}) — about +${c.upliftPct}% for your role`);
    return `Ranked by ROI for ${analysis.estimate.role}:\n${lines.join("\n")}\n\nStart with the first — it has the best uplift-to-effort ratio.`;
  }

  // --- tailor for <company> ---
  const tailor = msg.match(/tailor.*(?:for|to)\s+([a-z0-9 .&'-]{2,40})/);
  if (tailor) {
    if (!profile) return noData;
    const company = tailor[1].trim().replace(/[.?!]+$/, "");
    const skills = topSkills(profile, 3);
    return (
      `To tailor for ${company}: 1) Mirror their language — pull the exact skill and outcome words from the job post. ` +
      `2) Lead your summary with ${joinAnd(skills)} and one quantified win relevant to ${company}. ` +
      `3) Reorder bullets so the most relevant experience is first. ` +
      `Open the job in Job Search and hit "Check My Fit", then generate an Application Pack for a ${company}-specific résumé, cover letter and interview prep.`
    );
  }

  // --- generic fallback ---
  const parts: string[] = [];
  if (analysis) {
    parts.push(`You're at ${analysis.score.score}/100 with a market median of ${formatMoney(analysis.estimate.median, currency)}.`);
  }
  parts.push("Here are three concrete next steps:");
  const steps = analysis
    ? [
        analysis.score.improvements[0] ? `Fix "${analysis.score.improvements[0].title}" — ${analysis.score.improvements[0].fix}` : "Add one quantified result to each experience bullet.",
        analysis.score.gaps[0]?.fix ?? "Add the highest-demand core skill missing from your profile and evidence it in a bullet.",
        `Review your Salary Brief and rehearse the opening line before any recruiter call.`,
      ]
    : [
        "Upload or paste your résumé so I can score it and price your skills.",
        "Set a target role and location so I can build your growth roadmap.",
        "Paste a job description to check your fit and generate a tailored pack.",
      ];
  return `${parts.join(" ")}\n${steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`;
}
