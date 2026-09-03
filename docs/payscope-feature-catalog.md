# PayScope.ai — Verified Feature Catalog (scraped 2026-09-03)

Source pages fetched (server-side via Exa + Nimble; direct egress to payscope.ai is blocked in the build sandbox):
`/`, `/pricing`, `/features/resume-analysis`, `/features/job-analysis`, `/features/resume-improvement`,
`/features/jobs-pipeline`, `/for-recruiters`, `/salaries`, `/salaries/software-engineer-salary-2026`,
`/salaries/devops-engineer-salary-2026`, `/about`, `/blog`, `/privacy`, `/terms`, `/contact`.

Everything below is what the live site actually ships. This file is the product spec for the app in this repo.
Where the app implements a feature, the route is listed in the right-hand column.

---

## 0. Positioning & claims (homepage)

| Item | Verbatim / value | App route |
|---|---|---|
| Eyebrow | "Salary · Offers · Job Search · Career Growth" | `/` |
| H1 | "Know Your **True Worth.** Then Act On It." | `/` |
| Sub | "Upload your resume and get instant salary insights. Discover where you stand in the market and how to level up." | `/` |
| Primary CTA | "Analyze My Resume →" | `/analyze` |
| Hero readout | `$147K` · Senior Product Manager · Los Angeles · Top 25% | `/` |
| Market position | "You're in 25% percentile in your market" | `/` |
| Top skills detected | Product Strategy 85% · Stakeholder Mgmt 72% · AI / Data Skills 44% | `/` |
| Skill-up potential | "+12% — Estimated market value increase with targeted upskilling" | `/` |
| Stats strip | 5.0★ Average user rating · 3 Countries covered · 12K+ Analyses completed · 93% Would recommend · 100% Data stays private | `/` |
| Data claims (FAQ) | 10 million data points every month; model updates daily; US, Canada, UK with city/metro data | `/`, `/insights` |
| Footer tagline | "Career intelligence powered by real market data." | all |

### "Where are you right now?" — four entry intents (each deep-links to a dashboard module)

| Intent | Headline | CTA | Callback module | App route |
|---|---|---|---|---|
| JUST GOT AN OFFER | "Is it fair? Find out in minutes." | Evaluate My Offer | `/dashboard/offer-evaluator` | `/offer` |
| AM I UNDERPAID? | "See exactly where you stand." | Analyze My Resume | `/dashboard/market-value` | `/analyze` |
| LOOKING FOR A NEW ROLE | "Find jobs that actually fit your profile." | Start Job Search | `/dashboard/job-search` | `/jobs` |
| WANT TO EARN MORE | "Map your path to a higher salary." | Build My Plan | `/dashboard/career-growth` | `/growth` |

### How it works
1. **Upload** — "Drop your resume or paste a job description. A basic analysis is available for everyone – sign up to unleash your power!" (30 seconds)
2. **Get your analysis** — "Salary range, market percentile, skill gaps, job matches, improvement priorities – personalized to your actual profile, updated daily." (2 minutes)
3. **Apply and improve** — "Rewrite your resume, find jobs, generate tailored application packs, apply and track your pipeline. Then come back with an updated version and see what changed." (Ongoing)

### "One upload. A complete picture." (resume as the center)
- Salary range based on your actual skills
- Market percentile ranking
- Strengths and gaps mapped to demand
- Skill ROI analysis
- Job recommendations matched to profile
- Example: Floor $81K · Median $89K · Ceiling $98K (Senior PM, Los Angeles)
- Negotiation targets: Your floor $89,000 · Target ask $94,500 · Stretch goal $98,000 · "+ Opening script · Counter-tactics · Total potential gain"

### "Fixes it with you." (Advice → Act)
- Prioritized improvements by market value impact
- AI-assisted section rewrites
- Salary uplift-ranked certifications

### "Everything inside" (six modules)
01 Jobs Pipeline · 02 Learning Roadmap · 03 Compare Offers · 04 Multiple Resume Versions · 05 Market Insights · 06 Recruiter Mode (coming soon)

### Testimonials
- "I finally have a clearer sense of where my salary should sit. Super easy to use and unexpectedly insightful." — Likfong Yeung, Integrated Marketing @ Paraflow (Product Hunt)
- "Super clean and genuinely useful." — Annet, Social Media Content Creator at Loki.Build (Product Hunt)

### FAQ (verbatim questions)
1. How accurate is the market value estimate?
2. What markets does PayScope cover?
3. How is this different from Glassdoor or Levels.fyi?
4. What's the difference between the Professional and Recruiter plans?
5. Is my resume data private?
6. Can I upload multiple versions of my resume?

### Closing CTA
"Stop guessing. Start knowing." · "Upload your resume – get free analysis, no payments required." · "Try it free →" · "US, Canada & UK · No credit card · Start for free"

---

## 1. Pricing (live `/pricing`, currency shown as € on the live page)

Toggle: Monthly / Annual — "Save 17%".

| Plan | Price | Tagline | Bullets (verbatim, live order) |
|---|---|---|---|
| **Curious** | $0 / forever | Get started for free | Job search · Unlimited analyses · Skill names list · Market score overview · Basic salary range |
| **Explorer** (Most Popular) | €5 / mo | For serious job seekers | Recommended courses & certifications · Career growth recommendations · Country comparison · Gap analysis (resume vs job) · Strengths & improvements analysis · Skill assessment scores · Detailed salary breakdown · Everything in Curious |
| **Hunter** | €18 / mo | Full career toolkit | Priority support · Application Pack (tailored resume, cover letter, interview prep) · AI recommendations · AI resume improvement chat · Everything in Explorer |

Footer link: "Are you a recruiter? Learn how PayScope works for hiring teams →"

Extended gating (older pricing copy, kept as product rules in the app):
- Explorer: exact median + breakdown, strengths/improvements, gap analysis, Salary Brief (in-app), career path/courses/certs, Skill Roadmap (first 3 skills), job comp map + Check My Fit, Compare tab.
- Hunter: extended Skill Roadmap, Job Pipeline & Kanban, Negotiation Playbook & verdict-page tools, full Offer Analysis tabs & Decision Helper, level benchmarks & course picks on saved jobs, AI resume chat, Application Pack, Salary Brief PDF export.

---

## 2. Resume Analysis (`/features/resume-analysis`) → app `/analyze`, `/dashboard/market-value`

H1 "What Is Your Resume **Actually** Worth?" · "Upload once. Get your salary range, market percentile, and skills breakdown — based on real data for your role and location. No guessing. No generic ranges. Your number."

Example card: $147K · Top 25% · Senior Product Manager · London · Floor $118K · Ceiling $172K · skills Product Strategy 85%, Stakeholder Mgmt 72%, Data Analysis 61%, AI / ML Literacy 44%, Technical Writing 38%.

**Six concrete outputs**
1. Salary range — personal floor, median, ceiling for exact role, level, location.
2. Market percentile — bottom 25%, top 10%, etc.
3. Skills breakdown — every skill rated Expert / Advanced / General / Inferred with a confidence score and salary-driver strength.
4. Resume score — out of 100, gaps prioritized by market-value impact.
5. Strengths & gaps — what works vs what holds the number down, based on demand.
6. Salary brief — negotiation brief with AI arguments tied to skills and position.

**How it works**: Upload (PDF or paste, 30 s) → Analyze (extracts role, experience, skills, location; under 2 min) → Act (review, download brief; "Yours to keep").

**Why it's different**: skills-based not title-based · updated daily · US/CA/UK · identifies skills pushing number up/down · any role and level.
Negotiation brief example: floor $131,000 · target $147,000 · stretch $162,000 · script "Based on your 7 years of product experience and strong data skills, the market median for this role in London is £115K. I'd like to discuss a base of £120K..."

---

## 3. Job Offer Analysis (`/features/job-analysis`) → app `/offer`

H1 "Is Your **Job Offer** Actually Fair?" · inputs: job title, location, base salary, optional bonus, equity, signing bonus, optional job description.

Example: Verdict **Below market · 12% under median** · Your offer $105,000 · Market median $119,000 · Market ceiling $138,000 · Floor (don't go below) $112,000 · Target $122,000 · Stretch $130,000.

**Six outputs**: Fair market verdict (below/at/above) · Percentile ranking · Full salary range (floor/median/ceiling) · Negotiation script (opening lines, counters, talking points) · Total compensation view (base+bonus+equity+sign-on) · Salary brief (downloadable).

Script example: "Thank you for the offer. Based on my research, the market rate for this role in Austin is $119K–$138K for someone with my background. Given my 6 years in growth product and the ML experience you mentioned wanting — I'd like to discuss a base of $124,000."
Counter tactic: "If they say budget is fixed, ask about sign-on or equity instead." · Leverage: "You're in the top 30% of candidates for this stack — use it."

---

## 4. Resume Improvement (`/features/resume-improvement`) → app `/improve`

H1 "Close the Gap Between Your Resume and Your Worth." Example: **68/100 score · 4 improvements identified**

| Sev | Impact | Issue | Fix |
|---|---|---|---|
| HIGH | +8–12% salary signal | Missing quantified achievements | Add revenue, growth, or scope numbers to 3 experience bullets |
| HIGH | +6–9% in tech-adjacent roles | No mention of AI/ML tooling | Add specific tools used (even basic usage counts) |
| MED | +3–5% for entry-mid levels | Education section too sparse | Add relevant coursework or certifications |
| MED | +4–7% for senior roles | No leadership scope indicated | Specify team size managed or cross-functional coverage |

**Six outputs**: Priority improvement list · Skill gap analysis (vs target role) · Certifications that pay (ranked by ROI) · Learning roadmap (milestones + salary impact) · Resume score (updates as you change) · Section-by-section rewrites.

Certifications ranked for Senior PM · Los Angeles: AWS Solutions Architect 3–4 mo +18% · Google Professional Data Engineer 2–3 mo +14% · PMP 3–6 mo +11% · Certified Scrum Master 2–4 wk +7%.

Loop: Analyze (2 min) → Review gaps (5 min) → Track progress (re-upload, see score/value change).

---

## 5. Jobs Pipeline (`/features/jobs-pipeline`) → app `/jobs`, `/pipeline`

H1 "Your Job Search, Organised and Moving." Counts: **12 Saved · 7 Applied · 3 Interviewing · 1 Offered**.

Cards: Senior Product Manager · Stripe · San Francisco · $148K market median · 94% fit · Interviewing / Product Lead · Figma · Remote · $162K · 88% fit · Applied / Group Product Manager · Notion · New York · $155K · 82% fit · Saved.

**Six outputs**: Personalised job feed (fit score) · Salary context per role · Application materials (cover letter + tailored resume summary) · Kanban pipeline (Saved → Applied → Interviewing → Offered, drag-and-drop) · Fit score breakdown (matched / partial / gap) · Offer comparison (base, bonus, equity, total comp).

Application pack example (Stripe · Senior PM): fit 94% · "5+ years product management ✓ matched" · "Payments or fintech experience ~ partial" · "Cross-functional leadership ✓ matched" · "SQL or data analysis ✓ matched" · cover letter opener "I've spent 7 years building products at scale — and I'm specifically drawn to Stripe because the infrastructure-layer thinking required here matches exactly how I approach product strategy..."

---

## 6. Career Growth (homepage intent) → app `/growth`
Set target role + target salary → step-by-step plan: skills to build, certifications that pay, timeline. Career path by level (entry → mid → senior → lead). Courses recommended (Explorer+).

## 7. Market Insights → app `/insights`
Salary trends for role + region, demand shifts, emerging skills; supply-to-demand ratio with labels (Saturated / Competitive / Highly Competitive / Balanced / Critically Undersupplied); remote vs city premium.

## 8. Salary Guides (`/salaries`) → app `/salaries`, `/salaries/[slug]`
Guide index (18 titles): Operations Specialist · API Developer · Warehouse Operations Manager · UX Designer · Technical Support Specialist · Technical Sales · Integration Engineer · HR Manager · General Manager · Digital Marketing Specialist · DevOps Engineer · Design Architect · Customer Service Specialist · Customer Service Lead · Director of Administration · Technical Support Engineer · Software Engineer · Product Manager.

Guide layout (verified on SE + DevOps guides): National Median · Entry → Lead range · Roles count · S/D ratio + label · intro · data-source note · "In this guide" TOC · What they do · Salary by level table (Median/P25/P75) · Salary by city table (Entry/Mid/Senior/Lead) · Career path by level · Day-to-day by level · Types/specializations · Who's hiring table · FAQ · "Further reading".

Verified data points:
- Software Engineer: median $115,000 · $86K→$176K · 138K roles · 3.46:1 Competitive. Levels: Entry $86,000 (P25 $63,500 P75 $97,500) · Mid $115,000 ($97,500/$130,000) · Senior $145,000 ($120,000/$173,000) · Lead $176,000 ($149,000/$220,000). Cities (Entry/Mid/Senior/Lead): SF 155,762/173,595/177,712/168,413 · NY 120,750/149,500/178,311/213,623 · Seattle 100,600/132,000/165,487/187,955 · Boston 106,000/128,921/143,600/161,470 · LA 89,622/87,600/155,860/— · Chicago 86,000/119,361/156,066/155,938 · Austin 80,900/130,300/144,034/— · Remote 86,000/120,000/143,000/176,000. Top employers: Capital One 10,227 · NVIDIA 8,059 · Google 4,248 · Canonical 3,304 · Microsoft 1,828 · JPMorganChase 1,309 · Walmart 1,217.
- DevOps Engineer: median $113,967 · $83K→$176K · 11K roles · 1.9:1 Highly Competitive. Levels: Entry $83,473 (72,340/95,769) · Mid $113,967 (105,500/144,500) · Senior $135,746 (119,376/157,938) · Lead $176,000 (156,940/231,088). Cities: Remote 84,510/109,228/149,027/176,000 · Chicago 121,000/138,499/153,630/155,938 · Austin 83,296/127,461/150,479/165,000 · Seattle 87,583/127,000/147,902/194,000 · Boston 112,100/149,476/167,190/177,000 · SF 164,429/167,381/174,325/228,000 · NY 88,267/133,800/143,473/172,000 · LA 126,737/148,457/171,388/175,800. Employers: Accenture 312 · Amazon 185 · IBM 134 · Deloitte 128 · Microsoft 115 · Leidos 89 · Booz Allen 76 · SAIC 65 · TEKsystems 58 · Infosys 44.
- API Developer: 645 active roles, S/D 0.32 (critically undersupplied). UX Designer: entry $67,500 → lead $166,250; Chicago entry $97,000. Warehouse Ops Mgr: $68,700 → $123,928; Boston $132,693; 433 roles; 4.1:1. Operations Specialist: $57,100 entry, $65,530 specialist. Technical Support Specialist: $55,275 entry → $155,000 leader (Austin). Technical Sales: $62,168 → $158,301. Integration Engineer: $79,641 → $154,000; LA lead $197,000. HR Manager: $55,000 → $150,755; Chicago entry $87,600. General Manager: $65,320 → $163,956. Digital Marketing Specialist: $65,418 → $117,750. Design Architect: $72,278/$97,000/$125,000/$155,000. Customer Service Specialist: $42,772 → $64,957. Customer Service Lead: $55,000 → $136,000. Director of Administration: $82,500 → $161,000 ($185,264 SF); 177 roles. Technical Support Engineer: median $73,500; NY specialist $120,324; Boston leader $156,931; 2,688 roles. Product Manager: Austin entry $56,443; Boston entry $135,400.

## 9. Recruiters (`/for-recruiters`) → app `/recruiters`
H1 "Set Competitive Salaries with Confidence" · "Analyze any job description and get instant market data." · CTA "Analyze Job Description" / "View Pricing" · "14-day free trial • No credit card required".
Features: Job Description Analysis · City-Level Data (SF, NYC, Austin, Seattle…) · Industry Benchmarks (Tech, Healthcare, Finance…) · Experience Levels (Junior/Mid/Senior in one report).
Sample bands — By City: San Francisco $120-150K · New York $110-140K · Austin $95-125K · Remote $100-130K. By Level: Junior $60-80K · Mid-Level $85-110K · Senior $120-150K · Lead $140-180K. By Industry: Technology $110-145K · Finance $105-140K · Healthcare $95-125K · E-commerce $100-130K.
Coming soon (homepage): Recruiter Mode — role benchmarking, competitive comp packages, candidate scoring at scale.

## 10. About (`/about`)
Mission: "to bring transparency to salary negotiations". Technology: ML extracts key info from documents and matches against salary database covering USA, UK, Canada. Privacy First: encrypted, never shared.

## 11. Privacy / Terms / Contact
Operator GLOZO GLOBAL Inc. · hello@payscope.ai · Delaware law. Terms describe employer features: vacancy visualization diagrams, job-requirement diagrams, candidate-match diagrams, occupational analytics, candidate search.

## 12. Blog (`/blog`) — 50+ posts; categories Guide / Analytics / Report / News. Notable: resume salary estimator · Glassdoor alternative · raise vs bonus calculator · job offer comparison calculator · levels.fyi alternatives · AI job exposure 2026 · market adjustment raise · equity compensation guide · "We've leveled up" (redesign: Help Center, reviews, country comparison coming).

## 13. Platform / UX
Web app, mobile-responsive, Help Center, FAQ, salary guides, auth with callback into modules (market-value, offer-evaluator, job-search, career-growth), Product Hunt embeds. Nav: Individuals · Recruiters · Resources · Pricing · About · Sign In · Get Started.

## 14. Model (published)
Separate parsing model and pricing model; resume/JD attributes → vectors in same space; training target = known vacancy salary; attributes: skills, employment type, employer type, industry, education, location, certifications. Estimate = alignment of profile with current openings that pay a known amount.

## 15. Not in scope (explicitly)
No India/APAC coverage · not Levels.fyi verified per-company levels · not an auto-apply bot · ~8 modules, not "500 features".
