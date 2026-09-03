import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { POSTS } from "@/data/blog";
import type { BlogPost } from "@/data/types";
import { formatDate, readingTime } from "@/components/marketing/format";
import { PageHero, Accent } from "@/components/marketing/PageHero";
import { Reveal } from "@/components/marketing/Reveal";
import { CtaBand } from "@/components/marketing/CtaBand";
import { Section, Badge } from "@/components/ui";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Guides, analytics and market reports on salaries, negotiation, resumes and the changing job market — from the PayLens research team.",
  alternates: { canonical: "/blog" },
};

const TONES: Record<BlogPost["category"], "cyan" | "gold" | "ember" | "neutral"> = {
  Guide: "cyan",
  Analytics: "gold",
  Report: "ember",
  News: "neutral",
};

export default function BlogPage() {
  const posts = [...POSTS].sort((a, b) => (a.date < b.date ? 1 : -1));
  const [featured, ...rest] = posts;

  return (
    <>
      <PageHero
        eyebrow="PayLens journal"
        title={
          <>
            Notes on <Accent tone="gold">pay</Accent> & the market.
          </>
        }
        sub="How salaries are set, how to negotiate them, and what the data says about where the job market is heading."
        tone="cyan"
        compact
      />

      <Section className="pb-20" wide>
        {featured ? (
          <Reveal>
            <Link
              href={`/blog/${featured.slug}`}
              className="group mb-10 grid gap-6 rounded-xl2 border border-line bg-panel p-6 transition-colors hover:border-line-2 md:grid-cols-[1.4fr_1fr] md:p-8"
            >
              <div className="flex flex-col justify-center">
                <div className="mb-4 flex items-center gap-3">
                  <Badge tone={TONES[featured.category]}>{featured.category}</Badge>
                  <span className="mono-caps text-[10px] text-dim">Featured</span>
                </div>
                <h2 className="display text-3xl leading-[0.95] md:text-5xl">{featured.title}</h2>
                <p className="mt-4 max-w-xl text-muted">{featured.summary}</p>
                <div className="mt-6 flex items-center gap-3 text-xs text-dim">
                  <span>{featured.author}</span>
                  <span aria-hidden>·</span>
                  <time dateTime={featured.date}>{formatDate(featured.date)}</time>
                  <span aria-hidden>·</span>
                  <span>{readingTime(featured.body)} min read</span>
                </div>
              </div>
              <div className="flex items-end justify-end">
                <ArrowUpRight size={26} className="text-dim transition-colors group-hover:text-cyan" />
              </div>
            </Link>
          </Reveal>
        ) : null}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 3) * 0.05}>
              <Link
                href={`/blog/${p.slug}`}
                className="group flex h-full flex-col rounded-xl2 border border-line bg-panel p-6 transition-colors hover:border-line-2"
              >
                <div className="mb-4 flex items-center justify-between">
                  <Badge tone={TONES[p.category]}>{p.category}</Badge>
                  <ArrowUpRight size={16} className="text-dim transition-colors group-hover:text-cyan" />
                </div>
                <h2 className="text-lg font-semibold leading-snug text-fg">{p.title}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{p.summary}</p>
                <div className="mt-5 flex items-center gap-2.5 border-t border-line pt-4 text-[11px] text-dim">
                  <time dateTime={p.date}>{formatDate(p.date, { month: "short" })}</time>
                  <span aria-hidden>·</span>
                  <span>{readingTime(p.body)} min read</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      <CtaBand
        eyebrow="Put it into practice"
        title={
          <>
            Read the theory.
            <br />
            Then see <Accent tone="gold">your</Accent> number.
          </>
        }
        primary={{ href: "/analyze", label: "Analyze my resume →" }}
        secondary={{ href: "/salaries", label: "Salary guides" }}
      />
    </>
  );
}
