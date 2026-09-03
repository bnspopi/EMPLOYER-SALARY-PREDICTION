"use client";
import { useMemo } from "react";
import { GraduationCap } from "lucide-react";
import type { Job, Profile } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import { coursePicks, levelBenchmarks, LEVEL_TITLE } from "../helpers";

/** Entry → Lead salary benchmarks for a saved job's role + city, plus course picks to close gaps. */
export function BenchmarksDrawer({ job, profile }: { job: Job; profile?: Profile }) {
  const benchmarks = useMemo(
    () => levelBenchmarks(job.role, job.location, job.currency),
    [job.role, job.location, job.currency],
  );
  const courses = useMemo(() => (profile ? coursePicks(profile, job, 4) : []), [profile, job]);
  const max = Math.max(...benchmarks.map((b) => b.median), 1);

  return (
    <div className="mt-3 rounded-lg border border-line bg-bg-2/50 p-4">
      <div className="mono-caps mb-3 text-dim">
        Level benchmarks · {job.role} · {job.location}
      </div>
      <div className="space-y-2.5">
        {benchmarks.map((b) => {
          const current = b.level === job.level;
          return (
            <div key={b.level}>
              <div className="mb-1 flex items-baseline justify-between gap-3">
                <span className={cn("mono-caps", current ? "text-cyan" : "text-muted")}>
                  {LEVEL_TITLE[b.level]}
                  {current ? " · this role" : ""}
                </span>
                <span className="text-sm font-semibold tabular-nums text-fg">
                  {formatMoney(b.median, job.currency, { compact: true })}
                </span>
              </div>
              <div className="stat-bar rounded-full">
                <span
                  style={{
                    width: `${(b.median / max) * 100}%`,
                    background: current ? "var(--color-cyan)" : "var(--color-line-2)",
                    boxShadow: current ? "0 0 10px var(--color-cyan)" : "none",
                  }}
                />
              </div>
              <div className="mt-1 flex justify-between text-[11px] text-dim">
                <span>Floor {formatMoney(b.floor, job.currency, { compact: true })}</span>
                <span>Ceiling {formatMoney(b.ceiling, job.currency, { compact: true })}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 border-t border-line/70 pt-3">
        <div className="mb-2 flex items-center gap-1.5">
          <GraduationCap className="h-3.5 w-3.5 text-cyan" aria-hidden />
          <span className="mono-caps text-dim">Course picks</span>
        </div>
        {courses.length ? (
          <ul className="space-y-1.5">
            {courses.map((c) => (
              <li key={c.name} className="flex items-center justify-between gap-3 text-xs">
                <span className="min-w-0 truncate text-fg">
                  {c.name} <span className="text-dim">· {c.provider}</span>
                </span>
                <span className="shrink-0 font-semibold tabular-nums text-green">+{c.upliftPct}%</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-dim">
            {profile ? "You already cover this role's core skills." : "Analyze a resume for course picks."}
          </p>
        )}
      </div>
    </div>
  );
}
