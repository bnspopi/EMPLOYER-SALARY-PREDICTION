"use client";
import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  Check,
  Clock,
  GraduationCap,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  Wand2,
} from "lucide-react";
import { useApp, useActiveAnalysis } from "@/lib/store";
import { can } from "@/lib/plans";
import { analyzeResume, listRoles, rewriteBullet } from "@/lib/engine";
import { formatMoney } from "@/lib/format";
import type { Analysis, RewriteSuggestion } from "@/lib/types";
import { Topbar } from "@/components/dashboard/Topbar";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Badge, SeverityBadge } from "@/components/ui/Badge";
import { Gate } from "@/components/ui/Gate";
import {
  DashSkeleton,
  EmptyState,
  ScoreRing,
  SectionHeader,
  StatTile,
  Reveal,
  LEVEL_LABEL,
  formatDate,
} from "@/components/dashboard/widgets";
import { cn } from "@/lib/utils";

interface Toast {
  id: number;
  text: string;
  tone: "green" | "cyan" | "red";
}

export function ImproveClient() {
  const hydrated = useApp((s) => s.hydrated);
  const plan = useApp((s) => s.plan);
  const setAnalysis = useApp((s) => s.setAnalysis);
  const setTargets = useApp((s) => s.setTargets);
  const displayNameOverride = useApp((s) => s.displayNameOverride);
  const resumes = useApp((s) => s.resumes);
  const analyses = useApp((s) => s.analyses);
  const { resume, analysis } = useActiveAnalysis();

  const roles = useMemo(() => listRoles(), []);
  const [targetRole, setTargetRole] = useState("");
  const [busy, setBusy] = useState(false);
  const [rewrites, setRewrites] = useState<Record<number, RewriteSuggestion>>({});
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  function pushToast(text: string, tone: Toast["tone"] = "green") {
    const id = (toastId.current += 1);
    setToasts((t) => [...t, { id, text, tone }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }

  if (!hydrated) {
    return (
      <>
        <Topbar title="Improve" eyebrow="Resume score" />
        <DashSkeleton />
      </>
    );
  }

  if (!analysis || !resume) {
    return (
      <>
        <Topbar title="Improve" eyebrow="Resume score" />
        <EmptyState
          icon={Sparkles}
          eyebrow="Close the gap"
          title="Analyze a resume to improve it"
          body="Upload a PDF or paste your résumé and PayLens scores it out of 100, ranks the fixes by salary impact, maps your target-role skill gaps and rewrites your bullets — re-scoring as you edit."
          cta={{ href: "/analyze", label: "Analyze my resume" }}
        />
      </>
    );
  }

  const { score, estimate: e } = analysis;
  const showRest = can(plan, "strengthsGaps");

  function reanalyze(nextText: string, withTarget?: string): Analysis | null {
    if (!resume) return null;
    const prevScore = analysis?.score.score ?? 0;
    const next = analyzeResume({
      text: nextText,
      resumeId: resume.id,
      displayName: displayNameOverride.trim() || analysis?.profile.displayName,
      targetRole: withTarget?.trim() || analysis?.targetRole,
      targetLocation: analysis?.estimate.location.label,
    });
    setAnalysis(resume.id, next);
    if (withTarget?.trim()) setTargets({ role: withTarget.trim() });
    const delta = next.score.score - prevScore;
    if (delta !== 0) {
      pushToast(
        `Score ${delta > 0 ? "+" : ""}${delta} (${prevScore} → ${next.score.score})`,
        delta > 0 ? "green" : "red",
      );
    } else {
      pushToast(`Re-scored — ${next.score.score}/100`, "cyan");
    }
    return next;
  }

  function runReanalyze(withTarget?: string) {
    if (!resume) return;
    setBusy(true);
    try {
      reanalyze(resume.text, withTarget);
    } finally {
      setBusy(false);
    }
  }

  function requestRewrite(index: number, bullet: string) {
    setRewrites((r) => ({ ...r, [index]: rewriteBullet(bullet, analysis?.profile) }));
  }

  function adoptRewrite(index: number, original: string, rewritten: string) {
    if (!resume) return;
    const text = resume.text;
    const nextText = text.includes(original) ? text.split(original).join(rewritten) : `${text}\n${rewritten}`;
    // Persist the edited résumé text (public zustand API — store definition untouched).
    useApp.setState((s) => ({
      resumes: s.resumes.map((rv) => (rv.id === resume.id ? { ...rv, text: nextText } : rv)),
    }));
    setRewrites((r) => {
      const clone = { ...r };
      delete clone[index];
      return clone;
    });
    reanalyze(nextText);
  }

  const bullets = analysis.profile.bullets;
  const roadmap = analysis.roadmap;

  // Versions with analyses, for the Track-progress card.
  const tracked = resumes
    .map((rv) => ({ rv, a: analyses[rv.id] }))
    .filter((x): x is { rv: (typeof resumes)[number]; a: Analysis } => Boolean(x.a));

  return (
    <>
      <Topbar title="Improve" eyebrow="Resume score" />

      {/* Score hero */}
      <Reveal>
        <div className="panel grid-bg relative overflow-hidden rounded-xl2 p-6 md:p-8">
          <div className="vignette pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative grid gap-8 md:grid-cols-[auto_1fr] md:items-center">
            <div className="flex flex-col items-center gap-2 justify-self-center">
              <ScoreRing score={score.score} />
              <div className="mono-caps text-center text-cyan">{score.improvements.length} improvements identified</div>
            </div>
            <div className="min-w-0">
              <div className="eyebrow text-cyan">
                {e.role} · {e.location.label}
              </div>
              <h2 className="display mt-2 text-4xl md:text-5xl">Close the gap to your worth</h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
                Your résumé scores <span className="font-semibold text-fg">{score.score}/100</span>. Work the priority
                list below — each fix is ranked by how much it moves your market value. Adopt a rewrite and your score
                updates instantly.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button size="sm" onClick={() => runReanalyze()} disabled={busy}>
                  <RefreshCw className={cn("h-4 w-4", busy && "animate-spin")} aria-hidden /> Re-analyze updated resume
                </Button>
                <Button href="/dashboard/market-value" variant="secondary" size="sm">
                  See market value <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              </div>
              <div className="mt-6 text-xs text-dim">Updated {formatDate(analysis.createdAt)}</div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Priority improvements */}
      <section className="mt-12">
        <SectionHeader
          eyebrow="Ranked by market-value impact"
          title="Priority improvements"
          description="The fixes that move your number most, most-severe first. Each shows the estimated salary-signal lift."
        />
        <div className="space-y-3">
          {score.improvements.map((imp, idx) => {
            const card = (
              <div className="panel rounded-xl2 p-5 md:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="display text-2xl tabular-nums text-dim">{String(idx + 1).padStart(2, "0")}</span>
                  <SeverityBadge severity={imp.severity} />
                  <Badge tone="gold">{imp.impactLabel}</Badge>
                  <Badge tone="neutral">{imp.section}</Badge>
                </div>
                <h3 className="mt-3 text-base font-semibold text-fg">{imp.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  <span className="text-cyan">Fix:</span> {imp.fix}
                </p>
              </div>
            );
            if (idx === 0) return <Reveal key={imp.id}>{card}</Reveal>;
            if (showRest) return <Reveal key={imp.id}>{card}</Reveal>;
            // Curious: first item only, rest gated.
            if (idx === 1) {
              return (
                <Gate key="gate-rest" feature="strengthsGaps">
                  <div className="space-y-3">
                    {score.improvements.slice(1).map((g, i) => (
                      <div key={g.id} className="panel rounded-xl2 p-5 md:p-6">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="display text-2xl tabular-nums text-dim">{String(i + 2).padStart(2, "0")}</span>
                          <SeverityBadge severity={g.severity} />
                          <Badge tone="gold">{g.impactLabel}</Badge>
                          <Badge tone="neutral">{g.section}</Badge>
                        </div>
                        <h3 className="mt-3 text-base font-semibold text-fg">{g.title}</h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted">
                          <span className="text-cyan">Fix:</span> {g.fix}
                        </p>
                      </div>
                    ))}
                  </div>
                </Gate>
              );
            }
            return null;
          })}
        </div>
      </section>

      {/* Target-role skill gap */}
      <section className="mt-12">
        <SectionHeader
          eyebrow="Skill gap"
          title="Analyze against a target role"
          description="Pick the role you're aiming for. We re-price your profile and rank the core skills you're missing by impact."
          action={
            <div className="flex items-end gap-2">
              <div>
                <Label>Target role</Label>
                <Input
                  list="improve-roles"
                  value={targetRole}
                  onChange={(ev) => setTargetRole(ev.target.value)}
                  placeholder={analysis.targetRole ?? "e.g. Group Product Manager"}
                  className="h-9 w-56"
                  aria-label="Target role"
                />
                <datalist id="improve-roles">
                  {roles.map((r) => (
                    <option key={r} value={r} />
                  ))}
                </datalist>
              </div>
              <Button size="sm" onClick={() => runReanalyze(targetRole)} disabled={busy || !targetRole.trim()}>
                <Target className="h-4 w-4" aria-hidden /> Analyze
              </Button>
            </div>
          }
        />
        <Gate feature="gapAnalysis">
          <div className="panel rounded-xl2 p-6">
            {analysis.targetRole ? (
              <p className="mb-4 text-sm text-muted">
                Missing core skills for <span className="font-semibold text-fg">{analysis.targetRole}</span>, ranked by
                impact:
              </p>
            ) : (
              <p className="mb-4 text-sm text-muted">
                Core skills you could add to lift your number in <span className="font-semibold text-fg">{e.role}</span>,
                ranked by impact:
              </p>
            )}
            {roadmap.length ? (
              <ul className="grid gap-3 sm:grid-cols-2">
                {roadmap.map((r) => (
                  <li key={r.skill} className="flex items-center justify-between gap-3 rounded-xl2 border border-line bg-bg-2 px-4 py-3">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-fg">{r.skill}</span>
                      <span className="mono-caps text-dim">~{r.weeks} wks to build</span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold tabular-nums text-green">+{r.upliftPct}%</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-dim">You already cover the core skills for this role. Focus on evidence and quantification.</p>
            )}
          </div>
        </Gate>
      </section>

      {/* Certifications that pay */}
      <section className="mt-12">
        <SectionHeader
          eyebrow="ROI-ranked"
          title="Certifications that pay"
          description={`Ranked for ${e.role} · ${e.location.city} by salary uplift and relevance.`}
        />
        <Gate feature="courses">
          <div className="panel overflow-hidden rounded-xl2">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-line text-left">
                    <th className="px-4 py-3 font-medium text-muted">Rank</th>
                    <th className="px-4 py-3 font-medium text-muted">Certification</th>
                    <th className="px-4 py-3 font-medium text-muted">Duration</th>
                    <th className="px-4 py-3 text-right font-medium text-muted">Uplift</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.certifications.map((c, i) => (
                    <tr key={c.name} className="border-b border-line/60 last:border-0">
                      <td className="px-4 py-3">
                        <span className="grid h-7 w-7 place-items-center rounded-full border border-gold/30 bg-gold/10 text-xs font-semibold tabular-nums text-gold">
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-gold" aria-hidden />
                          <span className="font-medium text-fg">{c.name}</span>
                          <span className="text-xs text-dim">{c.provider}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-muted">
                          <Clock className="h-3.5 w-3.5 text-dim" aria-hidden /> {c.duration}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums text-green">+{c.upliftPct}%</td>
                    </tr>
                  ))}
                  {analysis.certifications.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-sm text-dim">
                        No high-ROI certifications outstanding for this role.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </Gate>
      </section>

      {/* Learning roadmap */}
      <section className="mt-12">
        <SectionHeader
          eyebrow="Sequenced"
          title="Learning roadmap"
          description="Build these in order. Each step shows the time, the salary lift and your cumulative median as gaps close."
        />
        <Gate feature="roadmapBasic">
          <ol className="relative space-y-4 border-l border-line-2 pl-6">
            {roadmap.map((step, idx) => {
              const node = (
                <div className="panel rounded-xl2 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge tone="cyan">Step {step.order}</Badge>
                      <span className="text-sm font-semibold text-fg">{step.skill}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="inline-flex items-center gap-1 text-muted">
                        <Clock className="h-3.5 w-3.5" aria-hidden /> {step.weeks} wks
                      </span>
                      <span className="font-semibold tabular-nums text-green">+{step.upliftPct}%</span>
                      <span className="font-semibold tabular-nums text-gold">
                        {formatMoney(step.cumulativeSalary, e.currency, { compact: true })}
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{step.milestone}</p>
                  {step.courses.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {step.courses.map((co) => (
                        <span key={co.name} className="inline-flex items-center gap-1.5 rounded-md border border-line bg-bg-2 px-2.5 py-1 text-xs text-muted">
                          <GraduationCap className="h-3.5 w-3.5 text-cyan" aria-hidden /> {co.name}
                          <span className="text-dim">· {co.provider}</span>
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
              return (
                <li key={step.skill} className="relative">
                  <span
                    className="absolute -left-[27px] top-5 h-2.5 w-2.5 rounded-full bg-cyan shadow-glow-cyan"
                    aria-hidden
                  />
                  {idx < 3 ? node : <Gate feature="roadmapExtended" compact>{node}</Gate>}
                </li>
              );
            })}
            {roadmap.length === 0 ? (
              <li className="text-sm text-dim">No roadmap needed — you already cover the core skills.</li>
            ) : null}
          </ol>
        </Gate>
      </section>

      {/* Section-by-section rewrites */}
      <section className="mt-12">
        <SectionHeader
          eyebrow="Advice → Act"
          title="Section rewrites"
          description="Sharpen your experience bullets. Adopt a rewrite and it edits your résumé and re-scores it on the spot."
        />
        <Gate feature="gapAnalysis">
          <div className="space-y-3">
            {bullets.length === 0 ? (
              <div className="panel rounded-xl2 p-6 text-sm text-dim">
                No experience bullets were detected in this résumé. Add a few achievement lines and re-analyze.
              </div>
            ) : (
              bullets.map((b, i) => {
                const rw = rewrites[i];
                return (
                  <div key={`${i}-${b.slice(0, 24)}`} className="panel rounded-xl2 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm leading-relaxed text-fg">{b}</p>
                      {!rw ? (
                        <Button variant="secondary" size="sm" onClick={() => requestRewrite(i, b)}>
                          <Wand2 className="h-4 w-4" aria-hidden /> Rewrite
                        </Button>
                      ) : null}
                    </div>
                    <AnimatePresence>
                      {rw ? (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 grid gap-3 md:grid-cols-2">
                            <div className="rounded-xl2 border border-red/20 bg-red/[0.04] p-4">
                              <div className="mono-caps mb-1.5 text-red">Before</div>
                              <p className="text-sm leading-relaxed text-muted line-through decoration-red/40">{rw.original}</p>
                            </div>
                            <div className="rounded-xl2 border border-green/25 bg-green/[0.05] p-4">
                              <div className="mono-caps mb-1.5 text-green">After</div>
                              <p className="text-sm leading-relaxed text-fg">{rw.rewritten}</p>
                            </div>
                          </div>
                          <ul className="mt-3 space-y-1">
                            {rw.reasons.map((reason) => (
                              <li key={reason} className="flex gap-2 text-xs text-dim">
                                <TrendingUp className="mt-0.5 h-3 w-3 shrink-0 text-cyan" aria-hidden /> {reason}
                              </li>
                            ))}
                          </ul>
                          <div className="mt-4 flex gap-2">
                            <Button size="sm" onClick={() => adoptRewrite(i, rw.original, rw.rewritten)} disabled={busy}>
                              <Check className="h-4 w-4" aria-hidden /> Adopt & re-score
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setRewrites((r) => {
                                  const clone = { ...r };
                                  delete clone[i];
                                  return clone;
                                })
                              }
                            >
                              Dismiss
                            </Button>
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>
        </Gate>
      </section>

      {/* Track progress */}
      <section className="mt-12">
        <SectionHeader
          eyebrow="The loop"
          title="Track progress"
          description="Every analyzed version, side by side. Re-analyze after edits and watch the score and median climb."
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tracked.map(({ rv, a }) => {
            const active = rv.id === resume.id;
            return (
              <div
                key={rv.id}
                className={cn(
                  "panel rounded-xl2 p-5",
                  active && "border-cyan/40 shadow-glow-cyan",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-fg">{rv.name}</span>
                  {active ? <Badge tone="cyan">Active</Badge> : rv.isOther ? <Badge tone="neutral">Comparison</Badge> : null}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <StatTile label="Score" value={`${a.score.score}`} sub="/ 100" tone={a.score.score >= 60 ? "green" : "ember"} />
                  <StatTile
                    label="Median"
                    value={formatMoney(a.estimate.median, a.estimate.currency, { compact: true })}
                    sub={LEVEL_LABEL[a.estimate.level]}
                    tone="cyan"
                  />
                </div>
                <div className="mt-3 text-xs text-dim">Analyzed {formatDate(a.createdAt)}</div>
              </div>
            );
          })}
          {tracked.length === 0 ? (
            <div className="panel rounded-xl2 p-6 text-sm text-dim">No analyzed versions yet.</div>
          ) : null}
        </div>
      </section>

      {/* Toasts */}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              className={cn(
                "glass pointer-events-auto flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-panel",
                t.tone === "green" && "text-green",
                t.tone === "cyan" && "text-cyan",
                t.tone === "red" && "text-red",
              )}
              role="status"
            >
              <Sparkles className="h-4 w-4" aria-hidden /> {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
