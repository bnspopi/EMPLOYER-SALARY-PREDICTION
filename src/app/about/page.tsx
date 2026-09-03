import type { Metadata } from "next";
import { ShieldCheck, Cpu, LineChart, Globe } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { PageHero, Accent } from "@/components/marketing/PageHero";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { StatStrip } from "@/components/marketing/StatStrip";
import { Reveal } from "@/components/marketing/Reveal";
import { CtaBand } from "@/components/marketing/CtaBand";
import { Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "About",
  description:
    "PayLens brings transparency to salary negotiations. We price your real profile against live market data across the US, Canada and the UK — privately, in your browser.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  {
    icon: <LineChart size={20} />,
    title: "Priced on evidence",
    body: "We read your actual skills, scope and location and price them against vacancies that publish a real salary — not crowd-sourced averages for a job title.",
  },
  {
    icon: <Cpu size={20} />,
    title: "Two models, one space",
    body: "A parsing model turns a resume or job description into structured attributes; a pricing model maps those attributes to what the current market pays.",
  },
  {
    icon: <Globe size={20} />,
    title: "Three markets, city-deep",
    body: "The US, Canada and the UK, with metro-level pricing and per-country currency, so San Francisco, Toronto and London are each priced on their own terms.",
  },
  {
    icon: <ShieldCheck size={20} />,
    title: "Private by default",
    body: "Your resume stays in your browser. Contact details are stripped before analysis, nothing is sold, and you can delete everything in one click.",
  },
];

const PRINCIPLES = [
  {
    n: "01",
    title: "Transparency over averages",
    body: "Salary negotiations are lopsided because one side has data and the other has a rumour. We hand the individual a defensible range and the specific levers that move it.",
  },
  {
    n: "02",
    title: "Skills, not titles",
    body: "A title is a poor predictor of pay — two senior PMs can be sixty thousand dollars apart. We price the profile underneath the title, so the number describes you.",
  },
  {
    n: "03",
    title: "Actionable, not just informative",
    body: "A benchmark that only tells you the market median is a dead end. Every estimate comes with the improvements, certifications and rewrites that would raise it.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About PayLens"
        title={
          <>
            Bring transparency to
            <br />
            salary <Accent tone="gold">negotiations</Accent>.
          </>
        }
        sub="PayLens exists to close the information gap between the people who set pay and the people who earn it. Upload a resume, see your real worth, and act on it."
        tone="cyan"
        compact
      />

      <Section className="pb-16" wide>
        <Reveal>
          <StatStrip items={[...BRAND.stats]} />
        </Reveal>
      </Section>

      {/* Mission */}
      <Section className="py-16">
        <div className="mx-auto max-w-3xl space-y-5 text-lg leading-relaxed text-muted">
          <p>
            <span className="text-fg">Our mission is simple:</span> make it as easy to price a career as it is to price a
            flight. For most people, the single largest financial decision of the year — what to earn — is made with the
            worst information. We think that&apos;s backwards.
          </p>
          <p>
            So we built a system that reads your resume the way an experienced recruiter would, extracts the skills and
            scope that actually move pay, and compares the resulting profile against millions of live vacancies with known
            salaries. The output isn&apos;t a crowd average — it&apos;s a floor, a median and a ceiling for your exact
            profile, plus the concrete changes that would lift it.
          </p>
        </div>
      </Section>

      {/* Values */}
      <Section className="py-16" wide>
        <SectionHeading
          eyebrow="How it works"
          title={
            <>
              Machine learning,
              <br />
              <Accent tone="cyan">grounded</Accent> in real pay.
            </>
          }
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.05}>
              <div className="h-full rounded-xl2 border border-line bg-panel p-6">
                <div className="mb-4 inline-grid h-11 w-11 place-items-center rounded-md bg-cyan/10 text-cyan">{v.icon}</div>
                <h3 className="text-base font-semibold text-fg">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{v.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Principles */}
      <Section className="py-16">
        <SectionHeading eyebrow="What we believe" title="Principles" />
        <div className="divide-y divide-line border-y border-line">
          {PRINCIPLES.map((p) => (
            <Reveal key={p.n}>
              <div className="grid gap-4 py-8 md:grid-cols-[80px_1fr]">
                <span className="display text-4xl text-gold tabular-nums">{p.n}</span>
                <div>
                  <h3 className="text-xl font-semibold text-fg">{p.title}</h3>
                  <p className="mt-2 max-w-2xl text-muted">{p.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Coverage / not in scope */}
      <Section className="pb-24 pt-8">
        <div className="mx-auto max-w-3xl rounded-xl2 border border-line bg-panel p-6 md:p-8">
          <div className="eyebrow mb-4 text-gold">Honest about scope</div>
          <p className="text-muted">
            PayLens covers the United States, Canada and the United Kingdom. We&apos;re not a per-company levels database and
            not an auto-apply bot — we&apos;re a focused set of career-intelligence tools built around one honest number.
            When we don&apos;t have enough live data to price something reliably, we say so rather than inventing a figure.
          </p>
        </div>
      </Section>

      <CtaBand
        eyebrow="Start for free"
        title={
          <>
            See what you&apos;re
            <br />
            <Accent tone="gold">actually</Accent> worth.
          </>
        }
      />
    </>
  );
}
