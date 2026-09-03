"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section, Eyebrow } from "@/components/ui";
import { Reveal } from "./Reveal";
import { FIXES_LINES } from "./data";

export function FixesWithYou() {
  return (
    <Section className="py-24 md:py-28">
      <Reveal className="text-center">
        <Eyebrow tone="ember" className="justify-center">It doesn&apos;t just diagnose.</Eyebrow>
        <h2 className="display mx-auto mt-3 max-w-3xl text-5xl md:text-7xl">
          It fixes it <span className="serif-italic text-ember">with you</span>.
        </h2>
      </Reveal>
      <div className="mx-auto mt-12 flex max-w-2xl flex-col divide-y divide-line">
        {FIXES_LINES.map((line, i) => (
          <Reveal as="div" key={line} delay={i * 0.1} className="flex items-center gap-4 py-5">
            <span className="display text-2xl text-dim tabular-nums">{String(i + 1).padStart(2, "0")}</span>
            <span className="text-lg text-fg">{line}</span>
          </Reveal>
        ))}
      </div>
      <Reveal className="mt-12 text-center">
        <Link
          href="/analyze"
          className="mono-caps inline-flex items-center gap-2 text-cyan transition-colors hover:text-fg"
        >
          Advice <ArrowRight className="h-3.5 w-3.5" aria-hidden /> Act
        </Link>
      </Reveal>
    </Section>
  );
}
