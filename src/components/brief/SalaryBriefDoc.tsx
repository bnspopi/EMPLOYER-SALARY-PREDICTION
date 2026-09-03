"use client";
import { useState } from "react";
import { Download, FileText, Check } from "lucide-react";
import type { NegotiationBrief } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { Gate } from "@/components/ui/Gate";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { exportBriefPdf, type BriefEstimate, type BriefProfile } from "./exportBriefPdf";

/**
 * On-screen Salary Brief: floor/target/stretch, opening script, counter-tactics,
 * leverage. Includes a jspdf download button gated behind `briefPdf`.
 */
export function SalaryBriefDoc({
  brief,
  estimate,
  profile,
  title = "Salary Brief",
  pdfTitle,
  className,
}: {
  brief: NegotiationBrief;
  estimate: BriefEstimate;
  profile: BriefProfile;
  title?: string;
  pdfTitle?: string;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const money = (n: number) => formatMoney(n, brief.currency);

  const download = async () => {
    setBusy(true);
    try {
      await exportBriefPdf(brief, estimate, profile, pdfTitle);
      setDone(true);
      window.setTimeout(() => setDone(false), 2500);
    } finally {
      setBusy(false);
    }
  };

  const targets: { key: string; label: string; value: number; tone: string; note: string }[] = [
    { key: "floor", label: "Floor", value: brief.floor, tone: "text-fg", note: "Don't go below" },
    { key: "target", label: "Target ask", value: brief.target, tone: "text-green", note: "Aim here" },
    { key: "stretch", label: "Stretch", value: brief.stretch, tone: "text-gold", note: "If leverage is strong" },
  ];

  return (
    <div className={cn("panel grid-bg relative overflow-hidden rounded-xl2 p-5 md:p-6", className)}>
      <div className="vignette pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="eyebrow text-gold">Negotiation document</div>
            <h3 className="mt-1 flex items-center gap-2 text-lg font-semibold tracking-tight">
              <FileText className="h-4 w-4 text-gold" aria-hidden /> {title}
            </h3>
            <p className="mt-1 text-xs text-dim">
              {estimate.role} · {estimate.location.label} · {estimate.percentileLabel}
            </p>
          </div>
          <Gate feature="briefPdf" compact className="min-w-[220px]">
            <Button variant="gold" size="sm" onClick={download} disabled={busy}>
              {done ? (
                <>
                  <Check className="h-4 w-4" aria-hidden /> Saved
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" aria-hidden /> {busy ? "Building PDF…" : "Download PDF"}
                </>
              )}
            </Button>
          </Gate>
        </div>

        {/* Targets */}
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {targets.map((t) => (
            <div key={t.key} className="rounded-xl2 border border-line bg-bg-2/60 p-4">
              <div className="mono-caps text-muted">{t.label}</div>
              <div className={cn("display mt-1 text-2xl tabular-nums", t.tone)}>{money(t.value)}</div>
              <div className="mt-0.5 text-[11px] text-dim">{t.note}</div>
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs text-muted">
          Total potential gain{" "}
          <span className="font-semibold tabular-nums text-fg">{money(brief.totalPotentialGain)}</span> across the range.
        </div>

        {/* Opening script */}
        <div className="mt-5">
          <div className="eyebrow mb-1.5 text-cyan">Opening script</div>
          <blockquote className="serif-italic rounded-md border-l-2 border-cyan/50 bg-bg-2/50 px-4 py-3 text-sm leading-relaxed text-fg">
            &ldquo;{brief.openingScript}&rdquo;
          </blockquote>
        </div>

        {/* Talking points */}
        {brief.talkingPoints.length > 0 ? (
          <BriefList eyebrow="Talking points" items={brief.talkingPoints} dot="bg-cyan" />
        ) : null}

        {/* Counter-tactics */}
        <BriefList eyebrow="Counter-tactics" items={brief.counterTactics} dot="bg-ember" />

        {/* Leverage */}
        <BriefList eyebrow="Leverage" items={brief.leverage} dot="bg-gold" />
      </div>
    </div>
  );
}

function BriefList({ eyebrow, items, dot }: { eyebrow: string; items: string[]; dot: string }) {
  return (
    <div className="mt-5">
      <div className="eyebrow mb-2">{eyebrow}</div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-fg">
            <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", dot)} aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
