import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui";
import { cn } from "@/lib/utils";

/** Serif-italic accent inside a display headline (the `.display` class uppercases; `.serif-italic` resets it). */
export function Accent({ children, tone = "gold", className }: { children: ReactNode; tone?: "gold" | "cyan" | "ember" | "fg"; className?: string }) {
  const t = { gold: "text-gold", cyan: "text-cyan", ember: "text-ember", fg: "text-fg" }[tone];
  return <span className={cn("serif-italic", t, className)}>{children}</span>;
}

export function PageHero({
  eyebrow,
  title,
  sub,
  children,
  align = "left",
  tone = "muted",
  meta,
  className,
  compact,
}: {
  eyebrow: string;
  title: ReactNode;
  sub?: ReactNode;
  children?: ReactNode;
  align?: "left" | "center";
  tone?: "muted" | "cyan" | "gold" | "ember";
  meta?: ReactNode;
  className?: string;
  compact?: boolean;
}) {
  const center = align === "center";
  return (
    <section className={cn("relative overflow-hidden px-5 md:px-10", compact ? "pb-12 pt-28 md:pt-36" : "pb-16 pt-32 md:pb-20 md:pt-44", className)}>
      <div
        aria-hidden
        className="grid-bg pointer-events-none absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_at_top,black_10%,transparent_65%)]"
      />
      <div className={cn("relative mx-auto max-w-6xl", center && "text-center")}>
        <Eyebrow tone={tone} className="mb-6">
          {eyebrow}
        </Eyebrow>
        <h1 className={cn("display leading-[0.9]", compact ? "text-[clamp(2.75rem,7vw,5.5rem)]" : "text-[clamp(3.25rem,8.5vw,7.5rem)]")}>{title}</h1>
        {sub ? <p className={cn("mt-7 max-w-2xl text-lg leading-relaxed text-muted md:text-xl", center && "mx-auto")}>{sub}</p> : null}
        {children ? <div className={cn("mt-10 flex flex-wrap items-center gap-4", center && "justify-center")}>{children}</div> : null}
        {meta ? <div className={cn("mono-caps mt-6 text-[10px] text-dim", center && "justify-center")}>{meta}</div> : null}
      </div>
    </section>
  );
}
