import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-white/6", className)} aria-hidden />;
}

/** Full-width skeleton shown until the persisted store has hydrated (avoids hydration mismatches). */
export function DashSkeleton({ rows = 3, label = "Loading your workspace" }: { rows?: number; label?: string }) {
  return (
    <div className="space-y-4" role="status" aria-live="polite" aria-label={label}>
      <div className="panel rounded-xl2 p-6">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-4 h-12 w-56" />
        <Skeleton className="mt-3 h-3 w-72" />
        <Skeleton className="mt-6 h-3 w-full" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="panel rounded-xl2 p-5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-8 w-24" />
          </div>
        ))}
      </div>
      {Array.from({ length: Math.max(0, rows - 1) }).map((_, i) => (
        <div key={i} className="panel rounded-xl2 p-6">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="mt-4 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-5/6" />
          <Skeleton className="mt-2 h-3 w-2/3" />
        </div>
      ))}
      <span className="sr-only">{label}</span>
    </div>
  );
}
