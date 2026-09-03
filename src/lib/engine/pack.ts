/**
 * Tailored application pack builder.
 * buildApplicationPack(job, profile) → tailored summary, bullets, cover letter and interview prep.
 */
import type { ApplicationPack, Job, Profile } from "../types";
import { joinAnd } from "./text";
import { checkFit } from "./jobs";
import { rewriteBullet } from "./rewrite";

function matchedSkillNames(job: Job, profile: Profile, limit = 4): string[] {
  const owned = new Set(profile.skills.map((s) => s.name.toLowerCase()));
  const matched = job.skills.filter((s) => owned.has(s.toLowerCase()));
  if (matched.length >= limit) return matched.slice(0, limit);
  // Backfill with the profile's strongest skills.
  const extra = profile.skills.map((s) => s.name).filter((n) => !matched.includes(n));
  return [...matched, ...extra].slice(0, limit);
}

export function buildApplicationPack(job: Job, profile: Profile): ApplicationPack {
  const fit = checkFit(job, profile);
  const topSkills = matchedSkillNames(job, profile, 4);
  const years = Math.max(1, Math.round(profile.yearsExperience));

  const tailoredSummary =
    `${profile.displayName === "You" ? "" : `${profile.displayName} — `}${profile.title} with ${years} year${years === 1 ? "" : "s"} of experience, ` +
    `applying for ${job.title} at ${job.company}. ` +
    `Strong in ${joinAnd(topSkills)}, with a track record of shipping outcomes in ${profile.industry.toLowerCase()}. ` +
    `Motivated by ${job.company}'s work on ${job.role.toLowerCase()} and ready to contribute from day one.`;

  // Tailored bullets: rewrite the profile's own bullets, then top up from job requirements.
  const baseBullets = profile.bullets.length
    ? profile.bullets.slice(0, 6)
    : job.skills.slice(0, 5).map((s) => `Delivered ${s} work relevant to ${job.company}`);
  let tailoredBullets = baseBullets.map((b) => rewriteBullet(b, profile).rewritten);
  if (tailoredBullets.length < 4) {
    const fill = job.requirements
      .slice(0, 4 - tailoredBullets.length)
      .map((r) => rewriteBullet(`Delivered work that meets: ${r}`, profile).rewritten);
    tailoredBullets = [...tailoredBullets, ...fill];
  }
  tailoredBullets = tailoredBullets.slice(0, 6);

  const hook =
    `I've spent ${years} year${years === 1 ? "" : "s"} building ${job.role.toLowerCase()} work at scale — and I'm specifically drawn to ${job.company} ` +
    `because the ${job.industry.toLowerCase()} problems described in this role match exactly how I approach my craft.`;
  const coverLetter = [
    `Dear ${job.company} Hiring Team,`,
    `${hook} ${job.description.split(/(?<=[.!?])\s/)[0] ?? ""}`.trim(),
    `In my career I have focused on ${joinAnd(topSkills)}. ` +
      `That maps directly to your needs: ${job.requirements.slice(0, 2).join("; ")}. ` +
      `My current market range for this level sits near ${Math.round(fit.marketMedian / 1000)}K, and I'm confident I can create value well beyond that here.`,
    `I would welcome the chance to discuss how my ${profile.title} background can help ${job.company} ship ${job.role.toLowerCase()} outcomes faster. ` +
      `Thank you for your consideration — I've attached a résumé tailored to this role.`,
    `Best regards,\n${profile.displayName === "You" ? "[Your name]" : profile.displayName}`,
  ].join("\n\n");

  const primarySkill = topSkills[0] ?? "your strongest skill";
  const interviewPrep = [
    {
      question: `Tell me about yourself and why ${job.company}.`,
      answerOutline: `Situation: ${years} years as ${profile.title}. Task: seeking a ${job.title} role. Action: highlight ${joinAnd(topSkills.slice(0, 2))}. Result: connect it to ${job.company}'s ${job.industry.toLowerCase()} mission.`,
    },
    {
      question: `Describe a time you used ${primarySkill} to drive an outcome.`,
      answerOutline: `Situation: name the project. Task: the problem. Action: how you applied ${primarySkill}. Result: quantify the impact (%, revenue, users).`,
    },
    {
      question: `This role requires: "${job.requirements[0] ?? "cross-functional delivery"}". Walk me through relevant experience.`,
      answerOutline: `Map one concrete story to this requirement; STAR structure; end with the measurable result and what you learned.`,
    },
    {
      question: `Tell me about a time you disagreed with a stakeholder.`,
      answerOutline: `Situation: the conflict. Task: the shared goal. Action: how you used data and communication to align. Result: the decision and the outcome.`,
    },
    {
      question: `Where do you see the biggest opportunity for ${job.company} in ${job.role.toLowerCase()}?`,
      answerOutline: `Show homework on ${job.company}; propose one opportunity tied to ${job.industry.toLowerCase()} trends; explain how you'd validate it and measure success.`,
    },
    {
      question: `What are your compensation expectations?`,
      answerOutline: `Anchor on the market: this role's midpoint is about ${Math.round(fit.marketMedian / 1000)}K; state a target range at or above midpoint and note total-comp flexibility.`,
    },
  ];

  return { jobId: job.id, tailoredSummary, tailoredBullets, coverLetter, interviewPrep, fit };
}
