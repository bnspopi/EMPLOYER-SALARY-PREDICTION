"use client";
import { useMemo, useState } from "react";
import { Check, ChevronDown, ClipboardList, Copy, Download, FileText } from "lucide-react";
import type { ApplicationPack, Job } from "@/lib/types";
import { useActiveAnalysis, useApp } from "@/lib/store";
import { buildApplicationPack } from "@/lib/engine";
import { formatMoney } from "@/lib/format";
import { Topbar } from "@/components/dashboard/Topbar";
import { Gate } from "@/components/ui/Gate";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { DashSkeleton, EmptyState, Reveal } from "@/components/dashboard/widgets";
import { FitRing } from "@/components/dashboard/jobs/FitRing";
import { FitBreakdown } from "@/components/dashboard/jobs/FitBreakdown";
import { cn } from "@/lib/utils";

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1 text-xs text-muted transition-colors hover:text-fg"
      aria-label={label}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
      {copied ? "Copied" : label}
    </button>
  );
}

/** Editable pack UI. State initialises from `pack`; remounted (via key) when the pack changes. */
function PackEditor({ job, pack }: { job: Job; pack: ApplicationPack }) {
  const [summary, setSummary] = useState(pack.tailoredSummary);
  const [bullets, setBullets] = useState(pack.tailoredBullets.join("\n"));
  const [coverLetter, setCoverLetter] = useState(pack.coverLetter);
  const [prep, setPrep] = useState(pack.interviewPrep.map((p) => ({ ...p })));
  const [openPrep, setOpenPrep] = useState(0);

  function downloadTxt() {
    const lines = [
      `APPLICATION PACK — ${job.title} @ ${job.company}`,
      `${job.location} · Market median ${formatMoney(pack.fit.marketMedian, job.currency, { compact: true })} · Fit ${pack.fit.score}%`,
      "",
      "TAILORED SUMMARY",
      summary,
      "",
      "TAILORED BULLETS",
      ...bullets.split("\n").filter(Boolean).map((b) => `- ${b}`),
      "",
      "COVER LETTER",
      coverLetter,
      "",
      "INTERVIEW PREP",
      ...prep.flatMap((p) => [`Q: ${p.question}`, `A: ${p.answerOutline}`, ""]),
    ].join("\n");
    const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `application-pack-${job.company.toLowerCase().replace(/\s+/g, "-")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
      {/* Editable pack */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={downloadTxt} variant="secondary" size="sm">
            <Download className="h-4 w-4" aria-hidden /> Download .txt
          </Button>
          <span className="text-xs text-dim">Everything below is editable — tweak, copy, and send.</span>
        </div>

        <section className="panel rounded-xl2 p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-fg">Tailored summary</h3>
            <CopyButton text={summary} />
          </div>
          <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} aria-label="Tailored summary" className="min-h-[110px]" />
        </section>

        <section className="panel rounded-xl2 p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-fg">Tailored bullets</h3>
            <CopyButton text={bullets.split("\n").filter(Boolean).map((b) => `• ${b}`).join("\n")} />
          </div>
          <p className="mb-2 text-xs text-dim">One bullet per line.</p>
          <Textarea value={bullets} onChange={(e) => setBullets(e.target.value)} aria-label="Tailored resume bullets" className="min-h-[160px]" />
        </section>

        <section className="panel rounded-xl2 p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-fg">Cover letter</h3>
            <CopyButton text={coverLetter} />
          </div>
          <Textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} aria-label="Cover letter" className="min-h-[280px]" />
        </section>

        <section className="panel rounded-xl2 p-5">
          <h3 className="mb-3 text-sm font-semibold text-fg">Interview prep</h3>
          <div className="space-y-2">
            {prep.map((item, i) => {
              const open = openPrep === i;
              return (
                <div key={item.question} className="rounded-lg border border-line">
                  <button
                    type="button"
                    onClick={() => setOpenPrep(open ? -1 : i)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-fg"
                  >
                    {item.question}
                    <ChevronDown className={cn("h-4 w-4 shrink-0 text-dim transition-transform", open && "rotate-180")} aria-hidden />
                  </button>
                  {open ? (
                    <div className="border-t border-line/70 p-4">
                      <Textarea
                        value={item.answerOutline}
                        onChange={(e) => setPrep((prev) => prev.map((p, j) => (j === i ? { ...p, answerOutline: e.target.value } : p)))}
                        aria-label={`Answer outline for: ${item.question}`}
                        className="min-h-[100px] text-sm"
                      />
                      <div className="mt-2 flex justify-end">
                        <CopyButton text={`${item.question}\n${item.answerOutline}`} />
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Fit matrix side */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="panel rounded-xl2 p-5">
          <div className="mb-4 flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-cyan" aria-hidden />
            <h3 className="text-sm font-semibold text-fg">Fit matrix</h3>
          </div>
          <div className="mb-4 flex items-center gap-4">
            <FitRing score={pack.fit.score} size={64} label={`Fit for ${job.title}`} />
            <p className="text-xs leading-relaxed text-muted">{pack.fit.salaryContext}</p>
          </div>
          <FitBreakdown fit={pack.fit} />
        </div>
      </aside>
    </div>
  );
}

export function ApplicationPackClient({ job }: { job: Job }) {
  const hydrated = useApp((s) => s.hydrated);
  const { resume, analysis } = useActiveAnalysis();
  const profile = analysis?.profile;

  const pack = useMemo(() => (profile ? buildApplicationPack(job, profile) : null), [job, profile]);

  if (!hydrated) {
    return (
      <>
        <Topbar title="Application pack" eyebrow="Jobs" />
        <DashSkeleton />
      </>
    );
  }

  return (
    <>
      <Topbar title="Application pack" eyebrow="Jobs" />

      <Reveal>
        <div className="panel rounded-xl2 p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="eyebrow text-gold">{job.company}</div>
              <h2 className="mt-1 text-xl font-semibold text-fg">{job.title}</h2>
              <div className="mt-1 text-sm text-muted">
                {job.location} · Market median{" "}
                {pack ? (
                  <span className="tabular-nums text-cyan">{formatMoney(pack.fit.marketMedian, job.currency, { compact: true })}</span>
                ) : (
                  "—"
                )}
              </div>
            </div>
            {pack ? <FitRing score={pack.fit.score} size={72} label={`Fit for ${job.title}`} /> : null}
          </div>
        </div>
      </Reveal>

      <Gate feature="applicationPack" className="mt-6">
        {!profile || !pack ? (
          <EmptyState
            icon={FileText}
            eyebrow="No active resume"
            title="Analyze a resume to build this pack"
            body="Your application pack is tailored from your parsed profile — the tailored summary, bullets, cover letter and interview prep all draw on your real skills and experience."
            cta={{ href: "/analyze", label: "Analyze my resume" }}
          />
        ) : (
          <PackEditor key={`${resume?.id ?? "none"}-${job.id}`} job={job} pack={pack} />
        )}
      </Gate>
    </>
  );
}
