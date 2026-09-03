"use client";
import { useState } from "react";
import { ScanSearch, Sparkles } from "lucide-react";
import type { JobFit, Profile } from "@/lib/types";
import { checkFit } from "@/lib/engine";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Textarea, Label } from "@/components/ui/Input";
import { FitRing } from "./FitRing";
import { FitBreakdown } from "./FitBreakdown";
import { parseJobDescription } from "./helpers";

interface Result {
  fit: JobFit;
  title: string;
  salaryDetected: boolean;
  currency: Profile["location"]["currency"];
}

export function CheckMyFit({ profile }: { profile?: Profile }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run() {
    if (text.trim().length < 40) {
      setError("Paste at least a few lines of the job description.");
      setResult(null);
      return;
    }
    setError(null);
    const { job, title, salaryDetected } = parseJobDescription(text, profile?.role);
    const fit = checkFit(job, profile);
    setResult({ fit, title, salaryDetected, currency: job.currency });
  }

  return (
    <div>
      <Label hint="works on any pasted job description">Paste a job description</Label>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste the full job description here — responsibilities, requirements, location and salary if listed…"
        aria-label="Job description to check fit against"
        className="min-h-[160px]"
      />
      <div className="mt-3 flex items-center gap-3">
        <Button onClick={run}>
          <ScanSearch className="h-4 w-4" aria-hidden /> Check my fit
        </Button>
        {!profile ? (
          <span className="text-xs text-dim">Analyze a resume first for a personalised score.</span>
        ) : null}
      </div>
      {error ? <p className="mt-2 text-xs text-red">{error}</p> : null}

      {result ? (
        <div className="mt-6 border-t border-line/70 pt-6">
          <div className="flex flex-wrap items-center gap-5">
            <FitRing score={result.fit.score} size={92} stroke={8} label={`Fit for ${result.title}`} />
            <div className="min-w-0 flex-1">
              <div className="eyebrow text-cyan">Your fit</div>
              <h4 className="mt-1 text-lg font-semibold text-fg">{result.title}</h4>
              <p className="mt-1 text-sm text-muted">{result.fit.salaryContext}</p>
              {!result.salaryDetected ? (
                <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-dim">
                  <Sparkles className="h-3.5 w-3.5 text-gold" aria-hidden />
                  No salary listed — market median for this role is {formatMoney(result.fit.marketMedian, result.currency, { compact: true })}.
                </p>
              ) : null}
            </div>
          </div>
          <div className="mt-5">
            <FitBreakdown fit={result.fit} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
