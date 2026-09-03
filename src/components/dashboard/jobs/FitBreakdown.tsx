import { Check, Minus, X } from "lucide-react";
import type { FitRequirement, JobFit } from "@/lib/types";
import { cn } from "@/lib/utils";

const ICON = {
  matched: Check,
  partial: Minus,
  gap: X,
} as const;

const TONE = {
  matched: "text-green border-green/30 bg-green/10",
  partial: "text-amber border-amber/30 bg-amber/10",
  gap: "text-red border-red/30 bg-red/10",
} as const;

const STATUS_LABEL = { matched: "Matched", partial: "Partial", gap: "Gap" } as const;

function Row({ req }: { req: FitRequirement }) {
  const Icon = ICON[req.status];
  return (
    <li className="flex items-start gap-3 py-2">
      <span
        className={cn("mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border", TONE[req.status])}
        aria-label={STATUS_LABEL[req.status]}
      >
        <Icon className="h-3 w-3" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block text-sm leading-snug text-fg">{req.requirement}</span>
        {req.note ? <span className="mt-0.5 block text-xs text-dim">{req.note}</span> : null}
      </span>
    </li>
  );
}

/** Matched ✓ / partial ~ / gap ✗ requirement matrix for a job fit. */
export function FitBreakdown({ fit, className }: { fit: JobFit; className?: string }) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5 text-green">
          <Check className="h-3.5 w-3.5" aria-hidden /> {fit.matched} matched
        </span>
        <span className="inline-flex items-center gap-1.5 text-amber">
          <Minus className="h-3.5 w-3.5" aria-hidden /> {fit.partial} partial
        </span>
        <span className="inline-flex items-center gap-1.5 text-red">
          <X className="h-3.5 w-3.5" aria-hidden /> {fit.gaps} gap{fit.gaps === 1 ? "" : "s"}
        </span>
      </div>
      <ul className="divide-y divide-line/60">
        {fit.requirements.map((req, i) => (
          <Row key={`${req.requirement}-${i}`} req={req} />
        ))}
      </ul>
    </div>
  );
}
