"use client";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Download,
  Gauge as GaugeIcon,
  Printer,
  RefreshCw,
  Target,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { useApp, useActiveAnalysis } from "@/lib/store";
import { can } from "@/lib/plans";
import { analyzeResume, listRoles } from "@/lib/engine";
import { formatMoney } from "@/lib/format";
import type { Analysis, SkillRating } from "@/lib/types";
import { Topbar } from "@/components/dashboard/Topbar";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Badge, SeverityBadge } from "@/components/ui/Badge";
import { Gate } from "@/components/ui/Gate";
import {
  DashSkeleton,
  EmptyState,
  Gauge,
  RangeBar,
  SectionHeader,
  SkillPill,
  StatTile,
  SKILL_LEVEL_TONE,
  demandLabel,
  formatCompactNumber,
  formatDate,
} from "@/components/dashboard/widgets";
import { BarChart3 } from "lucide-react";
import { cn, clamp } from "@/lib/utils";

/* ---------- Salary Brief plain-text (PDF + printable) ---------- */
function briefLines(a: Analysis): string[] {
  const { profile, estimate: e, brief: b } = a;
  const cur = e.currency;
  const m = (n: number) => formatMoney(n, cur);
  const lines = [
    `SALARY BRIEF — ${profile.displayName}`,
    `${e.role} · ${e.location.label} · ${e.percentileLabel}`,
    `Prepared ${formatDate(a.createdAt)} · PayLens`,
    "",
    "MARKET RANGE",
    `Floor (P25):   ${m(e.floor)}`,
    `Median:        ${m(e.median)}`,
    `Ceiling (P75): ${m(e.ceiling)}`,
    "",
    "NEGOTIATION TARGETS",
    `Your floor:  ${m(b.floor)}`,
    `Target ask:  ${m(b.target)}`,
    `Stretch:     ${m(b.stretch)}`,
    `Total potential gain: ${m(b.totalPotentialGain)}`,
    "",
    "OPENING SCRIPT",
    b.openingScript,
    "",
    "TALKING POINTS",
    ...b.talkingPoints.map((t) => `• ${t}`),
    "",
    "COUNTER-TACTICS",
    ...b.counterTactics.map((t) => `• ${t}`),
    "",
    "LEVERAGE",
    ...b.leverage.map((t) => `• ${t}`),
  ];
  return lines;
}

async function downloadBriefPdf(a: Analysis) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 54;
  const width = doc.internal.pageSize.getWidth() - margin * 2;
  let y = margin;
  const lines = briefLines(a);
  lines.forEach((line, idx) => {
    if (idx === 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
    } else if (/^[A-Z][A-Z \-()]+$/.test(line) && line.length < 40) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
    }
    const wrapped = doc.splitTextToSize(line || " ", width) as string[];
    wrapped.forEach((w) => {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(w, margin, y);
      y += idx === 0 ? 22 : 15;
    });
  });
  doc.save(`salary-brief-${a.profile.role.toLowerCase().replace(/\s+/g, "-")}.pdf`);
}

function printBrief(a: Analysis) {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const body = briefLines(a)
    .map((l) => {
      if (!l) return "<div style='height:8px'></div>";
      if (/^[A-Z][A-Z \-()]+$/.test(l) && l.length < 40) return `<h2>${esc(l)}</h2>`;
      if (l.startsWith("• ")) return `<li>${esc(l.slice(2))}</li>`;
      return `<p>${esc(l)}</p>`;
    })
    .join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Salary Brief</title>
    <style>body{font:14px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;color:#111;max-width:640px;margin:40px auto;padding:0 20px}
    h2{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#555;margin:20px 0 6px;border-bottom:1px solid #ddd;padding-bottom:4px}
    p{margin:2px 0}li{margin:2px 0}ul{padding-left:18px}</style></head>
    <body>${body}<script>window.onload=function(){window.print()}<\/script></body></html>`;
  const w = window.open("", "_blank", "width=720,height=900");
  if (w) {
    w.document.open();
    w.document.write(html);
    w.document.close();
  }
}

/* ---------- Small inline meters ---------- */
function ConfidenceBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-line-2">
        <span className="block h-full rounded-full bg-cyan" style={{ width: `${clamp(value, 0, 100)}%` }} />
      </div>
      <span className="tabular-nums text-xs text-muted">{Math.round(value)}%</span>
    </div>
  );
}

function DriverBar({ value }: { value: number }) {
  // value roughly -10..+25 → normalize magnitude to 0..100 against 25.
  const mag = clamp((Math.abs(value) / 25) * 100, 0, 100);
  const positive = value >= 0;
  return (
    <div className="flex items-center gap-2" title={`Salary driver ${positive ? "+" : ""}${value}`}>
      <div className="relative h-3 w-24 rounded-full bg-line-2">
        <span className="absolute inset-y-0 left-1/2 w-px bg-white/20" aria-hidden />
        <span
          className={cn("absolute inset-y-0 rounded-full", positive ? "bg-green" : "bg-red")}
          style={positive ? { left: "50%", width: `${mag / 2}%` } : { right: "50%", width: `${mag / 2}%` }}
        />
      </div>
      <span className={cn("tabular-nums text-xs", positive ? "text-green" : "text-red")}>
        {positive ? "+" : "−"}
        {Math.abs(value)}
      </span>
    </div>
  );
}

export function MarketValueClient() {
  const hydrated = useApp((s) => s.hydrated);
  const plan = useApp((s) => s.plan);
  const setAnalysis = useApp((s) => s.setAnalysis);
  const setTargets = useApp((s) => s.setTargets);
  const displayNameOverride = useApp((s) => s.displayNameOverride);
  const { resume, analysis } = useActiveAnalysis();

  const roles = useMemo(() => listRoles(), []);
  const [targetRole, setTargetRole] = useState("");
  const [busy, setBusy] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);

  if (!hydrated) {
    return (
      <>
        <Topbar title="Market value" eyebrow="Report" />
        <DashSkeleton />
      </>
    );
  }

  if (!analysis || !resume) {
    return (
      <>
        <Topbar title="Market value" eyebrow="Report" />
        <EmptyState
          icon={BarChart3}
          eyebrow="No analysis yet"
          title="Price your resume first"
          body="Upload a PDF or paste your resume and we'll price it against real openings for your role and location."
          cta={{ href: "/analyze", label: "Analyze my resume" }}
        />
      </>
    );
  }

  const { estimate: e, score, brief } = analysis;
  const showExact = can(plan, "exactMedian");
  const showScores = can(plan, "skillScores");
  const showBreakdown = can(plan, "salaryBreakdown");

  function rerun(withTarget?: string) {
    if (!resume) return;
    setBusy(true);
    try {
      const next = analyzeResume({
        text: resume.text,
        resumeId: resume.id,
        displayName: displayNameOverride.trim() || analysis?.profile.displayName,
        targetRole: withTarget?.trim() || analysis?.targetRole,
        targetLocation: e.location.label,
      });
      setAnalysis(resume.id, next);
      if (withTarget?.trim()) setTargets({ role: withTarget.trim() });
    } finally {
      setBusy(false);
    }
  }

  const skills = analysis.profile.skills;

  return (
    <>
      <Topbar title="Market value" eyebrow="Report" />

      {/* Controls */}
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <Button variant="secondary" size="sm" onClick={() => rerun()} disabled={busy}>
          <RefreshCw className={cn("h-4 w-4", busy && "animate-spin")} aria-hidden /> Re-analyze
        </Button>
        <div className="flex items-end gap-2">
          <div>
            <Label>Analyze vs a target role</Label>
            <Input
              list="mv-roles"
              value={targetRole}
              onChange={(ev) => setTargetRole(ev.target.value)}
              placeholder={analysis.targetRole ?? "e.g. Group Product Manager"}
              className="h-9 w-56"
              aria-label="Target role"
            />
            <datalist id="mv-roles">
              {roles.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
          </div>
          <Button size="sm" onClick={() => rerun(targetRole)} disabled={busy || !targetRole.trim()}>
            <Target className="h-4 w-4" aria-hidden /> Compare
          </Button>
        </div>
        {analysis.targetRole ? (
          <Badge tone="gold" className="mb-1">
            vs {analysis.targetRole}
          </Badge>
        ) : null}
        <span className="mb-1 ml-auto text-xs text-dim">Updated {formatDate(analysis.createdAt)}</span>
      </div>

      {/* Hero: range + gauge */}
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="panel grid-bg relative overflow-hidden rounded-xl2 p-6 md:p-8">
          <div className="vignette pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative">
            <div className="eyebrow text-cyan">
              {e.role} · {e.location.label}
            </div>
            <div className="mt-2 flex flex-wrap items-end gap-4">
              <Gate feature="exactMedian" compact className="inline-block">
                <span className="display text-6xl tabular-nums md:text-7xl">{formatMoney(e.median, e.currency, { compact: true })}</span>
              </Gate>
              <span className="mb-2 text-sm text-muted">estimated median · {e.percentileLabel}</span>
            </div>
            <div className="mt-8">
              <RangeBar
                floor={e.floor}
                median={e.median}
                ceiling={e.ceiling}
                currency={e.currency}
                medianHidden={!showExact}
              />
            </div>
            {e.remoteAdjustmentPct !== 0 ? (
              <p className="mt-6 text-xs text-dim">
                Remote adjustment applied: {e.remoteAdjustmentPct > 0 ? "+" : ""}
                {e.remoteAdjustmentPct}% vs the local metro baseline.
              </p>
            ) : null}
          </div>
        </div>

        <div className="panel rounded-xl2 p-6 md:p-8">
          <div className="mb-2 flex items-center gap-2 text-muted">
            <GaugeIcon className="h-4 w-4" aria-hidden />
            <span className="eyebrow">Market percentile</span>
          </div>
          <Gauge percentile={e.percentile} label={e.percentileLabel} />
        </div>
      </div>

      {/* Quick stats */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Floor · P25" value={formatMoney(e.floor, e.currency, { compact: true })} sub="Walk-away floor" />
        <StatTile label="Ceiling · P75" value={formatMoney(e.ceiling, e.currency, { compact: true })} sub="Top of band" tone="gold" />
        <StatTile label="Skill-up potential" value={`+${e.skillUpPotentialPct}%`} sub="If top 3 gaps close" tone="green" />
        <StatTile label="Data points" value={formatCompactNumber(e.dataPoints)} sub="Behind this estimate" tone="cyan" />
      </div>

      {/* Skills breakdown */}
      <section className="mt-12">
        <SectionHeader
          eyebrow="Skills breakdown"
          title="What you're rated on"
          description="Every skill we detected, rated Expert / Advanced / General / Inferred, with a confidence score and how strongly it moves your pay."
        />
        {showScores ? (
          <div className="panel overflow-hidden rounded-xl2">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-sm">
                <thead>
                  <tr className="border-b border-line text-left">
                    <th className="px-4 py-3 font-medium text-muted">Skill</th>
                    <th className="px-4 py-3 font-medium text-muted">Level</th>
                    <th className="px-4 py-3 font-medium text-muted">Confidence</th>
                    <th className="px-4 py-3 font-medium text-muted">Salary driver</th>
                    <th className="px-4 py-3 font-medium text-muted">Demand</th>
                  </tr>
                </thead>
                <tbody>
                  {skills.map((s: SkillRating) => {
                    const dem = demandLabel(s.demand);
                    return (
                      <tr key={s.name} className="border-b border-line/60 last:border-0">
                        <td className="px-4 py-3">
                          <span className="font-medium text-fg">{s.name}</span>
                          <span className="ml-2 text-xs text-dim">{s.category}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge tone={SKILL_LEVEL_TONE[s.level]}>{s.level}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <ConfidenceBar value={s.confidence} />
                        </td>
                        <td className="px-4 py-3">
                          <DriverBar value={s.salaryDriver} />
                        </td>
                        <td className="px-4 py-3">
                          <Badge tone={dem.tone}>{dem.label}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="panel rounded-xl2 p-6">
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <SkillPill key={s.name} name={s.name} />
              ))}
            </div>
            <p className="mt-5 text-sm text-muted">
              You&apos;re seeing skill <span className="text-fg">names</span> only.{" "}
              <a href="/pricing" className="text-gold hover:underline">
                Upgrade to Explorer
              </a>{" "}
              for level, confidence, salary-driver strength and demand per skill.
            </p>
          </div>
        )}
      </section>

      {/* Lifting vs dragging */}
      {showBreakdown ? (
        <section className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="panel rounded-xl2 p-6">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green" aria-hidden />
              <h3 className="text-sm font-semibold">Lifting your number</h3>
            </div>
            <ul className="space-y-3">
              {e.skillsLifting.length ? (
                e.skillsLifting.map((s) => (
                  <li key={s.name} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-fg">{s.name}</span>
                    <span className="tabular-nums font-semibold text-green">+{formatMoney(s.contribution, e.currency, { compact: true })}</span>
                  </li>
                ))
              ) : (
                <li className="text-sm text-dim">No standout lifters yet — add specialist skills to move the number.</li>
              )}
            </ul>
          </div>
          <div className="panel rounded-xl2 p-6">
            <div className="mb-4 flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red" aria-hidden />
              <h3 className="text-sm font-semibold">Dragging it down</h3>
            </div>
            <ul className="space-y-3">
              {e.skillsDragging.length ? (
                e.skillsDragging.map((s) => (
                  <li key={s.name} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-fg">{s.name}</span>
                    <span className="tabular-nums font-semibold text-red">{formatMoney(s.contribution, e.currency, { compact: true })}</span>
                  </li>
                ))
              ) : (
                <li className="text-sm text-dim">Nothing is dragging your number down. Nice.</li>
              )}
            </ul>
          </div>
        </section>
      ) : null}

      {/* Strengths & gaps */}
      <section className="mt-12">
        <SectionHeader eyebrow="Demand-mapped" title="Strengths & gaps" description="What holds your number up versus what holds it back, based on market demand." />
        <Gate feature="strengthsGaps">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="panel rounded-xl2 p-6">
              <h3 className="mb-4 text-sm font-semibold text-green">Strengths</h3>
              <ul className="space-y-4">
                {score.strengths.map((s) => (
                  <li key={s.title}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-fg">{s.title}</span>
                      <span className="mono-caps text-dim">Demand {Math.round(s.demand)}</span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted">{s.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="panel rounded-xl2 p-6">
              <h3 className="mb-4 text-sm font-semibold text-amber">Gaps</h3>
              <ul className="space-y-4">
                {score.gaps.map((g) => (
                  <li key={g.title}>
                    <div className="flex flex-wrap items-center gap-2">
                      <SeverityBadge severity={g.severity} />
                      <span className="text-sm font-medium text-fg">{g.title}</span>
                      <span className="mono-caps text-gold">{g.impactLabel}</span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted">{g.detail}</p>
                    <p className="mt-1 text-xs text-cyan">Fix: {g.fix}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Gate>
      </section>

      {/* Skill-up potential */}
      <section className="mt-10">
        <div className="panel relative overflow-hidden rounded-xl2 p-6 md:p-8">
          <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
            <div className="text-center">
              <div className="display text-6xl tabular-nums text-green md:text-7xl">+{e.skillUpPotentialPct}%</div>
              <div className="mono-caps mt-1 text-muted">Skill-up potential</div>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Estimated market-value increase with targeted upskilling</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Closing your three highest-demand missing skills could add about{" "}
                <span className="font-semibold text-fg">
                  {formatMoney((e.median * e.skillUpPotentialPct) / 100, e.currency, { compact: true })}
                </span>{" "}
                to your median. See the ranked roadmap and courses in Improve.
              </p>
              <Button href="/dashboard/improve" variant="secondary" size="sm" className="mt-4">
                Build my roadmap <ArrowUpRight className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Salary Brief */}
      <section className="mt-12">
        <SectionHeader
          eyebrow="Negotiation"
          title="Salary Brief"
          description="A negotiation-ready brief tied to your skills and market position."
          action={
            <div className="flex gap-2">
              {can(plan, "briefPdf") ? (
                <Button size="sm" onClick={() => void downloadBriefPdf(analysis)}>
                  <Download className="h-4 w-4" aria-hidden /> Download PDF
                </Button>
              ) : can(plan, "salaryBrief") ? (
                <Button size="sm" variant="secondary" onClick={() => setPrintOpen(true)}>
                  <Printer className="h-4 w-4" aria-hidden /> Printable brief
                </Button>
              ) : null}
            </div>
          }
        />
        <Gate feature="salaryBrief">
          <div className="panel rounded-xl2 p-6 md:p-8">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatTile label="Your floor" value={formatMoney(brief.floor, brief.currency, { compact: true })} sub="Don't accept below" />
              <StatTile label="Target ask" value={formatMoney(brief.target, brief.currency, { compact: true })} sub="Anchor here" tone="cyan" />
              <StatTile label="Stretch goal" value={formatMoney(brief.stretch, brief.currency, { compact: true })} sub="If leverage is strong" tone="gold" />
            </div>

            <div className="mt-6 rounded-xl2 border border-line bg-bg-2 p-5">
              <div className="eyebrow mb-2 text-cyan">Opening script</div>
              <p className="text-sm leading-relaxed text-fg">{brief.openingScript}</p>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-3">
              <div>
                <h4 className="mb-2 text-sm font-semibold">Talking points</h4>
                <ul className="space-y-2 text-sm text-muted">
                  {brief.talkingPoints.map((t) => (
                    <li key={t} className="flex gap-2">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-cyan" aria-hidden />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-semibold">Counter-tactics</h4>
                <ul className="space-y-2 text-sm text-muted">
                  {brief.counterTactics.map((t) => (
                    <li key={t} className="flex gap-2">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-gold" aria-hidden />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-semibold">Leverage</h4>
                <ul className="space-y-2 text-sm text-muted">
                  {brief.leverage.map((t) => (
                    <li key={t} className="flex gap-2">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-ember" aria-hidden />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="mt-6 text-xs text-dim">
              Total potential gain vs a floor offer:{" "}
              <span className="font-semibold text-green">{formatMoney(brief.totalPotentialGain, brief.currency, { compact: true })}</span>. Yours to keep.
            </p>
          </div>
        </Gate>
      </section>

      {/* Printable modal (Explorer) */}
      <AnimatePresence>
        {printOpen ? (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-bg/85 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Printable Salary Brief"
          >
            <div className="panel relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl2 p-6">
              <button
                onClick={() => setPrintOpen(false)}
                className="absolute right-4 top-4 text-dim hover:text-fg"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="eyebrow text-cyan">Salary Brief</div>
              <h3 className="display mt-1 text-3xl">{analysis.profile.displayName}</h3>
              <pre className="mt-4 whitespace-pre-wrap font-sans text-sm leading-relaxed text-muted">
                {briefLines(analysis).slice(4).join("\n")}
              </pre>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => setPrintOpen(false)}>
                  Close
                </Button>
                <Button size="sm" onClick={() => printBrief(analysis)}>
                  <Printer className="h-4 w-4" aria-hidden /> Print / Save as PDF
                </Button>
              </div>
              <p className="mt-3 text-xs text-dim">PDF export without printing is a Hunter feature.</p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
