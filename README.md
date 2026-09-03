# PayLens — AI employer salary prediction & career intelligence

PayLens is a full-featured re-implementation of the PayScope.ai product surface (resume analysis, market value, offer evaluation, job search & pipeline, application packs, career growth, market insights, salary guides, recruiter benchmarking, plan gating) wrapped in a cinematic 3D landing page inspired by modern scroll-driven product sites: a chrome android face hero, a scroll-scrubbed luxury-watch "market engine" chapter, an animated employee-at-work scene, and a dark "proof of work" portfolio section.

Everything works out of the box with a deterministic, data-driven prediction engine — no API keys, no database. Optional live-AI upgrades switch on when `ANTHROPIC_API_KEY` is present.

## Stack

- Next.js 16 (App Router, TypeScript strict), React 19, Tailwind v4
- three.js + React Three Fiber + drei (GLB models, procedural fallbacks, scroll-driven cameras)
- framer-motion, Lenis smooth scroll, recharts, @dnd-kit (Kanban), jspdf (Salary Brief PDF), pdfjs-dist (PDF resume parsing)
- zustand (persisted to localStorage) — accounts, resumes, analyses, pipeline, offers, plan

## Scripts

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # prebuild fetches any missing generated assets
npm run typecheck  # tsc --noEmit
npm run lint
npx tsx src/lib/engine/__tests__/smoke.ts   # engine smoke test
```

## Repository map

| Path | What it is |
|---|---|
| `docs/payscope-feature-catalog.md` | Verified feature catalog scraped from payscope.ai (homepage, pricing, feature pages, recruiter page, salary guides, blog, legal) |
| `docs/ARCHITECTURE.md` | Routes, plan gating, data model, engine modules, 3D conventions |
| `docs/design-brief.md` | How each reference design in the recording maps onto the landing page |
| `src/lib/engine/` | Pure-TS engine: resume parser, pricing, scoring, negotiation, offers, job fit, application pack, roadmap, insights, recruiter benchmark, rewrite, coach |
| `src/data/` | Seed data: 50 roles, cities (US/CA/UK), 200+ skills, certifications, courses, 60+ jobs, 18 salary guides, blog, FAQ |
| `src/components/three/` | RobotHead, WatchModel, ProceduralEmployee scenes + fallbacks |
| `src/app/dashboard/*` | Product modules (market value, improve, offers, compare, jobs, pipeline, growth, insights, resumes, chat, settings) |
| `scripts/assets.json` + `scripts/fetch-assets.mjs` | Manifest of generated assets and the downloader used by CI and `prebuild` |
| `.github/workflows/fetch-assets.yml` | Downloads the generated sources, optimizes (JPEG resize, glTF meshopt + WebP textures) and commits them to `public/` |

## Generated visuals

- Source stills (android head, luxury watch, cinematic studio) were generated with Higgsfield AI (`nano_banana_pro`) and lifted to 3D with Tripo H3.1 image-to-3D; the employee-at-desk backdrop was generated with Runway (`nano-banana-pro`).
- `src/data/films.json` can point the hero, watch and employee chapters at scroll-scrubbed MP4 films (for example Runway Gen-4 / Seedance image-to-video). When a film URL is `null` the section renders its real-time 3D scene instead.

## Plans

Curious (free) · Explorer ($5/mo) · Hunter ($18/mo) — gating rules live in `src/lib/plans.ts`; the checkout is simulated (no payment provider).

## Deploy

Push to GitHub and import the repo in Vercel (framework auto-detected). No environment variables are required. Set `ANTHROPIC_API_KEY` to enable live AI for `/api/chat` and `/api/rewrite`.
