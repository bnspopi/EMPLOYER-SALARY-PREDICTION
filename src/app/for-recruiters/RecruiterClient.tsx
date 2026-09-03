"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Printer, Loader2, TrendingUp, MapPin, Layers, Building2 } from "lucide-react";
import type { RecruiterReport } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { Button, Badge } from "@/components/ui";
import { Field } from "@/components/marketing/Field";
import { RangeBars, rangeScale, type RangeRow } from "@/components/marketing/RangeBars";

const SAMPLE_JD = `Senior Backend Engineer
We are hiring a Senior Backend Engineer to design and scale our payments platform. You will build distributed services in Go and Python, own Postgres data models, and run infrastructure on AWS with Kubernetes and Terraform. 6+ years of experience, strong system design, and SQL are required. Experience with Kafka, gRPC and CI/CD pipelines is a plus.`;

export function RecruiterClient() {
  const [title, setTitle] = useState("Senior Backend Engineer");
  const [location, setLocation] = useState("San Francisco");
  const [industry, setIndustry] = useState("Technology");
  const [description, setDescription] = useState(SAMPLE_JD);
  const [report, setReport] = useState<RecruiterReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function analyze(ev: React.FormEvent) {
    ev.preventDefault();
    if (description.trim().length < 30) {
      setError("Paste at least a couple of sentences of the job description.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/recruiter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, location, industry, description }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Could not benchmark this description.");
      }
      const data = (await res.json()) as RecruiterReport;
      setReport(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,380px)_1fr]">
      {/* Form */}
      <form onSubmit={analyze} noValidate className="rounded-xl2 border border-line bg-panel p-6 print:hidden">
        <div className="eyebrow mb-5 text-cyan">Job description analyzer</div>
        <div className="space-y-4">
          <Field id="jd-title" label="Job title">
            <input
              id="jd-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Senior Backend Engineer"
              className="w-full rounded-md border border-line bg-bg-2 px-3.5 py-2.5 text-sm text-fg placeholder:text-dim focus:border-cyan/60 focus:outline-none"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field id="jd-location" label="Location">
              <input
                id="jd-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="San Francisco"
                list="recruiter-cities"
                className="w-full rounded-md border border-line bg-bg-2 px-3.5 py-2.5 text-sm text-fg placeholder:text-dim focus:border-cyan/60 focus:outline-none"
              />
              <datalist id="recruiter-cities">
                <option value="San Francisco" />
                <option value="New York" />
                <option value="Austin" />
                <option value="Seattle" />
                <option value="Remote" />
                <option value="Toronto" />
                <option value="London" />
              </datalist>
            </Field>
            <Field id="jd-industry" label="Industry">
              <input
                id="jd-industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="Technology"
                list="recruiter-industries"
                className="w-full rounded-md border border-line bg-bg-2 px-3.5 py-2.5 text-sm text-fg placeholder:text-dim focus:border-cyan/60 focus:outline-none"
              />
              <datalist id="recruiter-industries">
                <option value="Technology" />
                <option value="Finance" />
                <option value="Healthcare" />
                <option value="E-commerce" />
                <option value="Fintech" />
              </datalist>
            </Field>
          </div>
          <Field id="jd-body" label="Job description" error={error} hint={`${description.trim().length} chars`}>
            <textarea
              id="jd-body"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={9}
              aria-invalid={!!error}
              placeholder="Paste the full job description here…"
              className="w-full rounded-md border border-line bg-bg-2 px-3.5 py-2.5 text-sm leading-relaxed text-fg placeholder:text-dim focus:border-cyan/60 focus:outline-none"
            />
          </Field>
          <Button type="submit" size="md" className="w-full" variant="gold" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Benchmarking…
              </>
            ) : (
              "Analyze job description"
            )}
          </Button>
          <p className="text-center text-[11px] text-dim">14-day free trial • No credit card required</p>
        </div>
      </form>

      {/* Report */}
      <div>
        {report ? (
          <ReportView report={report} />
        ) : (
          <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-xl2 border border-dashed border-line bg-panel/40 p-10 text-center print:hidden">
            <TrendingUp size={28} className="text-dim" />
            <p className="mt-4 max-w-xs text-sm text-muted">
              Fill in a job title and paste a description to get an instant salary benchmark with bands by city, level and industry.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ReportView({ report }: { report: RecruiterReport }) {
  const cur = report.currency;
  const cityRows: RangeRow[] = report.byCity.map((c) => ({ label: c.city, min: c.min, max: c.max }));
  const levelRows: RangeRow[] = report.byLevel.map((l) => ({ label: l.level, min: l.min, max: l.max }));
  const industryRows: RangeRow[] = report.byIndustry.map((i) => ({ label: i.industry, min: i.min, max: i.max }));
  const scale = rangeScale([...cityRows, ...levelRows, ...industryRows]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6 rounded-xl2 border border-line bg-panel p-6 md:p-8 print:border-neutral-300 print:bg-white print:text-black"
    >
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6 print:border-neutral-300">
        <div>
          <div className="eyebrow text-gold print:text-neutral-500">Salary benchmark · {report.level} level</div>
          <h2 className="mt-2 text-2xl font-semibold text-fg print:text-black">{report.title}</h2>
          <p className="mt-1 text-sm text-muted print:text-neutral-600">
            Recommended posting band ·{" "}
            <span className="font-medium text-fg print:text-black">
              {formatMoney(report.recommendedBand.min, cur)} – {formatMoney(report.recommendedBand.max, cur)}
            </span>
          </p>
        </div>
        <div className="text-right">
          <div className="mono-caps text-[10px] text-dim">Market median</div>
          <div className="display text-4xl leading-none text-cyan tabular-nums print:text-black">{formatMoney(report.median, cur)}</div>
          <div className="mt-1 text-xs text-muted print:text-neutral-600">
            {formatMoney(report.range.min, cur)} – {formatMoney(report.range.max, cur)}
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={() => window.print()} className="print:hidden">
          <Printer size={14} /> Download report
        </Button>
      </header>

      {/* Bands */}
      <div className="grid gap-8 md:grid-cols-2">
        <BandBlock icon={<MapPin size={14} />} title="By city">
          <RangeBars rows={cityRows} currency={cur} accent="cyan" scale={scale} />
        </BandBlock>
        <BandBlock icon={<Layers size={14} />} title="By experience level">
          <RangeBars rows={levelRows} currency={cur} accent="gold" scale={scale} highlight={levelLabelFor(report.level)} />
        </BandBlock>
        <BandBlock icon={<Building2 size={14} />} title="By industry">
          <RangeBars rows={industryRows} currency={cur} accent="cyan" scale={scale} />
        </BandBlock>
        <BandBlock icon={<TrendingUp size={14} />} title="Recommended band (P40–P65)">
          <RangeBars rows={[{ label: "Post at", min: report.recommendedBand.min, max: report.recommendedBand.max }]} currency={cur} accent="ember" scale={scale} labelWidth="w-20" />
          <p className="mt-3 text-xs text-muted print:text-neutral-600">
            Posting inside this band stays competitive without overpaying against the market median.
          </p>
        </BandBlock>
      </div>

      {/* Skills */}
      <div className="grid gap-6 border-t border-line pt-6 md:grid-cols-2 print:border-neutral-300">
        <div>
          <div className="mono-caps mb-3 text-[10px] text-gold">Required skills</div>
          {report.requiredSkills.length ? (
            <div className="flex flex-wrap gap-2">
              {report.requiredSkills.map((s) => (
                <Badge key={s} tone="cyan">
                  {s}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-dim">No standout hard requirements detected.</p>
          )}
        </div>
        <div>
          <div className="mono-caps mb-3 text-[10px] text-dim">Nice to have</div>
          {report.niceToHave.length ? (
            <div className="flex flex-wrap gap-2">
              {report.niceToHave.map((s) => (
                <Badge key={s} tone="neutral">
                  {s}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-dim">—</p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="border-t border-line pt-6 print:border-neutral-300">
        <div className="mono-caps mb-3 text-[10px] text-cyan">Hiring notes</div>
        <ul className="space-y-2">
          {report.notes.map((n, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-muted print:text-neutral-700">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan" aria-hidden />
              <span>{n}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.article>
  );
}

function BandBlock({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2 text-muted print:text-neutral-600">
        <span className="text-cyan print:text-neutral-500">{icon}</span>
        <span className="mono-caps text-[10px]">{title}</span>
      </div>
      {children}
    </div>
  );
}

function levelLabelFor(level: string) {
  return { entry: "Junior", mid: "Mid-Level", senior: "Senior", lead: "Lead" }[level] ?? "";
}

