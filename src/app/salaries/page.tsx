import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { listGuides } from "@/lib/engine";
import { formatMoney } from "@/lib/format";
import { formatDate } from "@/components/marketing/format";
import { PageHero, Accent } from "@/components/marketing/PageHero";
import { Reveal } from "@/components/marketing/Reveal";
import { CtaBand } from "@/components/marketing/CtaBand";
import { Section, Badge } from "@/components/ui";

export const metadata: Metadata = {
  title: "Salary guides",
  description:
    "In-depth 2026 salary guides for 18 roles across the US, Canada and UK — national medians, level and city tables, career paths, who's hiring and FAQs, priced against live market data.",
  alternates: { canonical: "/salaries" },
};

export default function SalariesPage() {
  const guides = listGuides();
  return (
    <>
      <PageHero
        eyebrow="Salary guides · 2026"
        title={
          <>
            What every role is <Accent tone="gold">really</Accent> worth.
          </>
        }
        sub="Eighteen deep-dive guides built from live market data — medians by level and city, career paths, specializations and who's hiring."
        tone="cyan"
        compact
      />
      <Section className="pb-20" wide>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((g, i) => (
            <Reveal key={g.slug} delay={(i % 3) * 0.05}>
              <Link
                href={`/salaries/${g.slug}`}
                className="group flex h-full flex-col rounded-xl2 border border-line bg-panel p-6 transition-colors hover:border-line-2"
              >
                <div className="mb-4 flex items-center justify-between">
                  <Badge tone="cyan">{g.marketLabel}</Badge>
                  <ArrowUpRight size={18} className="text-dim transition-colors group-hover:text-cyan" />
                </div>
                <h2 className="text-lg font-semibold leading-snug text-fg">{g.title}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{g.summary}</p>
                <div className="mt-5 flex items-end justify-between border-t border-line pt-4">
                  <div>
                    <div className="mono-caps text-[9px] text-dim">National median</div>
                    <div className="display text-3xl leading-none text-cyan tabular-nums">{formatMoney(g.nationalMedian, "USD", { compact: true })}</div>
                  </div>
                  <time dateTime={g.date} className="mono-caps text-[10px] text-dim">
                    {formatDate(g.date, { month: "short" })}
                  </time>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>
      <CtaBand
        eyebrow="Your number, not the average"
        title={
          <>
            Guides show the market.
            <br />
            We price <Accent tone="gold">you</Accent>.
          </>
        }
        sub="Upload your resume and get a salary range for your exact skills, level and city — not a title average."
        primary={{ href: "/analyze", label: "Analyze my resume →" }}
        secondary={{ href: "/pricing", label: "See pricing" }}
      />
    </>
  );
}
