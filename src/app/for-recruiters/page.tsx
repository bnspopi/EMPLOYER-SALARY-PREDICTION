import type { Metadata } from "next";
import { FileSearch, MapPin, Building2, Layers } from "lucide-react";
import { PageHero, Accent } from "@/components/marketing/PageHero";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { Reveal } from "@/components/marketing/Reveal";
import { RangeBars, rangeScale, type RangeRow } from "@/components/marketing/RangeBars";
import { Section, Button } from "@/components/ui";
import { RecruiterClient } from "./RecruiterClient";

export const metadata: Metadata = {
  title: "For recruiters — set competitive salaries",
  description:
    "Analyze any job description and get instant market data: salary bands by city, industry and experience level in one report. 14-day free trial, no credit card required.",
  alternates: { canonical: "/for-recruiters" },
};

const FEATURES = [
  {
    icon: <FileSearch size={20} />,
    title: "Job Description Analysis",
    body: "Paste a JD and get a full salary benchmark in seconds — median, range, required skills and a recommended posting band.",
  },
  {
    icon: <MapPin size={20} />,
    title: "City-Level Data",
    body: "Pricing for SF, NYC, Austin, Seattle and remote, so you set an offer that lands in every market you hire from.",
  },
  {
    icon: <Building2 size={20} />,
    title: "Industry Benchmarks",
    body: "See how Technology, Finance, Healthcare and E-commerce shift the number for the same role and level.",
  },
  {
    icon: <Layers size={20} />,
    title: "Experience Levels",
    body: "Junior, Mid, Senior and Lead bands in a single report — calibrate the whole ladder before you post.",
  },
];

const BY_CITY: RangeRow[] = [
  { label: "San Francisco", min: 120000, max: 150000 },
  { label: "New York", min: 110000, max: 140000 },
  { label: "Austin", min: 95000, max: 125000 },
  { label: "Remote", min: 100000, max: 130000 },
];
const BY_LEVEL: RangeRow[] = [
  { label: "Junior", min: 60000, max: 80000 },
  { label: "Mid-Level", min: 85000, max: 110000 },
  { label: "Senior", min: 120000, max: 150000 },
  { label: "Lead", min: 140000, max: 180000 },
];
const BY_INDUSTRY: RangeRow[] = [
  { label: "Technology", min: 110000, max: 145000 },
  { label: "Finance", min: 105000, max: 140000 },
  { label: "Healthcare", min: 95000, max: 125000 },
  { label: "E-commerce", min: 100000, max: 130000 },
];

export default function ForRecruitersPage() {
  const sampleScale = rangeScale([...BY_CITY, ...BY_LEVEL, ...BY_INDUSTRY]);
  return (
    <>
      <PageHero
        eyebrow="PayLens for hiring teams"
        title={
          <>
            Set competitive salaries
            <br />
            with <Accent tone="gold">confidence</Accent>.
          </>
        }
        sub="Analyze any job description and get instant market data — bands by city, industry and experience level in one report."
        tone="cyan"
        compact
      >
        <Button href="#analyzer" variant="gold" size="lg">
          Analyze job description
        </Button>
        <Button href="/pricing" variant="outline" size="lg">
          View pricing
        </Button>
      </PageHero>

      {/* Feature cards */}
      <Section className="pb-8" wide>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.05}>
              <div className="h-full rounded-xl2 border border-line bg-panel p-6">
                <div className="mb-4 inline-grid h-11 w-11 place-items-center rounded-md bg-cyan/10 text-cyan">{f.icon}</div>
                <h3 className="text-base font-semibold text-fg">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Sample bands */}
      <Section className="py-20" wide>
        <SectionHeading
          eyebrow="Sample market data"
          title={
            <>
              One role, priced <Accent tone="cyan">three ways</Accent>.
            </>
          }
          sub="Every report cross-cuts the same role by location, seniority and industry — so you can see exactly where your offer needs to sit."
        />
        <div className="grid gap-5 lg:grid-cols-3">
          {[
            { title: "By city", rows: BY_CITY, accent: "cyan" as const },
            { title: "By level", rows: BY_LEVEL, accent: "gold" as const },
            { title: "By industry", rows: BY_INDUSTRY, accent: "cyan" as const },
          ].map((b) => (
            <div key={b.title} className="rounded-xl2 border border-line bg-panel p-6">
              <div className="mono-caps mb-5 text-[10px] text-gold">{b.title}</div>
              <RangeBars rows={b.rows} currency="USD" accent={b.accent} scale={sampleScale} labelWidth="w-24" />
            </div>
          ))}
        </div>
      </Section>

      {/* Live analyzer */}
      <Section id="analyzer" className="scroll-mt-24 py-16" wide>
        <SectionHeading
          eyebrow="Live tool"
          title={
            <>
              Benchmark a <Accent tone="gold">real</Accent> job description.
            </>
          }
          sub="Paste a JD, add the title, location and industry, and PayLens returns a full salary benchmark you can print and share."
        />
        <RecruiterClient />
      </Section>

      {/* Trial line */}
      <Section className="pb-28 pt-4" wide>
        <div className="flex flex-col items-center gap-6 rounded-xl2 border border-gold/30 bg-panel px-6 py-12 text-center shadow-glow-gold">
          <div className="eyebrow text-gold">Recruiter track</div>
          <h2 className="display text-4xl md:text-5xl">
            Start hiring at the <Accent tone="gold">right</Accent> number.
          </h2>
          <p className="max-w-lg text-muted">
            Role benchmarking, competitive comp packages and candidate scoring at scale — built for hiring teams.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button href="#analyzer" variant="gold" size="lg">
              Analyze a job description
            </Button>
            <Button href="/contact" variant="outline" size="lg">
              Talk to us
            </Button>
          </div>
          <p className="mono-caps text-[10px] text-dim">14-day free trial • No credit card required</p>
        </div>
      </Section>
    </>
  );
}
