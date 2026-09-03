"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Poster } from "./Poster";
import { Reveal } from "./Reveal";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden py-32 md:py-44" aria-label="Stop guessing, start knowing">
      <div className="absolute inset-0 z-0 opacity-30">
        <Poster src="/images/robot-face.webp" alt="" overlay="none" />
        <div className="absolute inset-0 bg-gradient-to-b from-bg via-bg/60 to-bg" />
      </div>
      <div className="relative z-10 mx-auto max-w-4xl px-5 text-center">
        <Reveal>
          <h2 className="display text-6xl leading-[0.9] md:text-8xl">
            Stop guessing.
            <br />
            Start <span className="serif-italic text-cyan">knowing</span>.
          </h2>
          <div className="mt-10 flex justify-center">
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 rounded-md bg-fg px-8 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-bg transition-all hover:bg-white hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
            >
              Try it free <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <p className="mono-caps mt-6 text-dim">US, Canada &amp; UK · No credit card · Start for free</p>
        </Reveal>
      </div>
    </section>
  );
}
