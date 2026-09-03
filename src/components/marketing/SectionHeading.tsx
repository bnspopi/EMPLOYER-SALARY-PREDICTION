import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  sub,
  tone = "muted",
  align = "left",
  size = "md",
  className,
  id,
}: {
  eyebrow?: string;
  title: ReactNode;
  sub?: ReactNode;
  tone?: "muted" | "cyan" | "gold" | "ember";
  align?: "left" | "center";
  size?: "sm" | "md" | "lg";
  className?: string;
  id?: string;
}) {
  const center = align === "center";
  const sizes = { sm: "text-3xl md:text-4xl", md: "text-4xl md:text-6xl", lg: "text-5xl md:text-7xl" }[size];
  return (
    <div className={cn("mb-10 md:mb-14", center && "text-center", className)}>
      {eyebrow ? (
        <Eyebrow tone={tone} className="mb-4">
          {eyebrow}
        </Eyebrow>
      ) : null}
      <h2 id={id} className={cn("display scroll-mt-28 leading-[0.92]", sizes)}>
        {title}
      </h2>
      {sub ? <p className={cn("mt-5 max-w-2xl text-base leading-relaxed text-muted md:text-lg", center && "mx-auto")}>{sub}</p> : null}
    </div>
  );
}
