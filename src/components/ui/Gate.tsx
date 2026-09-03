"use client";
import { usePlan } from "@/lib/store";
import { can, PLAN_META, requiredPlan, type Feature } from "@/lib/plans";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

/**
 * Renders children when the current plan unlocks `feature`; otherwise shows a blurred preview with an upgrade card.
 */
export function Gate({ feature, children, className, compact }: { feature: Feature; children: React.ReactNode; className?: string; compact?: boolean }) {
  const plan = usePlan();
  if (can(plan, feature)) return <>{children}</>;
  const need = requiredPlan(feature);
  const meta = PLAN_META[need];
  return (
    <div className={cn("relative overflow-hidden rounded-xl2", className)}>
      <div aria-hidden className="pointer-events-none select-none blur-[6px] opacity-60">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-bg/40 p-4">
        <div className={cn("glass rounded-xl2 text-center", compact ? "p-4 max-w-xs" : "p-6 max-w-sm")}>
          <div className="eyebrow mb-2 text-gold">{meta.name} feature</div>
          <p className={cn("text-fg", compact ? "text-sm" : "text-base")}>
            Upgrade to <span className="font-semibold">{meta.name}</span> (${meta.priceMonthly}/mo) to unlock this.
          </p>
          <Button href="/pricing" variant="gold" size="sm" className="mt-4">
            Upgrade to {meta.name}
          </Button>
        </div>
      </div>
    </div>
  );
}
