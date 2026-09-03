"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Section, Eyebrow } from "@/components/ui";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Reveal } from "./Reveal";
import { TiltCard } from "./TiltCard";
import { INTENT_CARDS } from "./data";

export function IntentGrid() {
  const reduced = useReducedMotion();
  return (
    <Section wide className="py-24 md:py-32">
      <Reveal>
        <Eyebrow tone="cyan">Start here</Eyebrow>
        <h2 className="display mt-3 text-5xl md:text-7xl">Where are you right now?</h2>
      </Reveal>
      <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {INTENT_CARDS.map((c, i) => {
          const Icon = c.icon;
          return (
            <Reveal key={c.eyebrow} delay={i * 0.08}>
              <TiltCard disabled={reduced} className="h-full">
                <Link
                  href={c.href}
                  className="group panel flex h-full flex-col justify-between rounded-xl2 p-6 transition-colors hover:border-line-2 hover:shadow-panel"
                >
                  <div className="flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-lg border border-line-2 bg-panel-2 text-cyan">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <ArrowUpRight className="h-5 w-5 text-dim transition-colors group-hover:text-cyan" aria-hidden />
                  </div>
                  <div className="mt-10">
                    <div className="mono-caps text-cyan">{c.eyebrow}</div>
                    <p className="mt-2 text-lg font-medium leading-snug text-fg">{c.headline}</p>
                    <span className="mono-caps mt-5 inline-flex items-center gap-1.5 text-muted transition-colors group-hover:text-fg">
                      {c.cta}
                    </span>
                  </div>
                </Link>
              </TiltCard>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
