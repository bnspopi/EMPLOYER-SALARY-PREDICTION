import type { Metadata } from "next";
import { PageHero, Accent } from "@/components/marketing/PageHero";
import { CtaBand } from "@/components/marketing/CtaBand";
import { Section } from "@/components/ui";
import { PricingClient } from "./PricingClient";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple pricing for PayLens. Curious is free forever; Explorer unlocks exact medians, gap analysis and negotiation briefs; Hunter adds the pipeline, offer tabs and AI chat. Save 17% annually.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Plans · US · CA · UK"
        title={
          <>
            Pay for <Accent tone="gold">clarity</Accent>,
            <br />
            not guesses.
          </>
        }
        sub="Start free and see your real number. Upgrade when you want exact medians, negotiation briefs, offer analysis and the full job-search toolkit."
        align="center"
        tone="cyan"
        compact
      />
      <Section className="pb-24" wide>
        <PricingClient />
      </Section>
      <CtaBand
        eyebrow="Start for free"
        title={
          <>
            Know your number
            <br />
            before you <Accent tone="gold">pay a cent</Accent>.
          </>
        }
        sub="The free plan gives you a real salary range and market score. No card required."
        primary={{ href: "/analyze", label: "Analyze my resume →" }}
        secondary={{ href: "/for-recruiters", label: "For recruiters" }}
      />
    </>
  );
}
