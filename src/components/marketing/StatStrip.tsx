import { cn } from "@/lib/utils";

export function StatStrip({ items, className, tone = "fg" }: { items: { value: string; label: string }[]; className?: string; tone?: "fg" | "cyan" | "gold" }) {
  const t = { fg: "text-fg", cyan: "text-cyan", gold: "text-gold" }[tone];
  return (
    <dl className={cn("grid grid-cols-2 gap-px overflow-hidden rounded-xl2 border border-line bg-line md:grid-cols-4 lg:grid-cols-5 [&>div]:bg-panel", items.length === 4 && "lg:grid-cols-4", className)}>
      {items.map((s) => (
        <div key={s.label} className="px-5 py-6">
          <dd className={cn("display text-4xl leading-none tabular-nums md:text-5xl", t)}>{s.value}</dd>
          <dt className="eyebrow mt-3">{s.label}</dt>
        </div>
      ))}
    </dl>
  );
}
