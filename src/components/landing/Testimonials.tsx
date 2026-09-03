"use client";
import { Section, Eyebrow } from "@/components/ui";
import { Reveal } from "./Reveal";
import { LANDING_QUOTES } from "./data";

export function Testimonials() {
  return (
    <Section className="border-t border-line py-24 md:py-28">
      <Reveal className="text-center">
        <Eyebrow tone="gold" className="justify-center">From Product Hunt</Eyebrow>
      </Reveal>
      <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2">
        {LANDING_QUOTES.map((q, i) => (
          <Reveal key={q.name} delay={i * 0.1}>
            <figure className="panel flex h-full flex-col justify-between rounded-xl2 p-7">
              <blockquote className="serif-italic text-2xl leading-snug text-fg">&ldquo;{q.quote}&rdquo;</blockquote>
              <figcaption className="mt-6">
                <div className="font-semibold text-fg">{q.name}</div>
                <div className="mono-caps text-dim">{q.role}</div>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
