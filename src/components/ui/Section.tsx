import { cn } from "@/lib/utils";

export function Section({ id, className, children, wide }: { id?: string; className?: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <section id={id} className={cn("relative px-5 md:px-10", className)}>
      <div className={cn("mx-auto", wide ? "max-w-[1400px]" : "max-w-6xl")}>{children}</div>
    </section>
  );
}

export function Eyebrow({ children, className, tone = "muted" }: { children: React.ReactNode; className?: string; tone?: "muted" | "cyan" | "gold" | "ember" }) {
  const t = { muted: "text-muted", cyan: "text-cyan", gold: "text-gold", ember: "text-ember" }[tone];
  return <div className={cn("eyebrow", t, className)}>{children}</div>;
}
