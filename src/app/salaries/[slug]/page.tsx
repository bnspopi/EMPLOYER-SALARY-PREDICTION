import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, TrendingUp } from "lucide-react";
import { listGuides, getGuide } from "@/lib/engine";
import type { SalaryGuide } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { formatDate } from "@/components/marketing/format";
import { Accent } from "@/components/marketing/PageHero";
import { DocLayout, DocSection, type TocItem } from "@/components/marketing/DocLayout";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";
import { JsonLd } from "@/components/marketing/JsonLd";
import { CtaBand } from "@/components/marketing/CtaBand";
import { Section, Eyebrow, Badge, Button } from "@/components/ui";
import { BRAND } from "@/lib/brand";

export function generateStaticParams() {
  return listGuides().map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return { title: "Salary guide not found" };
  return {
    title: guide.title,
    description: guide.summary,
    alternates: { canonical: `/salaries/${guide.slug}` },
    openGraph: { title: `${guide.title} | ${BRAND.name}`, description: guide.summary, type: "article" },
  };
}

const TOC: TocItem[] = [
  { id: "what-they-do", title: "What they do" },
  { id: "salary-by-level", title: "Salary by level" },
  { id: "salary-by-city", title: "Salary by city" },
  { id: "career-path", title: "Career path" },
  { id: "day-to-day", title: "Day-to-day" },
  { id: "specializations", title: "Specializations" },
  { id: "whos-hiring", title: "Who's hiring" },
  { id: "faq", title: "FAQ" },
  { id: "further-reading", title: "Further reading" },
];

function relatedFor(guide: SalaryGuide): SalaryGuide[] {
  const preferred = guide.furtherReading ? getGuide(guide.furtherReading) : undefined;
  const rest = listGuides().filter((g) => g.slug !== guide.slug && g.slug !== preferred?.slug);
  return [...(preferred ? [preferred] : []), ...rest].slice(0, 3);
}

function cell(n: number | null, currency: "USD" = "USD") {
  return n == null ? <span className="text-dim">—</span> : <span className="tabular-nums text-fg">{formatMoney(n, currency, { compact: true })}</span>;
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const related = relatedFor(guide);
  const stats = [
    { label: "National median", value: formatMoney(guide.nationalMedian, "USD", { compact: true }) },
    { label: "Entry → Lead", value: `${formatMoney(guide.entryMedian, "USD", { compact: true })} – ${formatMoney(guide.leadMedian, "USD", { compact: true })}` },
    { label: "Active roles", value: guide.activeRoles.toLocaleString("en-US") },
    { label: "Supply / demand", value: `${guide.supplyDemandRatio}:1` },
  ];

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: guide.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <JsonLd data={faqLd} />

      {/* Stat header */}
      <header className="relative overflow-hidden px-5 pb-12 pt-32 md:px-10 md:pt-40">
        <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_top,black_10%,transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Link href="/salaries" className="mono-caps text-[10px] text-dim hover:text-fg">
              ← Salary guides
            </Link>
            <Badge tone="cyan">{guide.marketLabel}</Badge>
            <time dateTime={guide.date} className="mono-caps text-[10px] text-dim">
              Updated {formatDate(guide.date)}
            </time>
          </div>
          <h1 className="display text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.9]">{guide.title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{guide.summary}</p>

          <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl2 border border-line bg-line lg:grid-cols-4 [&>div]:bg-panel">
            {stats.map((s) => (
              <div key={s.label} className="px-5 py-5">
                <dd className="display text-3xl leading-none text-cyan tabular-nums md:text-4xl">{s.value}</dd>
                <dt className="eyebrow mt-2.5">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </header>

      {/* Intro */}
      <Section className="pb-14" wide>
        <div className="mx-auto max-w-3xl space-y-4 text-[15px] leading-relaxed text-muted">
          {guide.intro.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <p className="flex items-start gap-2 rounded-md border border-line bg-panel/60 p-4 text-sm text-dim">
            <TrendingUp size={15} className="mt-0.5 shrink-0 text-cyan" />
            Figures are US national base salaries in USD, priced against live vacancies with published pay and refreshed daily. Your own number depends on your exact skills and city — {" "}
            <Link href="/analyze" className="text-cyan hover:underline">
              analyze your resume
            </Link>{" "}
            for a personal range.
          </p>
        </div>
      </Section>

      <DocLayout toc={TOC}>
        <DocSection id="what-they-do" title="What they do" number={1}>
          <p>{guide.whatTheyDo}</p>
        </DocSection>

        <DocSection id="salary-by-level" title="Salary by level" number={2}>
          <p>
            Medians rise sharply with scope. Below, each level shows its median plus the P25–P75 band that most offers fall inside.
          </p>
          <div className="not-prose grid gap-4 sm:grid-cols-2">
            {guide.levels.map((lv) => (
              <div key={lv.level} className="rounded-xl2 border border-line bg-panel p-5">
                <div className="flex items-baseline justify-between">
                  <span className="mono-caps text-[10px] text-gold">{lv.level}</span>
                  <span className="mono-caps text-[10px] text-dim">{lv.years}</span>
                </div>
                <div className="mt-2 display text-4xl leading-none text-fg tabular-nums">{formatMoney(lv.median, "USD", { compact: true })}</div>
                <div className="mt-1 text-xs text-muted tabular-nums">
                  P25 {formatMoney(lv.p25, "USD", { compact: true })} · P75 {formatMoney(lv.p75, "USD", { compact: true })}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted">{lv.description}</p>
              </div>
            ))}
          </div>
          <div className="not-prose mt-6 overflow-x-auto rounded-xl2 border border-line">
            <table className="w-full min-w-[480px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line bg-panel text-left">
                  <th scope="col" className="px-4 py-3 font-medium text-muted">Level</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium text-muted">Median</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium text-muted">P25</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium text-muted">P75</th>
                </tr>
              </thead>
              <tbody>
                {guide.levels.map((lv) => (
                  <tr key={lv.level} className="border-b border-line/60 last:border-0">
                    <th scope="row" className="px-4 py-3 text-left font-normal text-fg">{lv.level}</th>
                    <td className="px-4 py-3 text-right tabular-nums text-cyan">{formatMoney(lv.median, "USD")}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted">{formatMoney(lv.p25, "USD")}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted">{formatMoney(lv.p75, "USD")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DocSection>

        <DocSection id="salary-by-city" title="Salary by city" number={3}>
          <p>The same role re-prices by metro. A dash means too few live postings at that level to publish a reliable figure.</p>
          <div className="not-prose overflow-x-auto rounded-xl2 border border-line">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line bg-panel text-left">
                  <th scope="col" className="px-4 py-3 font-medium text-muted">City</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium text-muted">Entry</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium text-muted">Mid</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium text-muted">Senior</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium text-muted">Lead</th>
                </tr>
              </thead>
              <tbody>
                {guide.cities.map((c) => (
                  <tr key={c.city} className="border-b border-line/60 last:border-0">
                    <th scope="row" className="px-4 py-3 text-left font-normal text-fg">{c.city}</th>
                    <td className="px-4 py-3 text-right">{cell(c.entry)}</td>
                    <td className="px-4 py-3 text-right">{cell(c.mid)}</td>
                    <td className="px-4 py-3 text-right">{cell(c.senior)}</td>
                    <td className="px-4 py-3 text-right">{cell(c.lead)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DocSection>

        <DocSection id="career-path" title="Career path by level" number={4}>
          <p>How responsibility — and pay — compounds as you move up the ladder.</p>
          <ol className="not-prose space-y-3">
            {guide.levels.map((lv, i) => (
              <li key={lv.level} className="flex gap-4 rounded-xl2 border border-line bg-panel p-5">
                <span className="mono-caps mt-0.5 text-[11px] text-gold tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <span className="font-semibold text-fg">{lv.level}</span>
                    <span className="mono-caps text-[10px] text-dim">{lv.years}</span>
                    <span className="text-sm text-cyan tabular-nums">{formatMoney(lv.median, "USD", { compact: true })}</span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{lv.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </DocSection>

        <DocSection id="day-to-day" title="Day-to-day by level" number={5}>
          <div className="not-prose grid gap-4 sm:grid-cols-2">
            {guide.levels.map((lv) => (
              <div key={lv.level} className="rounded-xl2 border border-line bg-panel p-5">
                <div className="mono-caps mb-2 text-[10px] text-cyan">{lv.level}</div>
                <p className="text-sm leading-relaxed text-muted">{lv.dayToDay}</p>
              </div>
            ))}
          </div>
        </DocSection>

        <DocSection id="specializations" title="Types & specializations" number={6}>
          <div className="not-prose grid gap-4 sm:grid-cols-2">
            {guide.types.map((t) => (
              <div key={t.name} className="rounded-xl2 border border-line bg-panel p-5">
                <h3 className="font-semibold text-fg">{t.name}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{t.description}</p>
              </div>
            ))}
          </div>
        </DocSection>

        <DocSection id="whos-hiring" title="Who's hiring" number={7}>
          <p>Employers with the most active openings for this role right now.</p>
          <div className="not-prose overflow-x-auto rounded-xl2 border border-line">
            <table className="w-full min-w-[360px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line bg-panel text-left">
                  <th scope="col" className="px-4 py-3 font-medium text-muted">Employer</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium text-muted">Open roles</th>
                </tr>
              </thead>
              <tbody>
                {guide.employers.map((e) => (
                  <tr key={e.company} className="border-b border-line/60 last:border-0">
                    <th scope="row" className="px-4 py-3 text-left font-normal text-fg">{e.company}</th>
                    <td className="px-4 py-3 text-right tabular-nums text-muted">{e.openings.toLocaleString("en-US")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DocSection>

        <DocSection id="faq" title="Frequently asked" number={8}>
          <div className="not-prose">
            <FaqAccordion items={guide.faq} />
          </div>
        </DocSection>

        <DocSection id="further-reading" title="Further reading" number={9}>
          <div className="not-prose grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <Link key={r.slug} href={`/salaries/${r.slug}`} className="group flex flex-col rounded-xl2 border border-line bg-panel p-5 transition-colors hover:border-line-2">
                <div className="mb-3 flex items-center justify-between">
                  <Eyebrow tone="gold">Guide</Eyebrow>
                  <ArrowUpRight size={16} className="text-dim transition-colors group-hover:text-cyan" />
                </div>
                <h3 className="text-base font-semibold leading-snug text-fg">{r.title}</h3>
                <p className="mt-2 text-sm text-muted tabular-nums">Median {formatMoney(r.nationalMedian, "USD", { compact: true })}</p>
              </Link>
            ))}
          </div>
        </DocSection>

        <div className="not-prose rounded-xl2 border border-gold/30 bg-panel p-6 shadow-glow-gold">
          <h3 className="display text-2xl">Price your own resume</h3>
          <p className="mt-2 max-w-md text-sm text-muted">
            This guide is the market. Get a range for your exact skills, level and city in under a minute.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button href="/analyze" variant="gold" size="md">
              Analyze my resume →
            </Button>
            <Button href="/pricing" variant="outline" size="md">
              See pricing
            </Button>
          </div>
        </div>
      </DocLayout>

      <CtaBand
        eyebrow="Your number, not the average"
        title={
          <>
            Stop guessing.
            <br />
            Start <Accent tone="gold">knowing</Accent>.
          </>
        }
      />
    </>
  );
}
