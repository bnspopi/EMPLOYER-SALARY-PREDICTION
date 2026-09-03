"use client";
import { Section } from "@/components/ui";
import { CountUp } from "./CountUp";
import { STATS_STRIP } from "./data";

export function StatsStrip() {
  return (
    <Section wide className="border-y border-line py-10">
      <ul className="grid grid-cols-2 gap-8 md:grid-cols-5">
        {STATS_STRIP.map((s) => (
          <li key={s.label} className="text-center md:text-left">
            <div className="display text-4xl leading-none text-fg tabular-nums md:text-5xl">
              <CountUp value={s.value} suffix={s.suffix} decimals={s.decimals ?? 0} />
            </div>
            <div className="mono-caps mt-2 text-dim">{s.label}</div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
