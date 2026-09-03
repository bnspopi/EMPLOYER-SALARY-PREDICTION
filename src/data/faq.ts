import type { FaqItem } from "./types";

/** Six homepage questions. Answers are written for PayLens (US · CA · UK). */
export const FAQ: FaqItem[] = [
  {
    q: "How accurate is the market value estimate?",
    a: "PayLens prices your profile against live vacancies that publish a known salary, not against self-reported surveys. Our pricing model ingests roughly 10 million data points every month across the US, Canada and the UK and re-trains daily, so the range you see reflects what employers are paying for your combination of role, level, skills and city right now. For most profiles the median lands within a few percent of real offers; the floor-to-ceiling band shows how wide the honest uncertainty is, and every skill you add or clarify tightens it.",
  },
  {
    q: "What markets does PayLens cover?",
    a: "The United States, Canada and the United Kingdom, with city and metro-level pricing for each. That means San Francisco is priced differently from Austin, Toronto from Calgary, and London from Manchester, and remote roles carry their own multiplier. Figures are shown in the local currency (USD, CAD or GBP) and the Insights module lets you compare the same role across all three countries.",
  },
  {
    q: "How is this different from Glassdoor or Levels.fyi?",
    a: "Glassdoor and Levels.fyi price a job title. PayLens prices you. We read your actual resume, rate every skill for how much it moves pay, and then estimate what the current market would offer that exact profile. Instead of a crowd-sourced average for 'Product Manager', you get a floor, median and ceiling for a senior PM in Los Angeles with strong product strategy and weak AI tooling, plus the specific changes that would lift the number. We also cover every role and level, not only large tech companies.",
  },
  {
    q: "What's the difference between the Professional and Recruiter plans?",
    a: "Professional plans (Curious, Explorer and Hunter) are built for individuals: market value, resume improvement, offer evaluation, job search, pipeline tracking and career growth planning. The Recruiter track is for hiring teams and turns a job description into a salary benchmark with bands by city, industry and level so you can set a competitive offer before you post the role. Recruiter access starts with a 14-day free trial and is billed separately from the Professional plans.",
  },
  {
    q: "Is my resume data private?",
    a: "Yes. Your resume is encrypted, never sold, never shared with employers or recruiters, and never used to train our models. Contact details are stripped before analysis and only the anonymised profile is priced. You can delete any resume version, or your entire account and all associated data, at any time from Settings, and the deletion is immediate.",
  },
  {
    q: "Can I upload multiple versions of my resume?",
    a: "Yes. Keep as many versions as you like, switch the active one with a click, and compare how each one prices. This is useful for tracking your score as you edit, keeping a version tailored to a specific role, or analysing someone else's resume, for example a colleague or a candidate you are benchmarking. Each version keeps its own analysis and negotiation brief.",
  },
];
