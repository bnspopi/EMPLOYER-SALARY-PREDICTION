import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  eyebrow = "Nothing here yet",
  title,
  body,
  cta,
  secondary,
  className,
}: {
  icon?: LucideIcon;
  eyebrow?: string;
  title: string;
  body: string;
  cta?: { href: string; label: string };
  secondary?: { href: string; label: string };
  className?: string;
}) {
  return (
    <div className={cn("panel grid-bg relative overflow-hidden rounded-xl2 px-6 py-14 text-center md:py-20", className)}>
      <div className="vignette pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-xl">
        {Icon ? (
          <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-full border border-cyan/30 bg-cyan/10 text-cyan shadow-glow-cyan">
            <Icon className="h-6 w-6" aria-hidden />
          </div>
        ) : null}
        <div className="eyebrow mb-3 text-cyan">{eyebrow}</div>
        <h2 className="display text-4xl md:text-5xl">{title}</h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted">{body}</p>
        {cta || secondary ? (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {cta ? (
              <Button href={cta.href} variant="ember">
                {cta.label}
              </Button>
            ) : null}
            {secondary ? (
              <Button href={secondary.href} variant="outline">
                {secondary.label}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
