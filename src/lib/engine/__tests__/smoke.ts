/**
 * Deterministic engine smoke test.
 * Run with: npx tsx src/lib/engine/__tests__/smoke.ts
 * Prints PASS/FAIL lines and exits non-zero on any failure.
 */
import {
  analyzeResume,
  benchmarkJobDescription,
  evaluateOffer,
  getInsights,
  searchJobs,
} from "../index";

const SAMPLE_RESUME = `Alex Rivera
Senior Product Manager
Los Angeles, US | alex.rivera@example.com | (310) 555-0142 | linkedin.com/in/alexrivera

Summary
Senior Product Manager with 7 years of experience leading consumer and platform products in the technology industry. I own product strategy end to end, align engineering and design around a clear roadmap, and make data-informed calls that move the metrics that matter.

Experience
Senior Product Manager — Brightwave (2021 - Present)
- Led product strategy for a subscription platform, growing activation 24% in two quarters.
- Built the product roadmap and prioritization framework used across three squads.
- Ran discovery and user research cycles that reshaped the onboarding experience.
- Partnered with stakeholders across marketing, design and engineering to ship a new checkout flow.
- Defined OKRs and product analytics dashboards to track adoption and retention.

Product Manager — Nimbus Labs (2017 - 2021)
- Owned go-to-market strategy for two launches, adding $1.2M in new annual revenue.
- Drove experimentation and A/B testing on the pricing page to lift conversion.
- Wrote SQL queries and analysis to inform weekly roadmap prioritization.
- Managed the backlog in an agile environment and coordinated cross-functional delivery.

Skills
Product Strategy, Product Roadmapping, User Research, Product Analytics, Stakeholder Management, Go-to-Market Strategy, OKRs, Agile, SQL, Data Analysis

Education
B.S. in Economics, University of California, Los Angeles`;

let failures = 0;
function check(name: string, cond: boolean, detail = "") {
  if (cond) {
    console.log(`PASS: ${name}${detail ? ` — ${detail}` : ""}`);
  } else {
    failures += 1;
    console.log(`FAIL: ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

// 1. analyzeResume on the sample (warm up module/JIT first, then time steady-state).
analyzeResume({ text: SAMPLE_RESUME, displayName: "Alex Rivera" });
const t0 = performance.now();
const analysis = analyzeResume({ text: SAMPLE_RESUME, displayName: "Alex Rivera" });
const ms = performance.now() - t0;
const e = analysis.estimate;

check("median between 120k and 190k USD", e.median >= 120000 && e.median <= 190000, `median=${e.median} ${e.currency}`);
check("currency is USD", e.currency === "USD", e.currency);
check("percentile 40-95", e.percentile >= 40 && e.percentile <= 95, `p=${e.percentile}`);
check("at least 8 skills detected", analysis.profile.skills.length >= 8, `skills=${analysis.profile.skills.length}`);
check("score 40-90", analysis.score.score >= 40 && analysis.score.score <= 90, `score=${analysis.score.score}`);
check("at least 3 improvements", analysis.score.improvements.length >= 3, `improvements=${analysis.score.improvements.length}`);
check("brief target > floor", analysis.brief.target > analysis.brief.floor, `target=${analysis.brief.target} floor=${analysis.brief.floor}`);
check("role resolved to Product Manager", analysis.estimate.role === "Product Manager", analysis.estimate.role);
check("level is senior", analysis.profile.level === "senior", analysis.profile.level);
check("location is Los Angeles", analysis.profile.location.city === "Los Angeles", analysis.profile.location.city);
check("runs under 50ms", ms < 50, `${ms}ms`);
check("certifications returned", analysis.certifications.length > 0, `certs=${analysis.certifications.length}`);
check("roadmap steps returned", analysis.roadmap.length > 0, `steps=${analysis.roadmap.length}`);

// 2. evaluateOffer → below.
const verdict = evaluateOffer({ id: "o1", title: "Senior Product Manager", location: "Austin, US", base: 105000 });
check("offer verdict is below", verdict.verdict === "below", `${verdict.verdict} (${verdict.pctVsMedian}% vs median ${verdict.median})`);
check("offer negotiation target > floor", verdict.negotiation.target > verdict.negotiation.floor);

// 3. searchJobs.
const matches = searchJobs({ role: "Product Manager" });
check("searchJobs returns >= 5 matches", matches.length >= 5, `matches=${matches.length}`);
check("every match fit is 30-100", matches.every((m) => m.fit.score >= 30 && m.fit.score <= 100), `fits=${matches.map((m) => m.fit.score).join(",")}`);
check("matches sorted by fit desc", matches.every((m, i) => i === 0 || matches[i - 1].fit.score >= m.fit.score));

// 4. getInsights.
const insights = getInsights("Software Engineer", "San Francisco, US");
check('insights marketLabel === "Competitive"', insights.marketLabel === "Competitive", insights.marketLabel);
check("insights has 12 trend points", insights.trend.length === 12, `trend=${insights.trend.length}`);
check("insights country comparison has 3 rows", insights.countryComparison.length === 3);

// 5. benchmarkJobDescription.
const report = benchmarkJobDescription({
  title: "Senior Backend Engineer",
  description:
    "We need a senior backend engineer with 6+ years building distributed systems in Go and Python on AWS. Kubernetes and PostgreSQL required. GraphQL a plus.",
  location: "New York, US",
  industry: "Technology",
});
check("recruiter byCity length >= 5", report.byCity.length >= 5, `byCity=${report.byCity.length}`);
check("recruiter byLevel has 4 rows", report.byLevel.length === 4);
check("recruiter byIndustry has 4 rows", report.byIndustry.length === 4);
check("recruiter extracted required skills", report.requiredSkills.length > 0, report.requiredSkills.join(","));

console.log(`\n${failures === 0 ? "ALL PASS" : `${failures} FAILURE(S)`} — engine smoke test`);
process.exit(failures === 0 ? 0 : 1);
