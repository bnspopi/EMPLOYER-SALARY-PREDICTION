/**
 * Negotiation brief generator.
 * brief(estimate, profile) → NegotiationBrief with floor / target ask / stretch, opening script,
 * counter-tactics, leverage notes and talking points.
 */
import type { MarketEstimate, NegotiationBrief, Profile } from "../types";
import { round } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import { joinAnd } from "./text";

function topSkillNames(profile: Profile, n: number): string[] {
  return [...profile.skills]
    .sort((a, b) => b.demand + b.salaryDriver - (a.demand + a.salaryDriver))
    .slice(0, n)
    .map((s) => s.name);
}

export function brief(estimate: MarketEstimate, profile: Profile): NegotiationBrief {
  const { currency } = estimate;
  const floor = round(estimate.median, 500);
  const target = round(estimate.median * 1.06, 500);
  const stretch = round(estimate.ceiling, 500);

  const skills = topSkillNames(profile, 2);
  const skillPhrase = skills.length ? joinAnd(skills) : "your core stack";
  const years = Math.max(1, Math.round(profile.yearsExperience));
  const rangeStr = `${formatMoney(estimate.floor, currency, { compact: true })}–${formatMoney(estimate.ceiling, currency, { compact: true })}`;

  const openingScript =
    `Based on my ${years} year${years === 1 ? "" : "s"} of ${estimate.role.toLowerCase()} experience and strong ${skillPhrase}, ` +
    `the market median for this role in ${estimate.location.city} is ${formatMoney(estimate.median, currency, { compact: true })} ` +
    `(range ${rangeStr}). Given where my profile sits — ${estimate.percentileLabel.toLowerCase()} of candidates for this stack — ` +
    `I'd like to discuss a base of ${formatMoney(target, currency)}.`;

  const counterTactics = [
    `If they say the base budget is fixed, pivot to a sign-on bonus or additional equity to bridge the ${formatMoney(target - floor, currency, { compact: true })} gap.`,
    "If the number can't move now, ask for a written 6-month performance review with a defined raise trigger.",
    `Trade non-cash levers: a title bump to ${estimate.role}, a remote/hybrid arrangement, or a signing/relocation allowance.`,
  ];

  const leverage = [
    `You're in the ${estimate.percentileLabel.toLowerCase()} of candidates for this stack — anchor on it.`,
    `The market ceiling here is ${formatMoney(estimate.ceiling, currency, { compact: true })}; there is headroom above their first number.`,
    estimate.skillsLifting.length
      ? `${estimate.skillsLifting[0].name} alone adds roughly ${formatMoney(estimate.skillsLifting[0].contribution, currency, { compact: true })} to your market value.`
      : `Your ${estimate.role.toLowerCase()} experience is scarce at this level — supply is tight.`,
  ];

  const talkingPoints = topSkillNames(profile, 4).map(
    (s) => `Lead with a concrete outcome you drove using ${s}.`,
  );
  if (talkingPoints.length === 0) {
    talkingPoints.push("Lead with your most quantified achievement and the business impact it created.");
  }

  return {
    currency,
    floor,
    target,
    stretch,
    openingScript,
    counterTactics,
    leverage,
    talkingPoints,
    totalPotentialGain: stretch - floor,
  };
}
