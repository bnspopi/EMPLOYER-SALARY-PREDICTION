"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Section, Eyebrow } from "@/components/ui";
import { Reveal } from "./Reveal";
import { HOW_STEPS } from "./data";

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <Section wide className="py-24 md:py-32">
      <Reveal>
        <Eyebrow tone="cyan">How it works</Eyebrow>
        <h2 className="display mt-3 text-5xl md:text-7xl">Three steps. One number.</h2>
      </Reveal>

      <div ref={ref} className="relative mt-16">
        {/* draw-on-scroll line */}
        <div className="absolute left-0 right-0 top-6 hidden h-px bg-line md:block">
          <motion.div style={{ scaleX, transformOrigin: "left" }} className="h-px w-full bg-cyan shadow-glow-cyan" />
        </div>
        <ol className="grid gap-10 md:grid-cols-3">
          {HOW_STEPS.map((s, i) => (
            <Reveal as="li" key={s.index} delay={i * 0.1} className="relative">
              <span className="relative z-10 grid h-12 w-12 place-items-center rounded-full border border-line-2 bg-bg text-cyan display text-xl">
                {s.index}
              </span>
              <div className="mono-caps mt-5 text-gold">{s.timing}</div>
              <h3 className="mt-2 text-xl font-semibold text-fg">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </Section>
  );
}
