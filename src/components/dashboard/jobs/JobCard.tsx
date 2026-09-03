"use client";
import { useState } from "react";
import Link from "next/link";
import { Bookmark, BookmarkCheck, Building2, ChevronDown, ClipboardList, Lock, MapPin } from "lucide-react";
import type { JobMatch } from "@/lib/types";
import { useApp, usePlan } from "@/lib/store";
import { can } from "@/lib/plans";
import { formatMoney } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { FitRing } from "./FitRing";
import { FitBreakdown } from "./FitBreakdown";

function postedLabel(days: number): string {
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.round(days / 7)}w ago`;
  return `${Math.round(days / 30)}mo ago`;
}

export function JobCard({ match }: { match: JobMatch }) {
  const { job, fit } = match;
  const plan = usePlan();
  const saveJob = useApp((s) => s.saveJob);
  const saved = useApp((s) => s.pipeline.some((c) => c.jobId === job.id));
  const [open, setOpen] = useState(false);

  const canBreakdown = can(plan, "checkMyFit");
  const canPack = can(plan, "applicationPack");

  return (
    <article className="panel rounded-xl2 p-5 transition-colors hover:border-line-2">
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-fg">{job.title}</h3>
            {job.remote ? <Badge tone="cyan">Remote</Badge> : null}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-dim" aria-hidden /> {job.company}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-dim" aria-hidden /> {job.location}
            </span>
            <span className="text-dim">{postedLabel(job.postedDaysAgo)}</span>
          </div>
        </div>
        <FitRing score={fit.score} label={`Fit for ${job.title}`} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-line bg-bg-2/60 p-3">
          <div className="mono-caps text-dim">Salary range</div>
          <div className="mt-1 text-sm font-semibold tabular-nums text-fg">
            {formatMoney(job.salaryMin, job.currency, { compact: true })} – {formatMoney(job.salaryMax, job.currency, { compact: true })}
          </div>
        </div>
        <div className="rounded-lg border border-line bg-bg-2/60 p-3">
          <div className="mono-caps text-dim">Market median</div>
          <div className="mt-1 text-sm font-semibold tabular-nums text-cyan">
            {formatMoney(fit.marketMedian, job.currency, { compact: true })}
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted">{fit.salaryContext}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => saveJob(job, fit.score, fit.marketMedian)}
          disabled={saved}
          aria-pressed={saved}
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-md border px-4 text-xs font-medium transition-colors",
            saved
              ? "cursor-default border-green/30 bg-green/10 text-green"
              : "border-line bg-panel-2 text-fg hover:border-line-2",
          )}
        >
          {saved ? <BookmarkCheck className="h-4 w-4" aria-hidden /> : <Bookmark className="h-4 w-4" aria-hidden />}
          {saved ? "Saved to pipeline" : "Save"}
        </button>

        {canPack ? (
          <Link
            href={`/dashboard/application-pack/${job.id}`}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-gold/30 bg-gold/10 px-4 text-xs font-medium text-gold transition-colors hover:bg-gold/15"
          >
            <ClipboardList className="h-4 w-4" aria-hidden /> Application pack
          </Link>
        ) : (
          <Link
            href="/pricing"
            className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-4 text-xs font-medium text-dim transition-colors hover:text-muted"
            title="Application Pack is a Hunter feature"
          >
            <Lock className="h-3.5 w-3.5" aria-hidden /> Application pack · Hunter
          </Link>
        )}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-xs font-medium text-muted transition-colors hover:text-fg"
        >
          Fit breakdown
          <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} aria-hidden />
        </button>
      </div>

      {open ? (
        <div className="mt-4 border-t border-line/70 pt-4">
          {canBreakdown ? (
            <FitBreakdown fit={fit} />
          ) : (
            <div className="rounded-lg border border-gold/25 bg-gold/5 p-4 text-sm text-muted">
              <span className="font-medium text-gold">Explorer</span> unlocks the full matched / partial / gap
              breakdown for every requirement. On Curious you can still see your overall fit score.{" "}
              <Link href="/pricing" className="text-cyan hover:underline">
                Upgrade →
              </Link>
            </div>
          )}
        </div>
      ) : null}
    </article>
  );
}
