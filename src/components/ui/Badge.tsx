import { cn } from "@/lib/utils";
import type { Severity } from "@/lib/types";

type Tone = "neutral" | "cyan" | "gold" | "ember" | "green" | "red" | "amber";
const tones: Record<Tone, string> = {
  neutral: "bg-white/5 text-muted border-white/10",
  cyan: "bg-cyan/10 text-cyan border-cyan/30",
  gold: "bg-gold/10 text-gold border-gold/30",
  ember: "bg-ember/10 text-ember border-ember/30",
  green: "bg-green/10 text-green border-green/30",
  red: "bg-red/10 text-red border-red/30",
  amber: "bg-amber/10 text-amber border-amber/30",
};

export function Badge({ tone = "neutral", className, children }: { tone?: Tone; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-sm border px-2 py-0.5 text-[10px] font-semibold tracking-[0.14em] uppercase", tones[tone], className)}>
      {children}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const tone: Tone = severity === "HIGH" ? "red" : severity === "MED" ? "amber" : "neutral";
  return <Badge tone={tone}>{severity}</Badge>;
}
