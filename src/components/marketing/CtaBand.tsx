import Image from "next/image";
import type { ReactNode } from "react";
import { Button, Eyebrow } from "@/components/ui";
import { Accent } from "./PageHero";

export function CtaBand({
  eyebrow = "Start for free",
  title,
  sub = "Upload your resume – get a free analysis, no payment required.",
  primary = { href: "/analyze", label: "Try it free →" },
  secondary,
  meta = "US, Canada & UK · No credit card · Start for free",
}: {
  eyebrow?: string;
  title?: ReactNode;
  sub?: ReactNode;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
  meta?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-t border-white/5 px-5 py-28 md:px-10 md:py-40">
      <Image src="/images/studio-backdrop.jpg" alt="" fill priority={false} sizes="100vw" className="pointer-events-none select-none object-cover opacity-25" />
      <div aria-hidden className="vignette absolute inset-0" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-bg via-transparent to-bg" />
      <div className="relative mx-auto max-w-6xl text-center">
        <Eyebrow tone="ember" className="mb-6">
          {eyebrow}
        </Eyebrow>
        <h2 className="display text-[clamp(3.5rem,10vw,9rem)] leading-[0.88]">
          {title ?? (
            <>
              Stop guessing.
              <br />
              Start <Accent tone="gold">knowing</Accent>.
            </>
          )}
        </h2>
        {sub ? <p className="mx-auto mt-7 max-w-xl text-lg text-muted">{sub}</p> : null}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button href={primary.href} variant="ember" size="lg">
            {primary.label}
          </Button>
          {secondary ? (
            <Button href={secondary.href} variant="outline" size="lg">
              {secondary.label}
            </Button>
          ) : null}
        </div>
        {meta ? <p className="mono-caps mt-8 text-[10px] text-dim">{meta}</p> : null}
      </div>
    </section>
  );
}
