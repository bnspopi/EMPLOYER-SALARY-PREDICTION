# PayLens — Architecture & Build Spec

PayLens is an employer-salary-prediction and career-intelligence web app that re-implements every shipped
PayScope.ai capability (see `docs/payscope-feature-catalog.md`) behind a cinematic 3D landing page inspired by
the reference recording (`docs/design-brief.md`). Brand name lives in one place: `src/lib/brand.ts`.

## Stack
- Next.js 16 (App Router, `src/` dir, TypeScript strict), React 19, Tailwind v4 (`@import "tailwindcss"` + `@theme` tokens in `src/app/globals.css`).
- 3D: `three` + `@react-three/fiber` + `@react-three/drei`. All R3F components are client components loaded with `next/dynamic({ ssr:false })`.
- Motion: `framer-motion` (reveals, layout), `lenis` (smooth scroll, single instance in `src/components/providers/SmoothScroll.tsx`).
- State: `zustand` with `persist` (localStorage) — `src/lib/store.ts`. No backend database; every module works fully client-side and stays deterministic.
- Engine: pure TypeScript in `src/lib/engine/*` (no React imports) so it runs in the browser, in route handlers, and in unit tests.
- Charts: `recharts`. Kanban DnD: `@dnd-kit/core` + `@dnd-kit/sortable`. PDF export: `jspdf`. PDF resume parsing: `pdfjs-dist` (client, worker from `/pdf.worker.min.mjs` copied into `public/`).
- Optional live AI: `/api/chat` and `/api/rewrite` call the Anthropic Messages API **only if** `ANTHROPIC_API_KEY` is set (model `claude-sonnet-5`); otherwise they fall back to the deterministic engine so the app is fully functional with zero secrets.

## Routes (App Router)
| Route | Purpose | Plan gate |
|---|---|---|
| `/` | 3D landing: robot-face hero, watch "engineering" chapter, proof-of-work modules, how it works, pricing teaser, testimonials, FAQ, CTA | — |
| `/analyze` | Upload PDF / paste resume / paste JD → runs engine → redirects to `/dashboard/market-value` | — (Curious sees basic range + skill names; Explorer+ sees exact median & breakdown) |
| `/dashboard` | Hub around the **active resume**: market value card, score, quick actions, pipeline counts | — |
| `/dashboard/market-value` | Floor/median/ceiling, percentile gauge, skills breakdown (Expert/Advanced/General/Inferred + confidence + salary-driver), strengths & gaps (HIGH/MED/LOW), skill-up potential, Salary Brief | Curious basic · Explorer full |
| `/dashboard/improve` | Resume score /100, prioritized improvements w/ salary impact, target-role skill gap, certifications ranked by ROI, learning roadmap (Explorer: first 3 skills, Hunter: extended), section rewrites, re-score after edit | Explorer · Hunter |
| `/dashboard/offer-evaluator` | Offer form (title, location, base, bonus, equity, sign-on, JD) → verdict, % vs median, percentile, floor/median/ceiling, total comp, negotiation targets + script, Salary Brief; Hunter: full tabs + Decision Helper | Curious verdict · Hunter tabs |
| `/dashboard/compare` | Side-by-side offers (base, bonus, equity, total comp + market context) | Explorer |
| `/dashboard/job-search` | Target role/location/salary → personalised feed with fit score + breakdown + salary context; save to pipeline; Check My Fit (paste JD); job compensation map | — (Curious can search; Explorer+ fit breakdown) |
| `/dashboard/pipeline` | Kanban Saved → Applied → Interviewing → Offered, drag-and-drop, count badges, card = company · city · market median · fit; level benchmarks & course picks per saved job (Hunter) | Hunter |
| `/dashboard/application-pack/[jobId]` | Tailored resume summary, tailored bullets, cover letter, interview prep — editable textareas, copy/download | Hunter |
| `/dashboard/career-growth` | Target role + salary → step plan (skills, certs, timeline), level ladder entry→mid→senior→lead, courses | Explorer |
| `/dashboard/insights` | Trends by role+region, demand shifts, emerging skills, supply/demand ratio + label, remote vs city premium, country comparison (US/CA/UK) | Explorer (country comparison) |
| `/dashboard/resumes` | Multiple resume versions, set active, analyze someone else's resume, delete | — |
| `/dashboard/chat` | AI resume-improvement chat (deterministic coach; live model if key set) | Hunter |
| `/dashboard/settings` | Display name replacement, plan switch (simulated checkout), delete account & data | — |
| `/pricing` | Curious / Explorer / Hunter, monthly-annual toggle (save 17%), feature table, recruiter link | — |
| `/for-recruiters` | JD analysis → salary benchmark: city bands, industry bands, level bands (Junior/Mid/Senior/Lead) in one report | — |
| `/salaries`, `/salaries/[slug]` | 18 salary guides with PayScope-style layout (median, range, roles, S/D ratio, level table, city table, career path, day-to-day, types, who's hiring, FAQ) | — |
| `/about`, `/blog`, `/blog/[slug]`, `/help`, `/contact`, `/privacy`, `/terms` | Marketing / legal | — |
| `/auth/signin`, `/auth/signup` | Local account (name + email persisted), `?callbackUrl=` honoured | — |
| API: `/api/analyze`, `/api/offer`, `/api/recruiter`, `/api/jobs`, `/api/chat`, `/api/rewrite` | Thin wrappers around the engine (so the UI can be swapped to a real backend later) | — |

## Plan gating
`Plan = "curious" | "explorer" | "hunter"`. `src/lib/plans.ts` exports `PLAN_RANK`, `FEATURES` (feature → minimum plan) and `can(plan, feature)`.
`<Gate feature="salaryBrief">` renders children when allowed, otherwise a blurred preview + "Upgrade to Explorer/Hunter" card linking to `/pricing`. Recruiter track is separate (`/for-recruiters`, no gate, "14-day free trial").

## Data model (`src/lib/types.ts`)
Profile (parsed resume), SkillRating, MarketEstimate, ResumeScore, Improvement, Certification, RoadmapStep, NegotiationBrief, OfferInput/OfferVerdict, Job/JobFit, PipelineCard/Stage, ApplicationPack, GrowthPlan, Insight, SalaryGuide, RecruiterReport, ResumeVersion, User, Plan. All defined once and imported everywhere.

## Engine (`src/lib/engine/`)
- `parser.ts` — text → `Profile`: titles, seniority (entry/mid/senior/lead), years, skills w/ level+confidence, education, certifications, employment type, employer type, industry, location (city+country), remote preference. Contact details are stripped and ignored.
- `pricing.ts` — `estimate(profile)`: role base by level × city multiplier × skill premium (Σ salary-driver weights, capped) → floor(P25)/median/ceiling(P75), percentile, per-skill contribution (lift vs drag), skill-up potential (+% if top 3 gaps closed), currency (USD/CAD/GBP).
- `scoring.ts` — resume score /100 and ranked `Improvement[]` (HIGH/MED/LOW, impact ranges from the catalog).
- `negotiation.ts` — floor / target ask / stretch, opening script, counter-tactics, leverage notes, total potential gain.
- `offer.ts` — verdict (below/at/above), % vs median, percentile, total comp, negotiation targets, offer script, decision helper ranking.
- `fit.ts` — job fit % with requirement matrix (matched / partial / gap).
- `roadmap.ts` — certifications ranked by ROI for role+city, learning roadmap milestones, career growth plan with timeline.
- `insights.ts` — trends, demand shifts, emerging skills, S/D ratio labels (Critically Undersupplied <0.5, Highly Competitive <2.5, Competitive <4, Balanced <6, Saturated ≥6), remote premium, country comparison.
- `pack.ts` — tailored summary, bullets, cover letter, interview prep.
- `rewrite.ts` — bullet rewrites (quantify, action verb, scope).
- `recruiter.ts` — JD → benchmark by city / industry / level.
- `coach.ts` — deterministic chat responder over profile + gaps.
Seed data in `src/data/`: `roles.ts` (≥40 roles, medians by level), `cities.ts` (US/CA/UK + remote multipliers), `skills.ts` (taxonomy, aliases, driver weights, category), `certs.ts`, `courses.ts`, `jobs.ts` (≥40 listings), `guides.ts` (18 guides; SE + DevOps use the verified numbers), `industries.ts`, `blog.ts`, `faq.ts`, `testimonials.ts`.

## 3D & motion (`src/components/three/`)
- `HeroScene.tsx` — canvas with `RobotHead` (GLB `/models/robot-head.glb`, mouse-look, idle float, cyan eye emissive) inside `Suspense`; on load error falls back to `ProceduralHead` (built from primitives) so the page never breaks. Scroll progress (0→1 across the hero) drives camera orbit + head yaw, Tesla-style.
- `WatchScene.tsx` — `WatchModel` (GLB `/models/watch.glb`, fallback `ProceduralWatch`) with a scroll-scrubbed macro push-in through three chapters.
- `useScrollProgress(ref)` hook, `Lights.tsx`, `Env.tsx` (drei `Environment` preset "studio"/"night", no external HDR fetch).
- Reduced motion: if `prefers-reduced-motion`, render poster images instead of canvases.

## Conventions
- Server components by default; add `"use client"` only where hooks/state are used.
- Every page exports `metadata`. Root layout: fonts via `next/font/google` (Bebas Neue, Instrument Serif, Inter), Nav, Footer, SmoothScroll provider, theme = dark only.
- Money formatting via `formatMoney(amount, currency)` in `src/lib/format.ts`.
- No `any`. `npx tsc --noEmit` and `npm run lint` must pass; `npm run build` must pass.
- Do not run `next build` from parallel agents (shared `.next`); type-check with `tsc --noEmit` instead. Only the integration step runs the full build.
