# PayLens — Design Brief (3D animated landing + product UI)

Derived from the reference recording (62 s screen capture of six 3D sites) and the Higgsfield scene analysis.
The recording's design language, and how each reference maps onto PayLens:

| Reference in video | What it does | PayLens section |
|---|---|---|
| "Your Robots" (0:00–0:04) — white armoured robot, game HUD: class list left, LEVEL 51 + ATTACK/DEFENCE stat bars right, ADD ROBOTS + / START | 3D character centered, HUD panels either side, mono-caps labels, stat bars | **Hero**: robotic face GLB centered; left HUD = modules list; right HUD = $147K "MARKET VALUE" + stat bars (Market position / Skill-up / Resume score / Data points) |
| "Revolutionizing Cardiac Care" (0:04–0:10) — huge white sans headline behind a glowing 3D heart | Text-behind-object layering, single glowing object on dark navy | Hero headline "KNOW YOUR TRUE WORTH." layered behind the head |
| Halo S1 headphone (0:10–0:14) — full-bleed film, mint mono type at corners | Corner meta text ("Chrome & Onyx · $600"), giant serif display name | Corner meta on hero ("US · CA · UK", "10M data points / month") |
| REVERIE portal (0:14–0:20) — floating tilted cards over clouds | Tilted glass cards, hover lift | "Where are you right now?" four intent cards with 3D tilt on hover |
| Tesla "MODEL THREE" (0:20–0:29) — car rotates front→side as you scroll, giant condensed text behind | Scroll-driven 3D rotation, text behind object | Hero scroll: head yaws 0→35° and camera pushes in; "MEASURED"-style headline |
| MEASURED (0:29–0:34) — giant serif word, 3D rocks in front, nav Device/Real Stories/Science/Plans | Object in front of huge type | Final CTA "STOP GUESSING. START KNOWING." |
| AURUM & NOIR watch (0:41–0:48) — macro push into tourbillon, chapters "01 — ENGINEERING", "02 — THE DIAL", "42 mm", gold on black | Scroll-scrubbed film, small tracked eyebrows, chapter numbers | **Watch chapter**: sticky 300vh section; watch GLB camera scrubs wide → macro; chapters 01 PARSING MODEL / 02 PRICING MODEL / 03 UPDATED DAILY |
| ZUBAIR TRABZADA portfolio (0:48–1:02) — "PROOF OF WORK." condensed caps, ember-red period, serif italic accents ("for *your* business?"), warm tungsten bulbs, cinema camera, three cards CITEVUE / SCROLL-CINEMATIC / 199 SKILLS | Dark cinematic backdrop, condensed display type, italic serif, three work cards | **Proof of work**: studio backdrop image, six module cards, CTA row "WANT TOOLS LIKE THESE FOR *your* CAREER?" |

## Brand tokens
- Background `#060708`, panels `#10131a`, lines `#1f2430`, text `#ecebe6`, muted `#9a9ca3`.
- Accents: cyan `#4ad9ff` (data, eyes, stat bars), gold `#d9b45a` (watch chapter, premium), ember `#ff5a2e` (CTA, proof-of-work period).
- Type: **Bebas Neue** (display, uppercase, tight leading 0.9), **Instrument Serif italic** (accents inside headlines), **Inter** (UI/body). Eyebrows: 0.68rem, 0.28em tracking, uppercase.
- Motion: Lenis smooth scroll; framer-motion reveals (y 24 → 0, 0.7 s, ease [0.22,1,0.36,1]); 3D driven by a scroll-progress hook (0–1 per section) and pointer parallax. Respect `prefers-reduced-motion` (posters instead of canvases).

## Landing page — section order
1. **Hero (100vh, sticky over 220vh)** — RobotHead GLB (`/models/robot-head.glb`) centered, pointer-look, idle float, cyan emissive eyes, studio env, key + rim lights, floor reflection shadow. Behind it the display headline `KNOW YOUR / TRUE WORTH.` (serif-italic "True"). Left HUD: eyebrow "MODULES S — A", list: ANALYZE · IMPROVE · OFFER · JOBS · GROWTH (icon tiles, selected state). Right HUD: "$147K" + "MARKET VALUE" label (LEVEL-style), rows MARKET POSITION 75 / SKILL-UP +12% / RESUME SCORE 68 / DATA POINTS 10M with stat bars. Bottom-left button "ANALYZE MY RESUME +", bottom-right "START →" (ghost). Corner meta: "US · CA · UK" / "UPDATED DAILY". Scroll 0→1: head yaw 0→0.6 rad, camera z 4.2→3.2, HUD panels slide out, headline scales 1→1.15 and fades.
2. **Stats strip** — 5.0★ · 3 countries · 12K+ analyses · 93% recommend · 100% private (count-up on view).
3. **Intent grid** — "Where are you right now?" four tilt cards: JUST GOT AN OFFER / AM I UNDERPAID? / LOOKING FOR A NEW ROLE / WANT TO EARN MORE (copy verbatim from catalog), each with CTA to module.
4. **Watch chapter (sticky, 300vh)** — eyebrow "PAYLENS · EDITION I — MARKET ENGINE". Watch GLB (`/models/watch.glb`) gold-lit on black with drifting dust particles. Scroll scrubs camera: wide 3/4 (0–0.33) → top-down dial (0.33–0.66) → macro into movement (0.66–1). Chapters fade in/out on the left: 01 — PARSING MODEL ("Resume and job description become the same vectors."), 02 — PRICING MODEL ("Trained on vacancies with known pay."), 03 — UPDATED DAILY ("10 million data points a month."). Right corner meta "42 attributes" style: "US · CA · UK", "3 markets".
5. **Employee at work (animated)** — "Your profile, at work." Procedural low-poly 3D employee (`ProceduralEmployee`): seated figure at a desk, typing arm loop, breathing, occasional head turn toward the cursor; floating glass data cards orbit slowly (Product Strategy 85% · $89K median · Top 25% · +12% skill-up) and react to pointer parallax. Backdrop `/images/employee-backdrop.jpg` (if present) with vignette. Copy: "Upload once – the entire platform organizes around your profile." + five bullets from the catalog.
6. **How it works** — 3 steps with timings (30 seconds / 2 minutes / Ongoing) on a horizontal line that draws on scroll.
7. **Resume as center** — split: left copy + bullets; right two live mock panels: Market salary range (Floor $81K / Median $89K / Ceiling $98K bars animate) and Negotiation targets ($89,000 / $94,500 / $98,000).
8. **Fixes it with you** — three lines + "Advice → Act".
9. **Proof of work** — full-bleed `/images/studio-backdrop.jpg`, headline "PROOF / OF WORK<span ember>.</span>", six module cards (01 JOBS PIPELINE … 06 RECRUITER MODE — coming soon) in condensed caps with serif-italic descriptions; CTA row "WANT TOOLS LIKE THESE FOR *your* CAREER?" with ember "ANALYZE MY RESUME" + outline "SEE PRICING".
10. **Pricing teaser** — three plan cards (Curious $0 / Explorer $5 / Hunter $18, annual saves 17%).
11. **Testimonials** — two quotes (Product Hunt).
12. **FAQ** — six accordion items (verbatim questions + answers).
13. **Final CTA** — "STOP GUESSING. / START KNOWING." giant display type with the robot head faded behind; "Try it free →"; "US, Canada & UK · No credit card · Start for free".

## Product UI (dashboard)
Dark glass panels on `#0b0d11`, left rail (Market value · Improve · Offers · Compare · Jobs · Pipeline · Growth · Insights · Resumes · Chat · Settings), top bar with active resume switcher and plan badge. Numbers use tabular figures; stat bars reuse the hero HUD style. Every gated block uses `<Gate>` (blur + upgrade card).

## Assets
`public/models/robot-head.glb`, `public/models/watch.glb`, `public/images/robot-face.jpg`, `public/images/watch.jpg`, `public/images/studio-backdrop.jpg`, `public/images/employee-backdrop.jpg` (optional). All 3D components fall back to procedural geometry if a GLB fails to load, so the site always renders.
