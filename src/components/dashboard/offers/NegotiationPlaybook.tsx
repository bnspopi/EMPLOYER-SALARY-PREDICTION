"use client";
import { useState } from "react";
import { Copy, Check, Mail, Phone, Shield, Flag, ClipboardList } from "lucide-react";
import type { OfferVerdict } from "@/lib/types";
import { buildPlaybook, type PlaybookStep } from "./logic";
import { cn } from "@/lib/utils";

const CHANNEL_ICON = {
  Prep: ClipboardList,
  Email: Mail,
  Call: Phone,
  Counter: Shield,
  Close: Flag,
} as const;

const CHANNEL_TONE = {
  Prep: "text-muted border-line-2 bg-white/5",
  Email: "text-cyan border-cyan/40 bg-cyan/10",
  Call: "text-gold border-gold/40 bg-gold/10",
  Counter: "text-ember border-ember/40 bg-ember/10",
  Close: "text-green border-green/40 bg-green/10",
} as const;

/** Hunter: 6-step negotiation plan with copyable email/call/counter scripts. */
export function NegotiationPlaybook({ verdict }: { verdict: OfferVerdict }) {
  const steps = buildPlaybook(verdict);
  return (
    <ol className="space-y-4">
      {steps.map((step) => (
        <PlaybookRow key={step.n} step={step} />
      ))}
    </ol>
  );
}

function PlaybookRow({ step }: { step: PlaybookStep }) {
  const [copied, setCopied] = useState(false);
  const Icon = CHANNEL_ICON[step.channel];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(step.script);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <li className="panel rounded-xl2 p-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="display grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line-2 bg-bg-2 text-lg tabular-nums text-fg">
          {step.n}
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-fg">{step.title}</h4>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <span className={cn("mono-caps inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5", CHANNEL_TONE[step.channel])}>
              <Icon className="h-3 w-3" aria-hidden />
              {step.channel}
            </span>
            <span className="text-[11px] text-dim">{step.timing}</span>
          </div>
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted">{step.detail}</p>
      <div className="mt-3 rounded-md border border-line bg-bg-2/60 p-3">
        <div className="flex items-start justify-between gap-3">
          <p className="serif-italic text-sm leading-relaxed text-fg">&ldquo;{step.script}&rdquo;</p>
          <button
            type="button"
            onClick={copy}
            aria-label={`Copy script for step ${step.n}`}
            className="shrink-0 rounded-md border border-line-2 bg-white/5 p-1.5 text-muted transition-colors hover:text-cyan"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
          </button>
        </div>
      </div>
    </li>
  );
}
