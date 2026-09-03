import type { SkillLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

const LEVEL_CLS: Record<SkillLevel, string> = {
  Expert: "border-cyan/40 bg-cyan/10 text-cyan",
  Advanced: "border-gold/40 bg-gold/10 text-gold",
  General: "border-white/12 bg-white/5 text-fg",
  Inferred: "border-dashed border-white/15 bg-transparent text-muted",
};

/** Compact skill chip. With `level` it takes the level colour; without it, a neutral chip (Curious "skill names" list). */
export function SkillPill({ name, level, suffix, className }: { name: string; level?: SkillLevel; suffix?: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium tracking-wide",
        level ? LEVEL_CLS[level] : "border-white/12 bg-white/5 text-fg",
        className,
      )}
    >
      {level ? <span className={cn("h-1.5 w-1.5 rounded-full", level === "Expert" ? "bg-cyan" : level === "Advanced" ? "bg-gold" : level === "General" ? "bg-fg/60" : "bg-muted/50")} aria-hidden /> : null}
      {name}
      {suffix ? <span className="tabular-nums text-[10px] opacity-70">{suffix}</span> : null}
    </span>
  );
}
