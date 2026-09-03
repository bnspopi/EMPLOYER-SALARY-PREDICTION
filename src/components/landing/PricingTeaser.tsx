"use client";
import Link from "next/link";
import { Check } from "lucide-react";
import { Section, Eyebrow, Button, Badge } from "@/components/ui";
import { PLAN_META, PLAN_BULLETS } from "@/lib/plans";
import type { Plan } from "@/lib/types";
import { Reveal } from "./Reveal";

const ORDER: Plan[] = ["curious", "explorer", "hunter"];

export function PricingTeaser() {
  return (
    <Section wide className="py-24 md:py-32">
      <Reveal className="text-center">
        <Eyebrow tone="cyan" className="justify-center">Pricing</Eyebrow>
        <h2 className="display mt-3 text-5xl md:text-7xl">Start free. Upgrade when it pays off.</h2>
        <p className="mt-3 text-muted">Annual billing saves 17%.</p>
      </Reveal>

      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {ORDER.map((plan, i) => {
          const meta = PLAN_META[plan];
          const featured = plan === "explorer";
          return (
            <Reveal key={plan} delay={i * 0.1}>
              <div
                className={`panel flex h-full flex-col rounded-xl2 p-7 ${
                  featured ? "border-cyan/40 shadow-glow-cyan" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="display text-3xl">{meta.name}</h3>
                  {featured ? <Badge tone="cyan">Most popular</Badge> : null}
                </div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="display text-5xl tabular-nums">${meta.priceMonthly}</span>
                  <span className="text-muted">/{plan === "curious" ? "forever" : "mo"}</span>
                </div>
                <p className="mono-caps mt-2 text-dim">{meta.tagline}</p>
                <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                  {PLAN_BULLETS[plan].map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-sm text-fg">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan" aria-hidden />
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="mt-7">
                  <Button href="/pricing" variant={featured ? "primary" : "secondary"} className="w-full">
                    {plan === "curious" ? "Get started" : `Choose ${meta.name}`}
                  </Button>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
      <Reveal className="mt-8 text-center">
        <Link href="/for-recruiters" className="mono-caps text-muted transition-colors hover:text-fg">
          Are you a recruiter? Learn how PayLens works for hiring teams →
        </Link>
      </Reveal>
    </Section>
  );
}
