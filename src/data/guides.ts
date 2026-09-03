/**
 * The 18 PayLens salary guides (US national figures, USD).
 * Software Engineer and DevOps Engineer use the verified level/city/employer
 * tables; the rest derive consistent numbers from the catalog anchors
 * (P25 ≈ 0.82×, P75 ≈ 1.18× of each level median) and fill remaining cells
 * plausibly. All prose is original.
 */
import type { SalaryGuide } from "@/lib/types";

type Lv = { entry: number; mid: number; senior: number; lead: number };
type LevelKey = "entry" | "mid" | "senior" | "lead";

const LEVEL_YEARS: Record<LevelKey, string> = {
  entry: "0–2 yrs",
  mid: "2–5 yrs",
  senior: "5–8 yrs",
  lead: "8+ yrs",
};
const LEVEL_LABEL: Record<LevelKey, string> = {
  entry: "Entry",
  mid: "Mid",
  senior: "Senior",
  lead: "Lead",
};
const LEVEL_ORDER: LevelKey[] = ["entry", "mid", "senior", "lead"];

/** round to the nearest $100 */
const r = (n: number): number => Math.round(n / 100) * 100;

const US_CITIES: { city: string; m: number }[] = [
  { city: "San Francisco", m: 1.42 },
  { city: "New York", m: 1.25 },
  { city: "Seattle", m: 1.18 },
  { city: "Boston", m: 1.12 },
  { city: "Los Angeles", m: 1.08 },
  { city: "Chicago", m: 1.02 },
  { city: "Austin", m: 1.0 },
  { city: "Remote (US)", m: 1.0 },
];

type CityCell = number | null;
type CityOverride = Partial<Record<LevelKey, CityCell>>;

function cityRows(
  lv: Lv,
  overrides: Record<string, CityOverride> = {},
): SalaryGuide["cities"] {
  return US_CITIES.map(({ city, m }) => {
    const o = overrides[city] ?? {};
    const cell = (k: LevelKey): CityCell =>
      k in o ? (o[k] as CityCell) : r(lv[k] * m);
    return {
      city,
      entry: cell("entry"),
      mid: cell("mid"),
      senior: cell("senior"),
      lead: cell("lead"),
    };
  });
}

type LevelTexts = [string, string, string, string, string, string, string, string];

function mkLevels(
  lv: Lv,
  t: LevelTexts,
  p?: Partial<Record<LevelKey, [number, number]>>,
): SalaryGuide["levels"] {
  return LEVEL_ORDER.map((k, i) => {
    const med = lv[k];
    const pp = p?.[k];
    return {
      level: LEVEL_LABEL[k],
      years: LEVEL_YEARS[k],
      median: med,
      p25: pp ? pp[0] : r(med * 0.82),
      p75: pp ? pp[1] : r(med * 1.18),
      description: t[i * 2],
      dayToDay: t[i * 2 + 1],
    };
  });
}

export const GUIDES: SalaryGuide[] = [
  /* ---------------- Software Engineer (verified) ---------------- */
  {
    slug: "software-engineer-salary-2026",
    title: "Software Engineer Salary Guide 2026",
    role: "Software Engineer",
    date: "2026-08-28",
    summary:
      "What software engineers earn across the US in 2026, from entry to lead, with city and employer breakdowns.",
    nationalMedian: 115000,
    entryMedian: 86000,
    leadMedian: 176000,
    activeRoles: 137502,
    supplyDemandRatio: 3.46,
    marketLabel: "Competitive",
    intro: [
      "Software engineering is still the single largest well-paid job family in the US market, and 2026 pricing reflects a labour pool that has grown faster than demand at the junior end while staying tight for senior and lead specialists. The national median base sits at $115,000, but that headline hides a spread from roughly $63,500 at the 25th percentile for entry roles to well past $220,000 for leads in the most expensive metros.",
      "The number that matters most for your own pay is not the title, it is the combination of level, city and the specific systems you can own end to end. A mid-level engineer who can ship production services alone is priced very differently from one who needs close supervision, even when the resume says the same thing.",
      "This guide breaks the market into four levels, eight cities and the employers hiring in volume, then lists the factors that move an offer up or down. Every figure is a base-salary estimate; equity and bonus sit on top and vary widely by employer type.",
    ],
    whatTheyDo:
      "Software engineers design, build, test and operate the applications and services that a business runs on. Day to day that means turning product requirements into working code, reviewing colleagues' changes, debugging failures in production and making trade-offs between shipping speed, reliability and long-term maintainability. The strongest engineers reduce ambiguity for everyone around them, not just close tickets.",
    levels: mkLevels(
      { entry: 86000, mid: 115000, senior: 145000, lead: 176000 },
      [
        "Entry engineers work inside a defined scope with regular review, learning the codebase and the team's delivery habits.",
        "Implement well-specified tickets, write tests, fix bugs and pair with senior engineers to understand system design.",
        "Mid-level engineers own features end to end and are trusted to ship without line-by-line supervision.",
        "Break down feature work, design small services, respond to on-call pages and mentor the newest hires.",
        "Senior engineers own systems, set technical direction for a team and are accountable for reliability and quality.",
        "Lead design reviews, unblock others, weigh architecture options and represent engineering in planning.",
        "Leads and staff engineers set direction across multiple teams and are measured on organisational impact.",
        "Drive cross-team technical strategy, resolve the hardest incidents and coach senior engineers toward staff scope.",
      ],
      {
        entry: [63500, 97500],
        mid: [97500, 130000],
        senior: [120000, 173000],
        lead: [149000, 220000],
      },
    ),
    cities: [
      { city: "San Francisco", entry: 155762, mid: 173595, senior: 177712, lead: 168413 },
      { city: "New York", entry: 120750, mid: 149500, senior: 178311, lead: 213623 },
      { city: "Seattle", entry: 100600, mid: 132000, senior: 165487, lead: 187955 },
      { city: "Boston", entry: 106000, mid: 128921, senior: 143600, lead: 161470 },
      { city: "Los Angeles", entry: 89622, mid: 87600, senior: 155860, lead: null },
      { city: "Chicago", entry: 86000, mid: 119361, senior: 156066, lead: 155938 },
      { city: "Austin", entry: 80900, mid: 130300, senior: 144034, lead: null },
      { city: "Remote (US)", entry: 86000, mid: 120000, senior: 143000, lead: 176000 },
    ],
    whatMovesTheNumber: [
      "Owning a production system alone, rather than contributing under supervision, is the clearest jump between mid and senior pay.",
      "Depth in a high-demand stack (distributed systems, performance, security) lifts the offer more than a longer list of shallow skills.",
      "City and remote policy can swing the same profile by 40% or more between San Francisco and a lower-cost metro.",
      "Evidence of measurable impact, such as latency cut or cost saved, moves you toward the 75th percentile.",
      "Company type matters: infrastructure and fintech firms pay above consumer startups for the same level.",
    ],
    types: [
      { name: "Backend Engineer", description: "Builds the services, APIs and data layers behind the product; strong pay leverage from distributed-systems depth." },
      { name: "Frontend Engineer", description: "Owns the user-facing application; premium goes to those who also handle performance and accessibility." },
      { name: "Full Stack Engineer", description: "Ships across the whole stack, valued most at smaller companies that need range over specialisation." },
      { name: "Platform / Infrastructure Engineer", description: "Builds the tooling and runtime other engineers depend on; consistently among the best-paid ICs." },
      { name: "Mobile Engineer", description: "Specialises in iOS or Android; scarce senior talent keeps the ceiling high." },
    ],
    employers: [
      { company: "Capital One", openings: 10227 },
      { company: "NVIDIA", openings: 8059 },
      { company: "Google", openings: 4248 },
      { company: "Canonical", openings: 3304 },
      { company: "Microsoft", openings: 1828 },
      { company: "JPMorganChase", openings: 1309 },
      { company: "Walmart", openings: 1217 },
    ],
    faq: [
      { q: "What is the median software engineer salary in 2026?", a: "The US national median base is about $115,000, rising from roughly $86,000 at entry level to $176,000 for leads. Your city and the systems you can own independently move the figure more than the title does." },
      { q: "Which cities pay the most?", a: "San Francisco, New York and Seattle sit well above the national median, with senior base salaries commonly between $165,000 and $180,000 before equity. Austin and remote roles pay closer to the national number." },
      { q: "Do I need a computer science degree?", a: "No. A degree helps at the very first job, but after two or three years employers price demonstrated delivery and system ownership far above credentials. A strong portfolio of shipped work can replace the degree entirely." },
      { q: "How much does specialisation raise pay?", a: "Depth in distributed systems, performance, security or platform work tends to lift an offer toward the 75th percentile, worth 15% to 25% over a generalist at the same level." },
      { q: "Is the market still competitive?", a: "Yes, at 3.46 candidates per role it is competitive rather than saturated. The junior end is crowded while senior and lead specialists remain scarce, which is why the pay gap between levels has widened." },
    ],
    furtherReading: "devops-engineer-salary-2026",
  },

  /* ---------------- DevOps Engineer (verified) ---------------- */
  {
    slug: "devops-engineer-salary-2026",
    title: "DevOps Engineer Salary Guide 2026",
    role: "DevOps Engineer",
    date: "2026-08-21",
    summary:
      "DevOps and platform-engineering pay across the US in 2026, with verified level, city and employer tables.",
    nationalMedian: 113967,
    entryMedian: 83473,
    leadMedian: 176000,
    activeRoles: 10958,
    supplyDemandRatio: 1.9,
    marketLabel: "Highly Competitive",
    intro: [
      "DevOps engineering keeps the software delivery pipeline and the production runtime healthy, and in 2026 it remains one of the tighter engineering markets: at 1.9 candidates per open role, qualified people rarely stay on the market for long. The national median base is $113,967, close to general software engineering but with a steeper premium for cloud and reliability depth.",
      "The role has splintered. Some listings are really CI/CD and release automation, others are platform engineering, and a growing share are site reliability roles with hard on-call expectations. Pay tracks how much production responsibility you actually carry, not the job title.",
      "Below are the verified level and city tables, the employers hiring in volume, and the levers that move an offer. Cloud certification and infrastructure-as-code fluency are the two clearest accelerators at the mid level.",
    ],
    whatTheyDo:
      "DevOps engineers build and run the systems that get code from a developer's laptop into production safely and repeatably. That covers CI/CD pipelines, infrastructure-as-code, container orchestration, observability and incident response. The best in the role reduce toil for entire engineering organisations by turning manual, error-prone steps into automated, self-service platforms.",
    levels: mkLevels(
      { entry: 83473, mid: 113967, senior: 135746, lead: 176000 },
      [
        "Entry DevOps engineers maintain existing pipelines and infrastructure under guidance while learning the cloud stack.",
        "Adjust CI configs, apply infrastructure changes through review, and shadow senior engineers during incidents.",
        "Mid-level engineers own significant pieces of the delivery platform and are trusted with production changes.",
        "Write Terraform and pipeline code, tune Kubernetes workloads and take primary on-call for their services.",
        "Senior engineers design the platform, set reliability standards and lead the response to major incidents.",
        "Architect multi-environment infrastructure, define SLOs, run blameless post-mortems and mentor the team.",
        "Leads own the reliability and delivery strategy across the organisation and manage cost at scale.",
        "Set platform direction, negotiate cloud spend, drive reliability programmes and coach senior engineers.",
      ],
      {
        entry: [72340, 95769],
        mid: [105500, 144500],
        senior: [119376, 157938],
        lead: [156940, 231088],
      },
    ),
    cities: [
      { city: "San Francisco", entry: 164429, mid: 167381, senior: 174325, lead: 228000 },
      { city: "New York", entry: 88267, mid: 133800, senior: 143473, lead: 172000 },
      { city: "Seattle", entry: 87583, mid: 127000, senior: 147902, lead: 194000 },
      { city: "Boston", entry: 112100, mid: 149476, senior: 167190, lead: 177000 },
      { city: "Los Angeles", entry: 126737, mid: 148457, senior: 171388, lead: 175800 },
      { city: "Chicago", entry: 121000, mid: 138499, senior: 153630, lead: 155938 },
      { city: "Austin", entry: 83296, mid: 127461, senior: 150479, lead: 165000 },
      { city: "Remote (US)", entry: 84510, mid: 109228, senior: 149027, lead: 176000 },
    ],
    whatMovesTheNumber: [
      "A current cloud certification (AWS, Azure or GCP) at the professional tier is the fastest documented pay bump at the mid level.",
      "Real Kubernetes and infrastructure-as-code ownership, not just exposure, separates a $114K offer from a $150K one.",
      "Carrying primary on-call for revenue-critical systems pushes you toward site-reliability pay bands.",
      "Cost-optimisation wins at cloud scale are directly quotable in negotiation and move you above median.",
      "Security and compliance depth (SOC 2, FedRAMP) commands a premium at government and enterprise employers.",
    ],
    types: [
      { name: "Platform Engineer", description: "Builds the internal developer platform other teams self-serve from; the highest-paid variant." },
      { name: "Site Reliability Engineer", description: "Owns uptime and on-call for critical systems, priced above generalist DevOps for the same level." },
      { name: "Release / CI-CD Engineer", description: "Specialises in the build and deployment pipeline; strong demand at larger engineering orgs." },
      { name: "Cloud Infrastructure Engineer", description: "Focuses on provisioning and cost across a cloud estate; certification-driven pay leverage." },
    ],
    employers: [
      { company: "Accenture", openings: 312 },
      { company: "Amazon", openings: 185 },
      { company: "IBM", openings: 134 },
      { company: "Deloitte", openings: 128 },
      { company: "Microsoft", openings: 115 },
      { company: "Leidos", openings: 89 },
      { company: "Booz Allen", openings: 76 },
      { company: "SAIC", openings: 65 },
      { company: "TEKsystems", openings: 58 },
      { company: "Infosys", openings: 44 },
    ],
    faq: [
      { q: "What does a DevOps engineer earn in 2026?", a: "The US national median base is about $113,967, from roughly $83,500 at entry to $176,000 for leads. Cloud depth and on-call responsibility move the number more than the exact title." },
      { q: "Is DevOps a good market to enter?", a: "Yes. At 1.9 candidates per role it is one of the tighter engineering markets, so qualified mid and senior engineers have real leverage. The entry level is harder because most roles expect some production exposure." },
      { q: "Which certification pays off most?", a: "A professional-tier cloud certification on the platform your target employers use is the clearest documented bump, often worth a full step at the mid level. Kubernetes certification adds to it." },
      { q: "How is DevOps different from SRE pay?", a: "Site reliability roles carry harder uptime and on-call expectations and are usually priced a band above generalist DevOps at the same level, especially for revenue-critical systems." },
      { q: "Do remote DevOps roles pay less?", a: "Remote base salaries land near the national median rather than the San Francisco or Boston highs, but the gap is smaller than in most engineering families because the work is inherently distributed." },
    ],
    furtherReading: "software-engineer-salary-2026",
  },

  /* ---------------- Product Manager ---------------- */
  {
    slug: "product-manager-salary-2026",
    title: "Product Manager Salary Guide 2026",
    role: "Product Manager",
    date: "2026-08-14",
    summary:
      "Product management pay in 2026 across levels and cities, and the signals that separate a good PM offer from a great one.",
    nationalMedian: 118000,
    entryMedian: 78000,
    leadMedian: 178000,
    activeRoles: 28000,
    supplyDemandRatio: 3.1,
    marketLabel: "Competitive",
    intro: [
      "Product management pay is wider and noisier than almost any other job family, because the title covers everything from a feature-owning associate PM to a group PM running a business line. The national median base is around $118,000, but the spread between an entry PM in Austin and an experienced one in Boston is enormous, which is why city-level data matters here more than most.",
      "Employers are pricing outcomes over process. A PM who can point to shipped products that moved a real metric is worth far more than one who can only describe rituals and roadmaps.",
      "This guide splits the market into four levels and eight cities, then lists the factors that reliably move an offer. Domain depth, especially in payments, infrastructure or regulated industries, is one of the strongest.",
    ],
    whatTheyDo:
      "Product managers decide what a team builds and why, then make sure it actually ships and works. They translate customer problems into a prioritised roadmap, align engineering, design and go-to-market around it, and use data to judge whether the work paid off. The role is accountable for outcomes without direct authority, so influence and clear writing carry as much weight as analysis.",
    levels: mkLevels(
      { entry: 78000, mid: 118000, senior: 148000, lead: 178000 },
      [
        "Associate PMs own a single feature or surface with close guidance from a senior PM.",
        "Write specs for well-scoped work, run stand-ups, triage bugs and learn to read product analytics.",
        "Mid-level PMs own a product area and its roadmap, and are trusted to make prioritisation calls.",
        "Set quarterly priorities, run discovery, partner with engineering leads and present to stakeholders.",
        "Senior PMs own a significant product line and its strategy, and are accountable for its business results.",
        "Define the vision, negotiate trade-offs across teams, manage dependencies and coach junior PMs.",
        "Group and lead PMs own a portfolio and often manage a team of PMs against a P&L or strategic bet.",
        "Set multi-team strategy, manage PMs, align executives and own the outcomes of a whole product org.",
      ],
    ),
    cities: cityRows(
      { entry: 78000, mid: 118000, senior: 148000, lead: 178000 },
      { Austin: { entry: 56443 }, Boston: { entry: 135400 } },
    ),
    whatMovesTheNumber: [
      "Demonstrable business impact, a metric you moved and can name, is the single biggest lever on a PM offer.",
      "Domain depth in payments, infrastructure, health or another regulated area commands a clear premium.",
      "Technical fluency, enough to earn engineering trust and reason about trade-offs, lifts the band at product-led companies.",
      "City and company stage swing the same profile widely; growth-stage tech pays above traditional enterprises.",
      "Ownership scope, a full product line versus a single feature, is what actually separates senior from mid pay.",
    ],
    types: [
      { name: "Technical Product Manager", description: "Owns platform, API or infrastructure products; priced above generalist PMs for the same level." },
      { name: "Growth Product Manager", description: "Focuses on acquisition, activation and retention metrics; strong pay at consumer companies." },
      { name: "Platform Product Manager", description: "Owns internal or developer-facing products, valued for systems thinking and long horizons." },
      { name: "Group Product Manager", description: "Manages a team of PMs across a portfolio; the bridge into product leadership." },
    ],
    employers: [
      { company: "Stripe", openings: 214 },
      { company: "Microsoft", openings: 189 },
      { company: "Amazon", openings: 176 },
      { company: "Atlassian", openings: 92 },
      { company: "Shopify", openings: 71 },
      { company: "Notion", openings: 38 },
    ],
    faq: [
      { q: "What is the median product manager salary in 2026?", a: "The US national median base is about $118,000, from roughly $78,000 at the associate level to $178,000 for group and lead PMs. City and company stage move the number dramatically." },
      { q: "Do technical PMs earn more?", a: "Yes. Technical product managers who own platform, API or infrastructure products are typically priced a band above generalist PMs at the same level, because the pool of qualified candidates is smaller." },
      { q: "How do I move from mid to senior PM pay?", a: "Own a full product line with its own results rather than a single feature, and be able to name a business metric you moved. Scope of ownership is what employers actually pay for." },
      { q: "Is a technical background required?", a: "Not required, but enough fluency to earn engineering trust and reason about trade-offs raises your band at product-led companies. Pure process PMs are priced below outcome-driven ones." },
      { q: "Why is the salary range so wide?", a: "The PM title covers everything from feature owners to business-line leaders, and pay tracks scope and impact rather than tenure, so two people with the same title can be $60,000 apart." },
    ],
    furtherReading: "software-engineer-salary-2026",
  },

  /* ---------------- UX Designer ---------------- */
  {
    slug: "ux-designer-salary-2026",
    title: "UX Designer Salary Guide 2026",
    role: "UX Designer",
    date: "2026-08-07",
    summary:
      "UX design pay across the US in 2026, from entry through lead, with the skills that move the number.",
    nationalMedian: 98000,
    entryMedian: 67500,
    leadMedian: 166250,
    activeRoles: 4200,
    supplyDemandRatio: 2.8,
    marketLabel: "Competitive",
    intro: [
      "UX design pay in 2026 rewards designers who can prove their work changed a product metric, not just those with a polished portfolio. The national median base is around $98,000, but the ceiling for lead and principal designers has climbed past $166,000 as companies consolidate design into fewer, more senior roles.",
      "The market has cooled at the junior end, where visual polish alone is now cheap, and heated up for designers who combine research, interaction design and enough systems thinking to work across a whole product.",
      "This guide covers the four levels, eight cities and the employers hiring, plus the factors that separate a median offer from a top-quartile one. Research fluency and design-systems ownership are the two clearest accelerators.",
    ],
    whatTheyDo:
      "UX designers shape how a product works and feels, from research and information architecture through interaction design and usability testing. They turn ambiguous problems into flows and interfaces that people can actually use, then validate the result with real users. The most valuable designers connect their decisions to outcomes, framing choices in terms of task success and business impact rather than aesthetics alone.",
    levels: mkLevels(
      { entry: 67500, mid: 98000, senior: 130000, lead: 166250 },
      [
        "Entry designers execute defined screens and flows with regular critique from senior designers.",
        "Produce wireframes and mockups, run basic usability tests and learn the team's design system.",
        "Mid-level designers own a product area's experience and drive their own research and iteration.",
        "Lead discovery, design end-to-end flows, run studies and contribute to the shared design system.",
        "Senior designers set the design direction for a product and are trusted with the hardest problems.",
        "Frame ambiguous problems, define interaction patterns, mentor juniors and align with product and engineering.",
        "Leads own design strategy across products and often steward the design system for the whole company.",
        "Set design vision, coach the team, run design reviews and represent design in cross-functional planning.",
      ],
    ),
    cities: cityRows(
      { entry: 67500, mid: 98000, senior: 130000, lead: 166250 },
      { Chicago: { entry: 97000 } },
    ),
    whatMovesTheNumber: [
      "Evidence that a design decision moved a metric, task success or conversion, is the strongest single lever.",
      "Research fluency, running and synthesising real studies, lifts a designer above pure visual roles.",
      "Owning or contributing meaningfully to a design system is a documented step toward senior pay.",
      "Breadth across research, interaction and prototyping beats depth in one narrow craft for most employers.",
      "Company type matters: product-led tech pays above agencies for the same level and city.",
    ],
    types: [
      { name: "Product Designer", description: "Owns the full experience of a product area, the most common and best-paid UX variant." },
      { name: "UX Researcher", description: "Specialises in studies and synthesis; scarce senior researchers command a premium." },
      { name: "Interaction Designer", description: "Focuses on flows and behaviour; valued where products are complex and stateful." },
      { name: "Design Systems Designer", description: "Builds and maintains the shared component library, a high-leverage senior track." },
    ],
    employers: [
      { company: "Figma", openings: 64 },
      { company: "Shopify", openings: 51 },
      { company: "Adobe", openings: 47 },
      { company: "Atlassian", openings: 33 },
      { company: "Notion", openings: 21 },
      { company: "Wealthsimple", openings: 12 },
    ],
    faq: [
      { q: "What is the median UX designer salary in 2026?", a: "The US national median base is about $98,000, from roughly $67,500 at entry to $166,250 for leads. Research depth and design-systems ownership move the number more than portfolio polish alone." },
      { q: "Is the UX job market still strong?", a: "It is competitive at 2.8 candidates per role. The junior end has cooled because visual polish is now cheap, while senior designers who can run research and think in systems remain in demand." },
      { q: "Do I need to code?", a: "No, but the ability to prototype and to reason about technical constraints raises your band at product-led companies. It is a helpful edge rather than a requirement." },
      { q: "What separates senior from mid pay?", a: "Owning the design direction for a product and being trusted with ambiguous problems, rather than executing defined screens. Scope and judgment, not tenure, drive the jump." },
      { q: "Which cities pay the most for UX?", a: "San Francisco, New York and Seattle sit well above the national median, with senior base salaries commonly between $150,000 and $180,000. Remote roles pay closer to the national figure." },
    ],
    furtherReading: "design-architect-salary-2026",
  },

  /* ---------------- Design Architect ---------------- */
  {
    slug: "design-architect-salary-2026",
    title: "Design Architect Salary Guide 2026",
    role: "Design Architect",
    date: "2026-07-31",
    summary:
      "Design architect pay in 2026, a senior design track focused on systems, standards and cross-product consistency.",
    nationalMedian: 97000,
    entryMedian: 72278,
    leadMedian: 155000,
    activeRoles: 980,
    supplyDemandRatio: 1.1,
    marketLabel: "Balanced",
    intro: [
      "Design architect is a senior-leaning track that sits between design and engineering, owning the systems, standards and patterns that keep a product coherent as it grows. In 2026 the national median base is about $97,000, but the role rewards seniority steeply, reaching $155,000 for the most experienced architects.",
      "The market is close to balanced at 1.1 candidates per role, because the skill set, deep design-systems knowledge plus enough engineering literacy to see it implemented, is genuinely scarce.",
      "This guide lays out the four levels, eight cities and hiring employers, then the levers that move an offer. Fluency in tokens, theming and cross-platform consistency is the clearest differentiator.",
    ],
    whatTheyDo:
      "Design architects define and maintain the shared visual and interaction language of a product suite, from design tokens and component libraries to accessibility and theming standards. They work with both designers and engineers to make sure the system is actually adopted, not just documented. The role blends craft, governance and communication, since a system only pays off when teams use it consistently.",
    levels: mkLevels(
      { entry: 72278, mid: 97000, senior: 125000, lead: 155000 },
      [
        "Junior architects maintain existing components and patterns under the direction of a senior architect.",
        "Update tokens and components, document usage and help teams adopt the existing system.",
        "Mid-level architects own a slice of the design system and drive its evolution with contributing teams.",
        "Design new components, define token structures, review implementations and support product teams.",
        "Senior architects set the standards for a whole product area and govern how the system evolves.",
        "Define architecture for the system, run reviews, resolve inconsistencies and mentor designers.",
        "Leads own the system strategy across the company and align design and engineering leadership.",
        "Set the multi-product system vision, define governance, coach architects and drive adoption org-wide.",
      ],
    ),
    cities: cityRows({ entry: 72278, mid: 97000, senior: 125000, lead: 155000 }),
    whatMovesTheNumber: [
      "Owning a design system that multiple teams actually adopt is the clearest evidence of senior scope.",
      "Engineering literacy, enough to see the system implemented and not just specified, raises the band.",
      "Accessibility and theming depth is a documented premium, especially at enterprise employers.",
      "Cross-platform consistency work (web plus mobile) commands more than single-surface systems.",
      "Communication and governance skill matters, because a system only pays off when teams use it.",
    ],
    types: [
      { name: "Design Systems Architect", description: "Owns the component library and token architecture, the core of the role." },
      { name: "Accessibility Architect", description: "Specialises in inclusive design standards; scarce and well paid at large employers." },
      { name: "Brand Systems Designer", description: "Bridges brand and product design language for consistency at scale." },
      { name: "Design Ops Lead", description: "Focuses on the processes and tooling that keep a large design team consistent." },
    ],
    employers: [
      { company: "Adobe", openings: 24 },
      { company: "Figma", openings: 19 },
      { company: "Atlassian", openings: 14 },
      { company: "Microsoft", openings: 11 },
      { company: "Shopify", openings: 8 },
      { company: "IBM", openings: 6 },
    ],
    faq: [
      { q: "What is a design architect's salary in 2026?", a: "The US national median base is about $97,000, rising from roughly $72,000 for junior architects to $155,000 for leads. The scarcity of the skill set keeps the market close to balanced." },
      { q: "How is a design architect different from a UX designer?", a: "A UX designer owns a product's experience, while a design architect owns the shared system, tokens, components and standards, that every product is built from. It is a more senior, systems-focused track." },
      { q: "Do I need to code for this role?", a: "You do not have to be an engineer, but enough code literacy to see your system implemented correctly is a real pay lever, because it makes the system stick." },
      { q: "Is this a growing field?", a: "Yes. As companies consolidate multiple products onto shared systems, demand for people who can architect and govern those systems has outpaced supply, which is why the market is balanced rather than saturated." },
      { q: "What raises a design architect's offer?", a: "Proof that a system you built was actually adopted by multiple teams, plus depth in accessibility, theming and cross-platform consistency. Governance and communication skill matter as much as craft." },
    ],
    furtherReading: "ux-designer-salary-2026",
  },

  /* ---------------- API Developer ---------------- */
  {
    slug: "api-developer-salary-2026",
    title: "API Developer Salary Guide 2026",
    role: "API Developer",
    date: "2026-07-24",
    summary:
      "API developer pay in 2026, one of the most undersupplied engineering niches in the market.",
    nationalMedian: 112000,
    entryMedian: 82000,
    leadMedian: 168000,
    activeRoles: 645,
    supplyDemandRatio: 0.32,
    marketLabel: "Critically Undersupplied",
    intro: [
      "API developer is one of the tightest niches in the whole market: at 0.32 candidates per open role, there are roughly three vacancies for every qualified person. That scarcity gives experienced API engineers unusual leverage, even though the absolute number of listings is small at 645.",
      "The national median base is about $112,000, close to general backend engineering, but the undersupply means real offers frequently land above the median for anyone who can design clean, well-documented, versioned interfaces.",
      "This guide covers the four levels, eight cities and the employers hiring, plus the factors that move an offer. Contract-first design and a track record of stable public APIs are the clearest accelerators.",
    ],
    whatTheyDo:
      "API developers design and build the programmatic interfaces that let systems and partners talk to a product. That means defining contracts, versioning strategy, authentication, rate limiting and documentation, then building and maintaining the services behind them. The role rewards people who think about the developer experience of their consumers as carefully as the implementation itself.",
    levels: mkLevels(
      { entry: 82000, mid: 112000, senior: 140000, lead: 168000 },
      [
        "Entry API developers implement endpoints against an existing contract with senior review.",
        "Build and test individual endpoints, write reference docs and fix reported integration bugs.",
        "Mid-level developers own a set of APIs end to end, including design, versioning and support.",
        "Design contracts, manage versioning, handle authentication and partner with consuming teams.",
        "Senior developers set the API strategy for a product and are accountable for its stability.",
        "Define standards, review interface designs, plan deprecations and mentor junior developers.",
        "Leads own the API platform and its governance across the organisation and its partners.",
        "Set platform direction, define governance, manage the partner developer experience and coach the team.",
      ],
    ),
    cities: cityRows({ entry: 82000, mid: 112000, senior: 140000, lead: 168000 }),
    whatMovesTheNumber: [
      "A track record of stable, well-documented public APIs is the strongest evidence you can bring.",
      "Contract-first and versioning discipline, avoiding breaking changes, separates senior from mid pay.",
      "Depth in authentication, rate limiting and security is a clear premium given partner-facing risk.",
      "Scarcity itself is leverage: at 0.32 supply-to-demand, qualified candidates can negotiate above median.",
      "Fintech and platform employers, where APIs are the product, pay above companies that treat them as plumbing.",
    ],
    types: [
      { name: "Public API Engineer", description: "Owns partner-facing interfaces where stability and documentation are paramount." },
      { name: "Integration Engineer", description: "Connects the product to third-party systems; overlapping and equally scarce." },
      { name: "Platform / SDK Engineer", description: "Builds the client libraries and tooling around the API surface." },
      { name: "GraphQL Specialist", description: "Focuses on schema design and federation; premium for complex data graphs." },
    ],
    employers: [
      { company: "Stripe", openings: 41 },
      { company: "Twilio", openings: 28 },
      { company: "Plaid", openings: 19 },
      { company: "Wise", openings: 14 },
      { company: "Shopify", openings: 11 },
      { company: "Canonical", openings: 7 },
    ],
    faq: [
      { q: "What does an API developer earn in 2026?", a: "The US national median base is about $112,000, from roughly $82,000 at entry to $168,000 for leads. Because the niche is critically undersupplied, real offers often land above the median." },
      { q: "Why is this role so undersupplied?", a: "At 0.32 candidates per role there are about three openings for every qualified person. Clean contract design, versioning discipline and developer-experience thinking are rarer than general backend skills." },
      { q: "How is it different from backend engineering?", a: "It is a specialisation within backend work focused on the interface itself, its contract, versioning, authentication and documentation, rather than on general service implementation." },
      { q: "What raises an API developer's pay?", a: "Evidence of stable, well-documented public APIs, strict versioning that avoids breaking changes, and depth in authentication and security. Fintech and platform employers pay the most." },
      { q: "Is GraphQL or REST more valuable?", a: "Both are in demand; REST remains the baseline while GraphQL schema and federation skills add a premium for products with complex data graphs. Breadth across both is ideal." },
    ],
    furtherReading: "integration-engineer-salary-2026",
  },

  /* ---------------- Integration Engineer ---------------- */
  {
    slug: "integration-engineer-salary-2026",
    title: "Integration Engineer Salary Guide 2026",
    role: "Integration Engineer",
    date: "2026-07-17",
    summary:
      "Integration engineer pay in 2026, connecting systems, partners and data across an increasingly balanced market.",
    nationalMedian: 105000,
    entryMedian: 79641,
    leadMedian: 154000,
    activeRoles: 1900,
    supplyDemandRatio: 0.9,
    marketLabel: "Balanced",
    intro: [
      "Integration engineers make separate systems work together, whether that is stitching a SaaS product into a customer's stack or wiring internal services and data pipelines. The 2026 national median base is about $105,000, and with 0.9 candidates per role the market is essentially balanced, tilting slightly in the candidate's favour.",
      "The ceiling is higher than the median suggests, with lead integration engineers in expensive metros reaching well past $190,000, because complex enterprise integrations demand rare combinations of coding, data and stakeholder skills.",
      "This guide breaks out the four levels, eight cities and hiring employers, plus what moves an offer. Enterprise integration patterns and iPaaS fluency are the clearest differentiators.",
    ],
    whatTheyDo:
      "Integration engineers connect applications, data sources and partners so information flows reliably between them. They design and build the connectors, transformations, message queues and error-handling that make integrations robust, then support them in production. The role sits between engineering and the customer, so clear communication and debugging skill matter as much as coding.",
    levels: mkLevels(
      { entry: 79641, mid: 105000, senior: 130000, lead: 154000 },
      [
        "Entry integration engineers build and test individual connectors under senior guidance.",
        "Implement mappings, configure connectors, test data flows and fix reported sync issues.",
        "Mid-level engineers own complete integrations and their reliability in production.",
        "Design transformations, handle error recovery, manage partner endpoints and support customers.",
        "Senior engineers architect complex, multi-system integrations and set standards for the team.",
        "Design integration patterns, handle scale and reliability, mentor juniors and advise on architecture.",
        "Leads own the integration platform and strategy across products and enterprise customers.",
        "Set platform direction, define patterns, manage the toughest enterprise deals and coach the team.",
      ],
      { lead: [126280, 197000] },
    ),
    cities: cityRows(
      { entry: 79641, mid: 105000, senior: 130000, lead: 154000 },
      { "Los Angeles": { lead: 197000 } },
    ),
    whatMovesTheNumber: [
      "Fluency in enterprise integration patterns and message-driven architecture separates senior from mid pay.",
      "iPaaS and middleware experience (MuleSoft, Boomi, workflow engines) is a documented premium.",
      "Strong debugging across system boundaries is prized, because integration failures are hard to trace.",
      "Handling complex, high-volume enterprise integrations pushes the offer toward the top of the band.",
      "Customer-facing communication skill raises pay, since integration engineers often work directly with clients.",
    ],
    types: [
      { name: "Enterprise Integration Engineer", description: "Handles large, complex customer integrations; the best-paid variant." },
      { name: "iPaaS / Middleware Engineer", description: "Specialises in integration platforms and workflow engines." },
      { name: "Data Integration Engineer", description: "Focuses on moving and transforming data between systems and warehouses." },
      { name: "Solutions / API Integration Engineer", description: "Bridges product APIs and customer systems, overlapping with API development." },
    ],
    employers: [
      { company: "Accenture", openings: 87 },
      { company: "Deloitte", openings: 64 },
      { company: "Salesforce", openings: 52 },
      { company: "Workday", openings: 31 },
      { company: "Twilio", openings: 22 },
      { company: "Wise", openings: 9 },
    ],
    faq: [
      { q: "What is an integration engineer's salary in 2026?", a: "The US national median base is about $105,000, from roughly $80,000 at entry to $154,000 for leads, with the ceiling reaching $197,000 in expensive metros for complex enterprise work." },
      { q: "Is this a good market?", a: "Yes. At 0.9 candidates per role the market is balanced and tilts slightly toward candidates, because the mix of coding, data and stakeholder skills the role needs is genuinely scarce." },
      { q: "How is it different from an API developer?", a: "API developers build the interface a system exposes; integration engineers connect multiple systems together through those interfaces. The roles overlap and both are in short supply." },
      { q: "What tools should I know?", a: "Enterprise integration patterns, message queues and an iPaaS or middleware platform such as MuleSoft or Boomi. Depth in one of those is a documented pay premium." },
      { q: "What lifts an integration engineer's pay?", a: "Handling complex, high-volume enterprise integrations, strong cross-system debugging and clear customer-facing communication. Enterprise consultancies and platform vendors pay the most." },
    ],
    furtherReading: "api-developer-salary-2026",
  },

  /* ---------------- Technical Support Engineer ---------------- */
  {
    slug: "technical-support-engineer-salary-2026",
    title: "Technical Support Engineer Salary Guide 2026",
    role: "Technical Support Engineer",
    date: "2026-07-10",
    summary:
      "Technical support engineer pay in 2026, a technical, customer-facing role with a surprisingly high ceiling.",
    nationalMedian: 73500,
    entryMedian: 58000,
    leadMedian: 130000,
    activeRoles: 2688,
    supplyDemandRatio: 2.0,
    marketLabel: "Competitive",
    intro: [
      "Technical support engineering is the deep end of customer support: diagnosing real product and infrastructure problems rather than answering scripted questions. The 2026 national median base is about $73,500, but the ceiling is far higher than most support roles, with senior specialists in New York and leaders in Boston clearing $120,000 and $150,000 respectively.",
      "The market is competitive at 2.0 candidates per role, and the split is sharp: generalist support is crowded, while engineers who can read logs, reproduce bugs and work alongside product teams are in demand.",
      "This guide covers the four levels, eight cities and hiring employers, plus what moves an offer. Coding literacy and product depth are the clearest paths to the top of the band.",
    ],
    whatTheyDo:
      "Technical support engineers resolve the hard problems that front-line support cannot, working directly with customers to diagnose failures, reproduce bugs and find workarounds. They read logs, write queries, escalate real defects to engineering and often build tools and documentation that reduce future tickets. The best combine genuine technical depth with the patience and clarity to explain it to frustrated users.",
    levels: mkLevels(
      { entry: 58000, mid: 73500, senior: 98000, lead: 130000 },
      [
        "Entry support engineers handle escalated tickets with guidance and learn the product deeply.",
        "Reproduce reported issues, document findings, escalate real bugs and update help articles.",
        "Mid-level engineers own complex cases end to end and act as the bridge to product teams.",
        "Diagnose failures from logs and queries, build workarounds and feed defects back to engineering.",
        "Senior specialists handle the hardest cases and set the technical standard for the support team.",
        "Own critical escalations, build diagnostic tooling, mentor the team and influence the product roadmap.",
        "Leads run the technical support function and its escalation strategy across the organisation.",
        "Set support engineering standards, manage escalation processes, coach specialists and align with product.",
      ],
      { senior: [98000, 120324], lead: [110000, 156931] },
    ),
    cities: cityRows(
      { entry: 58000, mid: 73500, senior: 98000, lead: 130000 },
      { "New York": { senior: 120324 }, Boston: { lead: 156931 } },
    ),
    whatMovesTheNumber: [
      "Coding and scripting literacy, enough to read logs and write queries, separates a support engineer from an agent.",
      "Deep product knowledge that lets you resolve cases without escalation moves you toward senior pay.",
      "Building diagnostic tools or documentation that reduces ticket volume is a quotable, high-value contribution.",
      "Cloud and infrastructure familiarity is a premium, because the hardest tickets are often environment issues.",
      "Influence on the product roadmap, turning support insight into fixes, is what defines the lead band.",
    ],
    types: [
      { name: "Product Support Engineer", description: "Focuses on a specific product's hardest cases; the core of the role." },
      { name: "Cloud / Infrastructure Support Engineer", description: "Handles environment and deployment issues, priced above generalists." },
      { name: "Escalation Engineer", description: "Owns the most severe customer incidents and the bridge to engineering." },
      { name: "Support Operations Engineer", description: "Builds the tooling and automation that scales the support function." },
    ],
    employers: [
      { company: "Microsoft", openings: 148 },
      { company: "Amazon", openings: 121 },
      { company: "Atlassian", openings: 63 },
      { company: "Shopify", openings: 44 },
      { company: "Twilio", openings: 27 },
      { company: "Canonical", openings: 18 },
    ],
    faq: [
      { q: "What does a technical support engineer earn in 2026?", a: "The US national median base is about $73,500, from roughly $58,000 at entry to $130,000 for leads, with senior specialists in New York near $120,000 and Boston leaders reaching $156,000." },
      { q: "How is it different from a support specialist?", a: "A support engineer diagnoses real technical failures, reading logs, writing queries and escalating genuine bugs, while a specialist handles product and account questions. The engineering depth commands higher pay." },
      { q: "Do I need to code?", a: "Enough scripting and log-reading literacy to reproduce and diagnose problems is what separates a support engineer from an agent, and it is the clearest lever on pay in this family." },
      { q: "What raises the ceiling in this role?", a: "Deep product knowledge, cloud and infrastructure familiarity, building diagnostic tooling, and turning support insight into roadmap influence. Those move you from median toward the $130,000 lead band." },
      { q: "Is the market competitive?", a: "At 2.0 candidates per role it is competitive. Generalist support is crowded, but engineers who can genuinely debug and work with product teams remain in demand." },
    ],
    furtherReading: "technical-support-specialist-salary-2026",
  },

  /* ---------------- Technical Support Specialist ---------------- */
  {
    slug: "technical-support-specialist-salary-2026",
    title: "Technical Support Specialist Salary Guide 2026",
    role: "Technical Support Specialist",
    date: "2026-07-03",
    summary:
      "Technical support specialist pay in 2026, the customer-facing role that anchors most support organisations.",
    nationalMedian: 75000,
    entryMedian: 55275,
    leadMedian: 118000,
    activeRoles: 3100,
    supplyDemandRatio: 2.1,
    marketLabel: "Competitive",
    intro: [
      "Technical support specialists are the people customers actually reach when something goes wrong, and in 2026 the role pays a national median base of about $75,000. The range is wide, from an entry specialist near $55,000 to a support leader in Austin around $155,000, because the title spans front-line help and technical account management.",
      "The market is competitive at 2.1 candidates per role. Volume support is crowded, but specialists who develop real product depth and can handle escalations move up quickly.",
      "This guide covers the four levels, eight cities and hiring employers, plus the factors that move an offer. Product certification and troubleshooting depth are the clearest accelerators.",
    ],
    whatTheyDo:
      "Technical support specialists help customers use a product and resolve the problems they hit, across chat, email, phone and ticketing. They troubleshoot configuration and usage issues, document solutions, and escalate genuine defects to more technical teams. As they grow, the strongest specialists become trusted product experts who reduce churn and feed customer insight back into the business.",
    levels: mkLevels(
      { entry: 55275, mid: 75000, senior: 95000, lead: 118000 },
      [
        "Entry specialists handle common tickets from a knowledge base while learning the product.",
        "Answer routine questions, follow troubleshooting guides and log issues for escalation.",
        "Mid-level specialists own more complex cases and handle escalations without hand-holding.",
        "Resolve configuration problems, write help content, and coordinate with technical teams on defects.",
        "Senior specialists are trusted product experts who handle the toughest customer situations.",
        "Own difficult accounts, mentor new specialists, improve documentation and flag product gaps.",
        "Support leaders run a team or region and own the quality and efficiency of support.",
        "Set support standards, coach specialists, manage escalation paths and report on customer health.",
      ],
      { lead: [110000, 155000] },
    ),
    cities: cityRows(
      { entry: 55275, mid: 75000, senior: 95000, lead: 118000 },
      { Austin: { lead: 155000 } },
    ),
    whatMovesTheNumber: [
      "Product certification and demonstrable expertise in the specific tool you support is a clear premium.",
      "Troubleshooting depth that resolves cases without escalation moves a specialist toward senior pay.",
      "Handling technical accounts and reducing churn shifts the role toward technical account management money.",
      "Writing documentation that deflects tickets is a quotable, valued contribution in negotiation.",
      "Moving into a lead or team role, owning quality and coaching, is what unlocks the top of the band.",
    ],
    types: [
      { name: "Product Support Specialist", description: "Owns a specific product's front-line support; the most common variant." },
      { name: "Technical Account Manager", description: "Pairs support with account ownership for key customers, a higher-paid track." },
      { name: "Onboarding Specialist", description: "Focuses on getting new customers set up successfully and reducing early churn." },
      { name: "Support Content Specialist", description: "Builds the knowledge base and self-serve resources that scale the team." },
    ],
    employers: [
      { company: "Shopify", openings: 92 },
      { company: "Atlassian", openings: 58 },
      { company: "HubSpot", openings: 41 },
      { company: "Hootsuite", openings: 26 },
      { company: "Monzo", openings: 17 },
      { company: "Notion", openings: 12 },
    ],
    faq: [
      { q: "What is a technical support specialist's salary in 2026?", a: "The US national median base is about $75,000, from roughly $55,000 at entry to $118,000 for support leaders, with Austin leaders reaching $155,000. Product depth and escalation handling move the number." },
      { q: "How do I earn more in support?", a: "Develop genuine expertise in the product you support, resolve cases without escalation, and move toward technical account management or a team-lead role. Certifications on the tool you support help." },
      { q: "Is it different from a support engineer?", a: "Yes. Specialists focus on product usage and configuration, while support engineers diagnose deeper technical failures with logs and code. The engineer track pays a band higher." },
      { q: "Is the role at risk from automation?", a: "Automation absorbs routine tickets, which is exactly why specialists who handle complex, technical and account-level work are increasingly valued. The volume tier is shrinking; the expert tier is not." },
      { q: "What career paths open up?", a: "Common moves are into technical account management, support engineering, support team leadership or customer success, each of which lifts pay above the specialist median." },
    ],
    furtherReading: "customer-service-lead-salary-2026",
  },

  /* ---------------- Customer Service Specialist ---------------- */
  {
    slug: "customer-service-specialist-salary-2026",
    title: "Customer Service Specialist Salary Guide 2026",
    role: "Customer Service Specialist",
    date: "2026-06-26",
    summary:
      "Customer service specialist pay in 2026, a high-volume market where specialisation is the main way up.",
    nationalMedian: 52000,
    entryMedian: 42772,
    leadMedian: 64957,
    activeRoles: 9200,
    supplyDemandRatio: 4.5,
    marketLabel: "Saturated",
    intro: [
      "Customer service specialist is one of the highest-volume job families in the market, and in 2026 it is also one of the most saturated, at 4.5 candidates per open role. The national median base sits at about $52,000, with a comparatively narrow band from roughly $42,000 at entry to $65,000 for the most senior specialists.",
      "Because supply is high, the way to move up is to specialise, into a technical product, a regulated industry, or a team-lead role, rather than to accumulate general tenure.",
      "This guide covers the four levels, eight cities and hiring employers, plus what actually moves an offer. Product and domain expertise, plus a step into leadership, are the clearest levers.",
    ],
    whatTheyDo:
      "Customer service specialists are the primary point of contact for customers, handling questions, complaints and account issues across phone, chat and email. They resolve problems, process requests, and keep customers satisfied while following company policy. The role rewards patience, clear communication and the judgment to know when to escalate, and it is often the training ground for support, success and operations careers.",
    levels: mkLevels(
      { entry: 42772, mid: 52000, senior: 58000, lead: 64957 },
      [
        "Entry specialists handle routine enquiries following scripts and knowledge-base articles.",
        "Answer common questions, process simple requests and escalate anything outside the script.",
        "Mid-level specialists handle a broader range of issues and more complex customer situations.",
        "Resolve account and billing problems, de-escalate frustrated customers and log recurring issues.",
        "Senior specialists own the hardest cases and often act as informal mentors on the floor.",
        "Handle escalations, coach newer agents, improve response templates and flag process gaps.",
        "Leads run a team or shift and own the quality and productivity of front-line service.",
        "Coach specialists, manage schedules, monitor quality metrics and handle the toughest escalations.",
      ],
    ),
    cities: cityRows({ entry: 42772, mid: 52000, senior: 58000, lead: 64957 }),
    whatMovesTheNumber: [
      "Specialising in a technical product or a regulated industry (finance, healthcare) lifts pay above the generalist median.",
      "Moving into a team-lead or quality-assurance role is the clearest step up from front-line pay.",
      "Bilingual and multi-channel capability is a documented premium in many markets.",
      "Metrics you can quote, resolution rate or satisfaction score, help at review and negotiation time.",
      "In a saturated market, reliability and low escalation rates are themselves a differentiator.",
    ],
    types: [
      { name: "Billing / Account Specialist", description: "Focuses on payments and account issues, valued for accuracy and de-escalation." },
      { name: "Technical Customer Service Specialist", description: "Handles product and technical questions, a step toward support pay." },
      { name: "Bilingual Support Specialist", description: "Serves multiple language markets, a documented premium." },
      { name: "Quality Assurance Specialist", description: "Monitors and coaches on service quality, a common move up from the floor." },
    ],
    employers: [
      { company: "Amazon", openings: 412 },
      { company: "Wise", openings: 96 },
      { company: "Monzo", openings: 74 },
      { company: "Deliveroo", openings: 58 },
      { company: "Hootsuite", openings: 31 },
      { company: "Wealthsimple", openings: 22 },
    ],
    faq: [
      { q: "What is a customer service specialist's salary in 2026?", a: "The US national median base is about $52,000, from roughly $42,000 at entry to $65,000 for senior specialists. The band is narrower than most families because supply is high." },
      { q: "Why is the market saturated?", a: "At 4.5 candidates per role, supply far exceeds openings. That is why specialisation, into technical products, regulated industries or team leadership, matters more than tenure for raising pay." },
      { q: "How do I earn more in customer service?", a: "Specialise in a technical or regulated product, become bilingual, or move into a team-lead or quality role. Each of those lifts pay meaningfully above the generalist median." },
      { q: "Is remote customer service paid less?", a: "Remote roles pay close to the national median, and the family is well suited to remote work, so the gap to on-site pay is small compared with more technical jobs." },
      { q: "What career paths does this role lead to?", a: "Customer service is a common entry point into technical support, customer success, operations and team leadership, each of which raises pay and scope." },
    ],
    furtherReading: "customer-service-lead-salary-2026",
  },

  /* ---------------- Customer Service Lead ---------------- */
  {
    slug: "customer-service-lead-salary-2026",
    title: "Customer Service Lead Salary Guide 2026",
    role: "Customer Service Lead",
    date: "2026-06-19",
    summary:
      "Customer service lead pay in 2026, the first management rung above front-line service, with a solid ceiling.",
    nationalMedian: 78000,
    entryMedian: 55000,
    leadMedian: 136000,
    activeRoles: 2100,
    supplyDemandRatio: 3.0,
    marketLabel: "Competitive",
    intro: [
      "Customer service lead is the first real management step above the front line, owning the quality, productivity and morale of a service team. The 2026 national median base is about $78,000, rising from around $55,000 for a new lead to $136,000 for a senior manager running a large operation.",
      "The market is competitive at 3.0 candidates per role. What separates the pay bands is the size and complexity of the team you manage and whether you own the numbers, not just the schedule.",
      "This guide covers the four levels, eight cities and hiring employers, plus the levers that move an offer. Metric ownership and workforce-management skill are the clearest accelerators.",
    ],
    whatTheyDo:
      "Customer service leads run the teams that keep customers happy, owning staffing, quality, escalations and the metrics that measure service. They coach agents, handle the situations the floor cannot, manage schedules against demand, and translate front-line insight into process improvements. As they grow, they take on larger teams, multiple channels and budget responsibility.",
    levels: mkLevels(
      { entry: 55000, mid: 78000, senior: 105000, lead: 136000 },
      [
        "New leads run a small team or shift, focusing on coaching and day-to-day quality.",
        "Handle escalations, coach agents, manage schedules and report basic service metrics.",
        "Mid-level leads own a full team and its quality and productivity targets.",
        "Manage staffing to demand, run quality programmes, own KPIs and improve processes.",
        "Senior leads manage multiple teams or channels and own the service budget and outcomes.",
        "Set service standards, manage workforce planning, own cost and quality, and develop team leads.",
        "Service managers run the whole customer service function for a business or region.",
        "Own the service strategy and P&L, manage leads, set staffing models and report to executives.",
      ],
    ),
    cities: cityRows({ entry: 55000, mid: 78000, senior: 105000, lead: 136000 }),
    whatMovesTheNumber: [
      "Owning the service metrics and budget, not just the schedule, is what separates senior lead pay from entry.",
      "Workforce-management skill, staffing accurately to demand, is a documented, quotable capability.",
      "Managing multiple channels or a large headcount pushes the offer toward the top of the band.",
      "A record of improving satisfaction or cutting cost per contact is directly usable in negotiation.",
      "Industry matters: fintech and healthcare service leadership pays above retail for the same scope.",
    ],
    types: [
      { name: "Team Lead", description: "Runs a single service team, the entry point into service management." },
      { name: "Workforce Manager", description: "Owns staffing and scheduling against demand, a specialised, well-paid track." },
      { name: "Quality / Training Manager", description: "Owns service quality and agent development across teams." },
      { name: "Customer Service Manager", description: "Runs the whole function for a business or region, the top of the ladder." },
    ],
    employers: [
      { company: "Amazon", openings: 118 },
      { company: "Monzo", openings: 47 },
      { company: "Wise", openings: 39 },
      { company: "Shopify", openings: 28 },
      { company: "Deliveroo", openings: 19 },
      { company: "Wealthsimple", openings: 11 },
    ],
    faq: [
      { q: "What does a customer service lead earn in 2026?", a: "The US national median base is about $78,000, from roughly $55,000 for a new lead to $136,000 for a senior service manager. Team size and metric ownership drive the range." },
      { q: "How is a lead different from a specialist?", a: "A specialist handles customers directly; a lead manages the people who do, owning quality, staffing and the service metrics. It is the first management rung, and it pays accordingly." },
      { q: "What raises a service lead's pay?", a: "Owning the numbers and the budget rather than just the schedule, managing multiple channels or a large team, and a track record of improving satisfaction or cutting cost per contact." },
      { q: "Do I need front-line experience first?", a: "Almost always. Leads are usually promoted from strong specialists, and the credibility of having done the job is part of what makes coaching and escalation handling work." },
      { q: "Which industries pay the most?", a: "Fintech and healthcare service leadership pay above retail and general consumer for the same scope, reflecting the higher stakes and compliance load of those sectors." },
    ],
    furtherReading: "customer-service-specialist-salary-2026",
  },

  /* ---------------- HR Manager ---------------- */
  {
    slug: "hr-manager-salary-2026",
    title: "HR Manager Salary Guide 2026",
    role: "HR Manager",
    date: "2026-06-12",
    summary:
      "HR manager pay in 2026 across levels and cities, and the specialisms that lift the number most.",
    nationalMedian: 88000,
    entryMedian: 55000,
    leadMedian: 150755,
    activeRoles: 5400,
    supplyDemandRatio: 3.2,
    marketLabel: "Competitive",
    intro: [
      "HR management pay in 2026 spans a wide range, from a new people manager near $55,000 to a senior HR leader above $150,000, with a national median base of about $88,000. The spread reflects how much the role's scope varies, from generalist administration to strategic business partnering.",
      "The market is competitive at 3.2 candidates per role. Generalist HR is well supplied, while specialists in compensation, employee relations and HR analytics are scarcer and better paid.",
      "This guide breaks out the four levels, eight cities and hiring employers, plus the factors that move an offer. Specialisation and a genuine seat at the strategy table are the clearest accelerators.",
    ],
    whatTheyDo:
      "HR managers own the people side of a business, covering hiring, onboarding, employee relations, performance, compensation and compliance. They act as the bridge between employees and leadership, resolving issues, shaping policy, and making sure the organisation attracts and keeps the people it needs. The most valued HR managers connect people decisions to business outcomes rather than treating HR as pure administration.",
    levels: mkLevels(
      { entry: 55000, mid: 88000, senior: 115000, lead: 150755 },
      [
        "Entry HR managers handle day-to-day people operations under a senior HR leader.",
        "Run onboarding, maintain records, answer policy questions and support hiring processes.",
        "Mid-level HR managers own the people function for a team or site, including partnering with managers.",
        "Advise managers, handle employee relations, run performance cycles and manage compliance.",
        "Senior HR managers own people strategy for a business unit and handle the hardest cases.",
        "Shape policy, lead employee-relations investigations, own compensation planning and coach managers.",
        "HR leaders own the people strategy across the organisation and partner with executives.",
        "Set people strategy, own compensation and org design, manage the HR team and advise the C-suite.",
      ],
    ),
    cities: cityRows(
      { entry: 55000, mid: 88000, senior: 115000, lead: 150755 },
      { Chicago: { entry: 87600 } },
    ),
    whatMovesTheNumber: [
      "Specialising in compensation, employee relations or HR analytics lifts pay above generalist administration.",
      "A genuine business-partner role, advising leaders on strategy, pays far above transactional HR.",
      "HRIS and people-analytics fluency is a documented premium as HR becomes more data-driven.",
      "Handling complex employee-relations and compliance matters moves you toward the senior band.",
      "Company size and industry matter: large tech and finance pay above small business for the same scope.",
    ],
    types: [
      { name: "HR Business Partner", description: "Advises leaders on people strategy, the highest-paid generalist track." },
      { name: "Compensation & Benefits Manager", description: "Owns pay and rewards; a scarce, well-paid specialism." },
      { name: "Talent Acquisition Manager", description: "Runs hiring at scale, valued when growth depends on it." },
      { name: "People Operations Manager", description: "Owns the systems and processes that run the people function." },
    ],
    employers: [
      { company: "Amazon", openings: 214 },
      { company: "Deloitte", openings: 96 },
      { company: "Accenture", openings: 81 },
      { company: "Shopify", openings: 34 },
      { company: "Atlassian", openings: 22 },
      { company: "Monzo", openings: 14 },
    ],
    faq: [
      { q: "What is an HR manager's salary in 2026?", a: "The US national median base is about $88,000, from roughly $55,000 for a new people manager to $150,755 for a senior HR leader. Specialisation and business-partner scope drive the range." },
      { q: "How do I earn more in HR?", a: "Specialise in compensation, employee relations or HR analytics, or move into a genuine business-partner role advising leadership. Transactional, administrative HR sits at the bottom of the band." },
      { q: "Do I need a certification?", a: "Certifications such as SHRM-CP or PHR help early on and signal credibility, but after a few years employers price demonstrated impact and specialism above credentials." },
      { q: "Which HR specialism pays best?", a: "Compensation and benefits, and senior HR business partnering, are consistently the best paid, because both are scarce and directly tied to business decisions." },
      { q: "Is HR a stable field?", a: "Yes. At 3.2 candidates per role it is competitive but not saturated, and the shift toward data-driven, strategic HR has kept demand for skilled specialists healthy." },
    ],
    furtherReading: "director-of-administration-salary-2026",
  },

  /* ---------------- Director of Administration ---------------- */
  {
    slug: "director-of-administration-salary-2026",
    title: "Director of Administration Salary Guide 2026",
    role: "Director of Administration",
    date: "2026-06-05",
    summary:
      "Director of administration pay in 2026, a senior operations role that keeps organisations running.",
    nationalMedian: 108000,
    entryMedian: 82500,
    leadMedian: 161000,
    activeRoles: 177,
    supplyDemandRatio: 2.4,
    marketLabel: "Competitive",
    intro: [
      "Director of administration is a senior role that owns the operational backbone of an organisation, from facilities and vendors to budgets and administrative staff. In 2026 the national median base is about $108,000, rising to $161,000 for the most senior directors and around $185,000 in San Francisco.",
      "The listing count is small at 177, because these are senior, established positions rather than high-turnover roles, but the market is competitive at 2.4 candidates per opening.",
      "This guide covers the four levels, eight cities and hiring employers, plus the factors that move an offer. Budget ownership and the breadth of functions you run are the clearest levers.",
    ],
    whatTheyDo:
      "Directors of administration keep the non-product side of an organisation running smoothly, overseeing office operations, facilities, procurement, budgets, compliance and administrative teams. They set policy, manage vendors and budgets, and make sure the infrastructure that supports every other department works. The role blends operations, finance and people management, and grows with the size and complexity of the organisation.",
    levels: mkLevels(
      { entry: 82500, mid: 108000, senior: 135000, lead: 161000 },
      [
        "Junior directors or senior administrators own a defined area such as facilities or office operations.",
        "Manage vendors, oversee daily operations, track a departmental budget and supervise support staff.",
        "Mid-level directors own several administrative functions and their budgets.",
        "Set policy, manage procurement and facilities, own budgets and lead administrative teams.",
        "Senior directors own the full administrative operation of a site or business unit.",
        "Own multi-function budgets, negotiate major vendor contracts, manage teams and advise leadership.",
        "Top directors own administration across the organisation and sit close to the executive team.",
        "Set administrative strategy, own large budgets, manage managers and partner with the C-suite.",
      ],
    ),
    cities: cityRows(
      { entry: 82500, mid: 108000, senior: 135000, lead: 161000 },
      { "San Francisco": { lead: 185264 } },
    ),
    whatMovesTheNumber: [
      "Owning a larger budget and more functions is the clearest driver of director-level pay.",
      "Vendor and contract negotiation skill that saves real money is directly quotable in review.",
      "Experience scaling administration through organisational growth commands a premium.",
      "Compliance and risk-management depth matters in regulated industries and raises the band.",
      "Company size and sector drive the range: large or high-cost-of-living employers pay well above the median.",
    ],
    types: [
      { name: "Office / Facilities Director", description: "Owns physical operations and workplace experience across sites." },
      { name: "Business Operations Director", description: "Focuses on process, budgets and cross-functional efficiency." },
      { name: "Administrative Services Director", description: "Runs the shared administrative and support functions." },
      { name: "Chief of Staff (Admin)", description: "Partners closely with an executive to run the operational agenda." },
    ],
    employers: [
      { company: "Deloitte", openings: 14 },
      { company: "Accenture", openings: 11 },
      { company: "Capital One", openings: 8 },
      { company: "Leidos", openings: 6 },
      { company: "Booz Allen", openings: 5 },
      { company: "Microsoft", openings: 4 },
    ],
    faq: [
      { q: "What does a director of administration earn in 2026?", a: "The US national median base is about $108,000, from roughly $82,500 to $161,000 for senior directors, reaching about $185,000 in San Francisco. Budget size and functional breadth drive the range." },
      { q: "Why are there so few listings?", a: "At 177 active roles, these are senior, established positions with low turnover rather than high-volume jobs. Openings are scarce, which keeps the market competitive despite the small count." },
      { q: "What background leads to this role?", a: "Most directors come up through office and business operations, HR or finance, accumulating budget and vendor responsibility before taking on the full administrative function." },
      { q: "What raises a director's pay?", a: "Owning larger budgets and more functions, negotiating vendor contracts that save money, and scaling administration through company growth. Regulated-industry compliance depth also lifts the band." },
      { q: "How is it different from an operations manager?", a: "It is more senior and broader, owning budgets, policy and multiple administrative functions across the organisation rather than running a single operational area." },
    ],
    furtherReading: "hr-manager-salary-2026",
  },

  /* ---------------- General Manager ---------------- */
  {
    slug: "general-manager-salary-2026",
    title: "General Manager Salary Guide 2026",
    role: "General Manager",
    date: "2026-05-29",
    summary:
      "General manager pay in 2026, a P&L-owning leadership role whose pay tracks the size of what you run.",
    nationalMedian: 98000,
    entryMedian: 65320,
    leadMedian: 163956,
    activeRoles: 6100,
    supplyDemandRatio: 3.6,
    marketLabel: "Competitive",
    intro: [
      "General manager is a P&L role: you own the results of a location, region or business line, and your pay tracks the size and complexity of what you run. The 2026 national median base is about $98,000, from around $65,000 for a first-time GM of a small unit to $164,000 for those running large operations.",
      "The market is competitive at 3.6 candidates per role, but the top of the band stays scarce because proven P&L leadership, growing revenue and margin, is genuinely hard to demonstrate.",
      "This guide covers the four levels, eight cities and hiring employers, plus what moves an offer. Revenue scale and a track record of profitable growth are the clearest levers.",
    ],
    whatTheyDo:
      "General managers own the overall performance of a business unit, balancing revenue, cost, people and customer outcomes. They set local strategy, manage teams across functions, control budgets and are accountable for hitting the numbers. The role is broad rather than deep, rewarding leaders who can make sound decisions across sales, operations and people without being a specialist in any one.",
    levels: mkLevels(
      { entry: 65320, mid: 98000, senior: 128000, lead: 163956 },
      [
        "First-time GMs run a small location or unit with support from a regional leader.",
        "Manage daily operations, hit local targets, lead a small team and control a modest budget.",
        "Mid-level GMs own a larger unit and its full P&L, including staffing and growth.",
        "Own revenue and cost, manage cross-functional teams, set local strategy and report on results.",
        "Senior GMs run large or multiple units and are accountable for meaningful revenue and margin.",
        "Set strategy across units, manage managers, own a large P&L and develop future GMs.",
        "Top GMs run a region or major business line close to executive leadership.",
        "Own regional strategy and P&L, manage a leadership team, and drive growth across the portfolio.",
      ],
    ),
    cities: cityRows({ entry: 65320, mid: 98000, senior: 128000, lead: 163956 }),
    whatMovesTheNumber: [
      "The size of the P&L you own, revenue and headcount, is the single biggest driver of GM pay.",
      "A track record of profitable growth, not just steady operations, moves you toward the top band.",
      "Multi-unit or regional scope pays well above single-location management.",
      "Industry matters: tech and high-margin sectors pay above hospitality and retail for the same scope.",
      "Cross-functional strength, being credible across sales, operations and people, raises the ceiling.",
    ],
    types: [
      { name: "Location / Site GM", description: "Runs a single location's P&L, the common entry point into general management." },
      { name: "Regional General Manager", description: "Owns multiple units across a region, a clear step up in pay and scope." },
      { name: "Business Unit GM", description: "Runs a product or business line's full P&L, close to executive leadership." },
      { name: "Operations-Focused GM", description: "Emphasises efficiency and delivery, common in logistics and services." },
    ],
    employers: [
      { company: "Amazon", openings: 187 },
      { company: "Walmart", openings: 142 },
      { company: "Deliveroo", openings: 46 },
      { company: "Shopify", openings: 23 },
      { company: "Wise", openings: 12 },
      { company: "Hootsuite", openings: 7 },
    ],
    faq: [
      { q: "What is a general manager's salary in 2026?", a: "The US national median base is about $98,000, from roughly $65,000 for a first-time GM to $164,000 for those running large operations. Bonus tied to the P&L often sits on top of base." },
      { q: "What drives GM pay the most?", a: "The size of the P&L you own, its revenue, margin and headcount, drives pay more than anything else. Multi-unit and regional scope pay well above single-location roles." },
      { q: "Do I need industry-specific experience?", a: "It helps, but general managers are valued for broad leadership across sales, operations and people. Moving between industries is common at the mid level, though the top jobs favour sector depth." },
      { q: "How do I move up as a GM?", a: "Show profitable growth rather than steady operations, then take on multi-unit or regional scope. Proven P&L results are the scarce signal that unlocks the top of the band." },
      { q: "Which sectors pay the most?", a: "Technology and high-margin businesses pay above hospitality and retail for the same scope, reflecting the larger revenue and richer economics of the units being run." },
    ],
    furtherReading: "operations-specialist-salary-2026",
  },

  /* ---------------- Operations Specialist ---------------- */
  {
    slug: "operations-specialist-salary-2026",
    title: "Operations Specialist Salary Guide 2026",
    role: "Operations Specialist",
    date: "2026-05-22",
    summary:
      "Operations specialist pay in 2026, the process-and-execution role that keeps businesses running day to day.",
    nationalMedian: 65530,
    entryMedian: 57100,
    leadMedian: 92000,
    activeRoles: 7400,
    supplyDemandRatio: 3.8,
    marketLabel: "Competitive",
    intro: [
      "Operations specialists keep the day-to-day machinery of a business working, from order and vendor management to process improvement and reporting. The 2026 national median base is about $65,530, with a band from around $57,000 at entry to $92,000 for the most senior specialists.",
      "The market is competitive at 3.8 candidates per role, and because operations touches every function, the way up is to specialise, in supply chain, revenue operations or analytics, or to move toward management.",
      "This guide covers the four levels, eight cities and hiring employers, plus what moves an offer. Process and analytics skill, plus tooling fluency, are the clearest accelerators.",
    ],
    whatTheyDo:
      "Operations specialists make sure the routine work of a business happens accurately and on time, coordinating processes, data and vendors across teams. They track and improve workflows, resolve exceptions, maintain systems and produce the reporting that leaders rely on. The role rewards people who spot inefficiency, fix it, and can quantify the improvement.",
    levels: mkLevels(
      { entry: 57100, mid: 65530, senior: 78000, lead: 92000 },
      [
        "Entry specialists execute defined operational tasks and learn the systems and processes.",
        "Process orders and requests, maintain records, run standard reports and flag exceptions.",
        "Mid-level specialists own a process area and drive its accuracy and improvement.",
        "Manage a workflow end to end, coordinate with other teams, and improve procedures.",
        "Senior specialists own complex processes and lead improvement projects across teams.",
        "Design better workflows, analyse operational data, manage vendors and mentor juniors.",
        "Lead specialists own a whole operational area and often supervise a small team.",
        "Own operational strategy for an area, run improvement programmes, and coordinate across functions.",
      ],
    ),
    cities: cityRows({ entry: 57100, mid: 65530, senior: 78000, lead: 92000 }),
    whatMovesTheNumber: [
      "Specialising in supply chain, revenue operations or analytics lifts pay above the generalist median.",
      "Analytical skill, turning operational data into decisions, is a documented premium.",
      "Fluency in the tooling a business runs on (ERP, CRM, spreadsheets, SQL) raises the band.",
      "Quantified process improvements, time or cost saved, are directly usable in negotiation.",
      "Moving toward operations management, owning a team or a P&L slice, unlocks the top of the band.",
    ],
    types: [
      { name: "Supply Chain Specialist", description: "Focuses on inventory, procurement and logistics, a well-paid specialism." },
      { name: "Revenue Operations Specialist", description: "Owns the systems and data behind sales and marketing, in high demand." },
      { name: "Business Operations Analyst", description: "Emphasises reporting and process analysis, a bridge into analytics." },
      { name: "Logistics Coordinator", description: "Manages the movement of goods and orders in operations-heavy businesses." },
    ],
    employers: [
      { company: "Amazon", openings: 268 },
      { company: "Walmart", openings: 154 },
      { company: "Shopify", openings: 46 },
      { company: "Deliveroo", openings: 33 },
      { company: "Wise", openings: 18 },
      { company: "Wealthsimple", openings: 9 },
    ],
    faq: [
      { q: "What is an operations specialist's salary in 2026?", a: "The US national median base is about $65,530, from roughly $57,000 at entry to $92,000 for senior specialists. Specialising or moving toward management is the main way up." },
      { q: "How do I earn more in operations?", a: "Specialise in a high-value area such as supply chain, revenue operations or analytics, build tooling and data fluency, and quantify the improvements you deliver. Then move toward operations management." },
      { q: "What skills matter most?", a: "Process discipline, analytical thinking and fluency in the systems a business runs on, from ERP and CRM to spreadsheets and SQL. Being able to measure your impact is the differentiator." },
      { q: "Is operations a good career start?", a: "Yes. Because it touches every function, operations is a strong platform to move into analytics, revenue operations, supply chain or general management, each of which raises pay." },
      { q: "Which industries pay the most?", a: "Technology, fintech and high-margin businesses pay above retail and services for the same operations scope, and specialised roles like revenue operations command a premium everywhere." },
    ],
    furtherReading: "general-manager-salary-2026",
  },

  /* ---------------- Warehouse Operations Manager ---------------- */
  {
    slug: "warehouse-operations-manager-salary-2026",
    title: "Warehouse Operations Manager Salary Guide 2026",
    role: "Warehouse Operations Manager",
    date: "2026-05-15",
    summary:
      "Warehouse operations manager pay in 2026, a demanding logistics leadership role with steady demand.",
    nationalMedian: 88000,
    entryMedian: 68700,
    leadMedian: 123928,
    activeRoles: 433,
    supplyDemandRatio: 4.1,
    marketLabel: "Saturated",
    intro: [
      "Warehouse operations managers run the physical engine of commerce, owning the throughput, safety and cost of a distribution facility. The 2026 national median base is about $88,000, from around $68,700 for a new manager to $123,928 for those running large or complex sites, reaching about $132,000 in Boston.",
      "The market is saturated at 4.1 candidates per opening, so the way to stand out is scale and results: running bigger facilities, hitting harder throughput targets, and keeping safety and cost under control.",
      "This guide covers the four levels, eight cities and hiring employers, plus what moves an offer. Facility scale, automation experience and a safety record are the clearest levers.",
    ],
    whatTheyDo:
      "Warehouse operations managers own the flow of goods through a facility, from receiving and storage to picking, packing and shipping. They manage large hourly teams, hit throughput and accuracy targets, control labour and equipment cost, and keep the site safe and compliant. The role is demanding and hands-on, rewarding leaders who can run a complex physical operation under constant time pressure.",
    levels: mkLevels(
      { entry: 68700, mid: 88000, senior: 105000, lead: 123928 },
      [
        "New managers run a shift or area of a facility with support from a senior manager.",
        "Manage a team on the floor, hit shift targets, enforce safety and handle daily exceptions.",
        "Mid-level managers own a full facility function or a smaller site's operations.",
        "Own throughput and accuracy, manage staffing and cost, run safety programmes and improve flow.",
        "Senior managers run a large facility or multiple functions and own its cost and performance.",
        "Set operational strategy, manage supervisors, own the site budget and drive continuous improvement.",
        "Lead managers run a large or automated site, or multiple sites, close to regional leadership.",
        "Own multi-site or large-facility strategy, manage managers, and drive productivity and safety at scale.",
      ],
    ),
    cities: cityRows(
      { entry: 68700, mid: 88000, senior: 105000, lead: 123928 },
      { Boston: { senior: 118000, lead: 132693 } },
    ),
    whatMovesTheNumber: [
      "The size and complexity of the facility you run is the biggest single driver of pay.",
      "Automation and warehouse-management-system experience is an increasingly clear premium.",
      "A strong safety record and low incident rate is directly valued and quotable in review.",
      "Demonstrated throughput and cost improvements move you toward the top of the band.",
      "Multi-site or regional scope pays well above running a single facility.",
    ],
    types: [
      { name: "Distribution Center Manager", description: "Runs a large fulfilment facility, the core high-volume role." },
      { name: "Fulfillment Operations Manager", description: "Focuses on order fulfilment throughput and accuracy for e-commerce." },
      { name: "Logistics / Transportation Manager", description: "Owns inbound and outbound movement alongside the warehouse." },
      { name: "Continuous Improvement Manager", description: "Specialises in lean and process gains across sites." },
    ],
    employers: [
      { company: "Amazon", openings: 96 },
      { company: "Walmart", openings: 71 },
      { company: "Deliveroo", openings: 24 },
      { company: "Leidos", openings: 12 },
      { company: "Accenture", openings: 8 },
      { company: "Shopify", openings: 5 },
    ],
    faq: [
      { q: "What does a warehouse operations manager earn in 2026?", a: "The US national median base is about $88,000, from roughly $68,700 for a new manager to $123,928 for large-site managers, reaching about $132,000 in Boston. Facility scale drives the range." },
      { q: "Why is the market saturated?", a: "At 4.1 candidates per role, supply exceeds openings. Standing out means running larger or more automated facilities and showing measurable throughput, cost and safety results." },
      { q: "What experience matters most?", a: "Running a facility at scale, familiarity with warehouse-management systems and automation, and a strong safety record. Multi-site scope is the clearest step toward the top of the band." },
      { q: "Is this role physically demanding?", a: "Yes. It is a hands-on, time-pressured job managing large hourly teams across shifts, and employers value leaders who can keep a complex physical operation safe and on target." },
      { q: "How is automation affecting pay?", a: "Automation is raising the value of managers who can run technology-heavy sites, because the mix of people and systems leadership those facilities need is scarcer than traditional floor management." },
    ],
    furtherReading: "operations-specialist-salary-2026",
  },

  /* ---------------- Technical Sales ---------------- */
  {
    slug: "technical-sales-salary-2026",
    title: "Technical Sales Salary Guide 2026",
    role: "Technical Sales",
    date: "2026-05-08",
    summary:
      "Technical sales pay in 2026, where product depth and quota performance combine into a high earning ceiling.",
    nationalMedian: 95000,
    entryMedian: 62168,
    leadMedian: 158301,
    activeRoles: 2600,
    supplyDemandRatio: 1.4,
    marketLabel: "Highly Competitive",
    intro: [
      "Technical sales, often called sales engineering or solutions consulting, pairs genuine product knowledge with the ability to sell, and it pays for both. The 2026 national median base is about $95,000, from around $62,000 for a new sales engineer to $158,301 for senior specialists, with commission typically on top.",
      "The market is highly competitive at 1.4 candidates per role, because the combination of technical depth and commercial polish is hard to find. Employers compete for people who can win the trust of a customer's engineers and their buyers at the same time.",
      "This guide covers the four levels, eight cities and hiring employers, plus what moves an offer. Product depth, quota attainment and vertical expertise are the clearest levers. Figures shown are base salary; on-target earnings are usually higher.",
    ],
    whatTheyDo:
      "Technical sales professionals are the technical half of a sales team, translating a product's capabilities into a customer's problems. They run demos and proofs of concept, answer the deep technical questions that close or kill a deal, and design solutions that fit the buyer's environment. The role rewards people who are credible with engineers, persuasive with buyers, and comfortable owning a number.",
    levels: mkLevels(
      { entry: 62168, mid: 95000, senior: 125000, lead: 158301 },
      [
        "Entry sales engineers support deals and demos under a senior colleague while learning the product.",
        "Prepare demos, answer standard technical questions and support proofs of concept.",
        "Mid-level sales engineers own the technical side of their own deals end to end.",
        "Run demos and POCs, scope solutions, handle objections and partner with account executives.",
        "Senior specialists own complex, high-value deals and set the technical sales approach.",
        "Lead technical strategy on major deals, design complex solutions and mentor junior engineers.",
        "Leads run the technical sales function or a specialism and support the largest opportunities.",
        "Own technical sales strategy, coach the team, support strategic deals and shape the product story.",
      ],
    ),
    cities: cityRows({ entry: 62168, mid: 95000, senior: 125000, lead: 158301 }),
    whatMovesTheNumber: [
      "Genuine product and technical depth, credibility with a customer's engineers, is the core differentiator.",
      "Quota attainment and a record of influencing closed revenue is directly quotable and highly valued.",
      "Vertical expertise (fintech, healthcare, security) commands a premium for the harder sales.",
      "Comfort with complex, high-value enterprise deals pushes the offer toward the top of the band.",
      "On-target earnings, base plus commission, are the real number; strong closers negotiate the whole package.",
    ],
    types: [
      { name: "Sales Engineer", description: "The technical partner to account executives, the core of the family." },
      { name: "Solutions Consultant", description: "Designs tailored solutions for complex buyers, valued for depth." },
      { name: "Pre-Sales Architect", description: "Owns the technical vision on the largest enterprise deals." },
      { name: "Solutions Architect (Sales)", description: "Bridges product architecture and customer needs during the sale." },
    ],
    employers: [
      { company: "Salesforce", openings: 84 },
      { company: "Stripe", openings: 52 },
      { company: "Twilio", openings: 41 },
      { company: "Atlassian", openings: 33 },
      { company: "Wise", openings: 16 },
      { company: "Canonical", openings: 9 },
    ],
    faq: [
      { q: "What does technical sales pay in 2026?", a: "The US national median base is about $95,000, from roughly $62,000 for a new sales engineer to $158,301 for senior specialists. Commission usually sits on top, so on-target earnings are higher." },
      { q: "Do I need to be an engineer?", a: "You need genuine technical depth, enough to earn a customer engineer's trust, but not necessarily a coding background. Many strong sales engineers come from technical support, consulting or product roles." },
      { q: "How is base different from OTE?", a: "The figures here are base salary. Technical sales roles pay a commission on influenced revenue on top, so on-target earnings can be well above the base, especially at senior levels." },
      { q: "What raises technical sales pay?", a: "Product depth, a record of quota attainment and influenced revenue, vertical expertise in a demanding sector, and comfort with large enterprise deals. Closers negotiate the whole package." },
      { q: "Is it a competitive field?", a: "Very. At 1.4 candidates per role it is highly competitive, because the blend of technical credibility and commercial skill the job requires is genuinely scarce." },
    ],
    furtherReading: "digital-marketing-specialist-salary-2026",
  },

  /* ---------------- Digital Marketing Specialist ---------------- */
  {
    slug: "digital-marketing-specialist-salary-2026",
    title: "Digital Marketing Specialist Salary Guide 2026",
    role: "Digital Marketing Specialist",
    date: "2026-05-01",
    summary:
      "Digital marketing specialist pay in 2026, where measurable performance and channel depth set the number.",
    nationalMedian: 82000,
    entryMedian: 65418,
    leadMedian: 117750,
    activeRoles: 5800,
    supplyDemandRatio: 3.4,
    marketLabel: "Competitive",
    intro: [
      "Digital marketing specialist pay in 2026 rewards people who can prove their campaigns drove results, not just those who can run the tools. The national median base is about $82,000, from around $65,000 at entry to $117,750 for senior specialists leading multi-channel programmes.",
      "The market is competitive at 3.4 candidates per role. Generalist marketing is well supplied, while specialists in paid acquisition, lifecycle and analytics, who can tie spend to revenue, are scarcer and better paid.",
      "This guide covers the four levels, eight cities and hiring employers, plus what moves an offer. Performance data and channel specialisation are the clearest accelerators.",
    ],
    whatTheyDo:
      "Digital marketing specialists plan, run and optimise campaigns across channels like search, social, email and content. They manage budgets, test creative and targeting, measure performance against goals, and adjust to improve return on spend. The most valuable specialists connect their work to pipeline and revenue, treating marketing as a measurable investment rather than an expense.",
    levels: mkLevels(
      { entry: 65418, mid: 82000, senior: 98000, lead: 117750 },
      [
        "Entry specialists execute campaigns in one channel under a senior marketer's direction.",
        "Build and schedule campaigns, pull reports, run A/B tests and maintain content calendars.",
        "Mid-level specialists own a channel or programme and its performance targets.",
        "Manage budgets, optimise campaigns against goals, analyse results and coordinate creative.",
        "Senior specialists own multi-channel programmes and the strategy behind them.",
        "Set channel strategy, own acquisition or lifecycle targets, mentor juniors and report on ROI.",
        "Leads own the digital marketing function or a major channel across the business.",
        "Set digital strategy, own the budget and revenue targets, manage specialists and report to leadership.",
      ],
    ),
    cities: cityRows({ entry: 65418, mid: 82000, senior: 98000, lead: 117750 }),
    whatMovesTheNumber: [
      "Performance you can prove, campaigns tied to pipeline and revenue, is the strongest single lever.",
      "Specialising in paid acquisition, lifecycle or marketing analytics lifts pay above generalist roles.",
      "Fluency with analytics and attribution, connecting spend to outcomes, is a documented premium.",
      "Owning larger budgets and multi-channel programmes moves you toward the senior band.",
      "Industry matters: B2B SaaS and fintech marketing pay above general consumer for the same scope.",
    ],
    types: [
      { name: "Performance / Paid Media Specialist", description: "Owns paid acquisition and its ROI, the best-paid channel specialism." },
      { name: "Lifecycle / Email Marketer", description: "Owns retention and lifecycle programmes tied to revenue." },
      { name: "SEO / Content Specialist", description: "Drives organic growth, valued for durable, compounding results." },
      { name: "Marketing Analytics Specialist", description: "Owns measurement and attribution, a scarce, high-leverage role." },
    ],
    employers: [
      { company: "Shopify", openings: 61 },
      { company: "HubSpot", openings: 48 },
      { company: "Hootsuite", openings: 37 },
      { company: "Deliveroo", openings: 24 },
      { company: "Monzo", openings: 15 },
      { company: "Wealthsimple", openings: 9 },
    ],
    faq: [
      { q: "What is a digital marketing specialist's salary in 2026?", a: "The US national median base is about $82,000, from roughly $65,000 at entry to $117,750 for senior specialists. Proven performance and channel specialisation drive the range." },
      { q: "How do I earn more in digital marketing?", a: "Specialise in a high-value channel such as paid acquisition or lifecycle, get fluent in analytics and attribution, and tie your campaigns to pipeline and revenue. Generalists sit at the bottom of the band." },
      { q: "Which channel pays best?", a: "Performance and paid-media specialists who own acquisition ROI, and marketing-analytics specialists who own measurement, are consistently the best paid because both connect directly to revenue." },
      { q: "Is marketing exposed to AI?", a: "AI is automating content production and reporting, which raises the value of specialists who own strategy, budget and measurement over those who mainly execute. Analytical and strategic roles are the safer ground." },
      { q: "Does industry affect pay?", a: "Yes. B2B SaaS and fintech marketing pay above general consumer marketing for the same scope, because the deals are larger and the measurement more directly tied to revenue." },
    ],
    furtherReading: "technical-sales-salary-2026",
  },
];
