"use client";
import Link from "next/link";
import {
  BarChart3,
  Briefcase,
  FileText,
  GitCompare,
  KanbanSquare,
  LineChart,
  MessageSquare,
  Scale,
  Sparkles,
  TrendingUp,
  Upload,
} from "lucide-react";
import { Topbar } from "@/components/dashboard/Topbar";
import { useApp, useActiveAnalysis } from "@/lib/store";
import { can } from "@/lib/plans";
import { formatMoney } from "@/lib/format";
import { STAGES, type Stage } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import {
  DashSkeleton,
  EmptyState,
  ScoreRing,
  SectionHeader,
  StatBar,
  StatTile,
  formatCompactNumber,
  formatDate,
} from "@/components/dashboard/widgets";
import { cn } from "@/lib/utils";

const MODULES = [
  { href: "/dashboard/market-value", label: "Market value", desc: "Range · percentile · skills", icon: BarChart3 },
  { href: "/dashboard/improve", label: "Improve", desc: "Score & priority fixes", icon: Sparkles },
  { href: "/dashboard/offer-evaluator", label: "Offer evaluator", desc: "Is your offer fair?", icon: Scale },
  { href: "/dashboard/compare", label: "Compare offers", desc: "Side-by-side comp", icon: GitCompare },
  { href: "/dashboard/job-search", label: "Job search", desc: "Feed with fit scores", icon: Briefcase },
  { href: "/dashboard/pipeline", label: "Pipeline", desc: "Kanban tracker", icon: KanbanSquare },
  { href: "/dashboard/career-growth", label: "Career growth", desc: "Path to more pay", icon: TrendingUp },
  { href: "/dashboard/insights", label: "Market insights", desc: "Trends & demand", icon: LineChart },
  { href: "/dashboard/resumes", label: "Resumes", desc: "Versions & compare", icon: FileText },
  { href: "/dashboard/chat", label: "AI resume chat", desc: "Coach on your gaps", icon: MessageSquare },
];

const STAGE_LABEL: Record<Stage, string> = { saved: "Saved", applied: "Applied", interviewing: "Interviewing", offered: "Offered" };

export default function DashboardPage() {
  const hydrated = useApp((s) => s.hydrated);
  const plan = useApp((s) => s.plan);
  const resumes = useApp((s) => s.resumes);
  const pipeline = useApp((s) => s.pipeline);
  const { resume, analysis } = useActiveAnalysis();

  if (!hydrated) {
    return (
      <>
        <Topbar title="Overview" eyebrow="Dashboard" />
        <DashSkeleton />
      </>
    );
  }

  if (!analysis) {
    return (
      <>
        <Topbar title="Overview" eyebrow="Dashboard" />
        <EmptyState
          icon={Upload}
          eyebrow="One upload. A complete picture."
          title="Analyze a resume to begin"
          body="Upload a PDF or paste your resume and PayLens organizes the entire dashboard around your profile — salary range, percentile, skill gaps, jobs and a negotiation brief."
          cta={{ href: "/analyze", label: "Analyze my resume" }}
          secondary={{ href: "/salaries", label: "Browse salary guides" }}
        />
      </>
    );
  }

  const { estimate: est, score } = analysis;
  const showMedian = can(plan, "exactMedian");
  const counts = STAGES.map((st) => ({ stage: st, n: pipeline.filter((c) => c.stage === st).length }));

  return (
    <>
      <Topbar title="Overview" eyebrow="Dashboard" />

      {/* Hero market-value card */}
      <div className="panel grid-bg relative overflow-hidden rounded-xl2 p-6 md:p-8">
        <div className="vignette pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative grid gap-8 md:grid-cols-[1.4fr_auto] md:items-center">
          <div className="min-w-0">
            <div className="eyebrow text-cyan">Your market value</div>
            <div className="mt-2 flex flex-wrap items-end gap-x-4 gap-y-1">
              <span className={cn("display text-6xl tabular-nums md:text-7xl", !showMedian && "select-none blur-[10px]")}>
                {formatMoney(est.median, est.currency, { compact: true })}
              </span>
              <span className="mb-2 text-sm text-muted">
                {showMedian ? "median · updated daily" : "Exact median on Explorer"}
              </span>
            </div>
            <p className="mt-3 text-sm text-fg">
              {est.role} · {est.location.label} ·{" "}
              <span className="font-semibold text-cyan">{est.percentileLabel}</span> in your market
            </p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <StatBar label="Market position" value={est.percentileLabel} pct={est.percentile} tone="cyan" />
              <StatBar label="Skill-up potential" value={`+${est.skillUpPotentialPct}%`} pct={est.skillUpPotentialPct * 5} tone="gold" />
              <StatBar label="Resume score" value={`${score.score}/100`} pct={score.score} tone={score.score >= 60 ? "green" : "ember"} />
              <StatBar label="Data points" value={formatCompactNumber(est.dataPoints)} pct={82} tone="cyan" hint="US · CA · UK, refreshed daily" />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/dashboard/market-value" size="sm">
                Open full report <BarChart3 className="h-4 w-4" aria-hidden />
              </Button>
              <Button href="/dashboard/improve" variant="secondary" size="sm">
                Improve my score
              </Button>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 justify-self-center">
            <ScoreRing score={score.score} />
            <div className="text-center text-xs text-dim">{score.improvements.length} improvements identified</div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Floor · P25" value={formatMoney(est.floor, est.currency, { compact: true })} sub="Don't go below this" />
        <StatTile label="Ceiling · P75" value={formatMoney(est.ceiling, est.currency, { compact: true })} sub="Top of your band" tone="gold" />
        <StatTile label="Skill-up potential" value={`+${est.skillUpPotentialPct}%`} sub="Closing your top 3 gaps" tone="green" />
        <StatTile label="Data points" value={formatCompactNumber(est.dataPoints)} sub="Behind this estimate" tone="cyan" />
      </div>

      {/* Pipeline snapshot */}
      <div className="mt-10">
        <SectionHeader
          as="h3"
          eyebrow="Job search"
          title="Pipeline"
          action={
            <Button href="/dashboard/pipeline" variant="ghost" size="sm">
              Open board →
            </Button>
          }
        />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {counts.map(({ stage, n }) => (
            <Link
              key={stage}
              href="/dashboard/pipeline"
              className="panel rounded-xl2 p-5 transition-colors hover:border-line-2"
            >
              <div className="display text-4xl tabular-nums">{n}</div>
              <div className="mono-caps mt-1 text-muted">{STAGE_LABEL[stage]}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-10">
        <SectionHeader as="h3" eyebrow="Everything inside" title="Jump to a module" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map(({ href, label, desc, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-4 rounded-xl2 border border-line bg-panel p-4 transition-colors hover:border-cyan/40 hover:bg-white/[0.02]"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-line-2 bg-white/5 text-muted transition-colors group-hover:text-cyan">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-fg">{label}</span>
                <span className="block truncate text-xs text-dim">{desc}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent resumes */}
      <div className="mt-10">
        <SectionHeader
          as="h3"
          eyebrow="Versions"
          title="Recent resumes"
          action={
            <Button href="/dashboard/resumes" variant="ghost" size="sm">
              Manage →
            </Button>
          }
        />
        <div className="space-y-2">
          {resumes.slice(0, 4).map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-xl2 border border-line bg-panel px-4 py-3">
              <FileText className="h-4 w-4 text-dim" aria-hidden />
              <span className="text-sm font-medium text-fg">{r.name}</span>
              {r.isOther ? <span className="mono-caps rounded-sm border border-white/10 px-1.5 py-0.5 text-[9px] text-muted">Comparison</span> : null}
              {r.id === resume?.id ? <span className="mono-caps rounded-sm border border-cyan/30 bg-cyan/10 px-1.5 py-0.5 text-[9px] text-cyan">Active</span> : null}
              <span className="ml-auto text-xs text-dim">{formatDate(r.createdAt)}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
