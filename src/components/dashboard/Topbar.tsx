"use client";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { PLAN_META } from "@/lib/plans";
import { Badge } from "@/components/ui/Badge";

export function Topbar({ title, eyebrow }: { title: string; eyebrow?: string }) {
  const resumes = useApp((s) => s.resumes);
  const activeResumeId = useApp((s) => s.activeResumeId);
  const setActiveResume = useApp((s) => s.setActiveResume);
  const plan = useApp((s) => s.plan);
  const hydrated = useApp((s) => s.hydrated);
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? <div className="eyebrow mb-1">{eyebrow}</div> : null}
        <h1 className="display text-4xl md:text-5xl">{title}</h1>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {hydrated ? <Badge tone={plan === "hunter" ? "gold" : plan === "explorer" ? "cyan" : "neutral"}>{PLAN_META[plan].name}</Badge> : null}
        {hydrated && resumes.length > 0 ? (
          <label className="flex items-center gap-2 text-xs text-muted">
            Active resume
            <select
              className="rounded-md border border-line bg-bg-2 px-2 py-1.5 text-xs text-fg"
              value={activeResumeId ?? ""}
              onChange={(e) => setActiveResume(e.target.value)}
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <Link href="/analyze" className="text-xs text-cyan hover:underline">
            Upload a resume →
          </Link>
        )}
      </div>
    </div>
  );
}
