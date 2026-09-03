import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { POSTS } from "@/data/blog";
import type { BlogPost } from "@/data/types";
import { BRAND } from "@/lib/brand";
import { formatDate, readingTime } from "@/components/marketing/format";
import { Accent } from "@/components/marketing/PageHero";
import { JsonLd } from "@/components/marketing/JsonLd";
import { CtaBand } from "@/components/marketing/CtaBand";
import { Section, Badge } from "@/components/ui";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { title: `${post.title} | ${BRAND.name}`, description: post.summary, type: "article", publishedTime: post.date },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const more = POSTS.filter((p) => p.slug !== post.slug)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 3);

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    author: { "@type": "Organization", name: post.author },
    publisher: { "@type": "Organization", name: BRAND.name },
    keywords: post.tags.join(", "),
  };

  return (
    <>
      <JsonLd data={articleLd} />

      <header className="relative overflow-hidden px-5 pb-10 pt-32 md:px-10 md:pt-40">
        <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_top,black_10%,transparent_60%)]" />
        <div className="relative mx-auto max-w-3xl">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Link href="/blog" className="mono-caps text-[10px] text-dim hover:text-fg">
              ← Blog
            </Link>
            <Badge tone="cyan">{post.category}</Badge>
          </div>
          <h1 className="display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.95]">{post.title}</h1>
          <p className="mt-5 text-lg leading-relaxed text-muted">{post.summary}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-dim">
            <span>{post.author}</span>
            <span aria-hidden>·</span>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span aria-hidden>·</span>
            <span>{readingTime(post.body)} min read</span>
          </div>
        </div>
      </header>

      <Section className="pb-16">
        <article className="mx-auto max-w-3xl">
          <div className="space-y-5 text-[17px] leading-[1.75] text-fg/85">
            {post.body.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          {post.tags.length ? (
            <div className="mt-10 flex flex-wrap gap-2 border-t border-line pt-6">
              {post.tags.map((t) => (
                <Badge key={t} tone="neutral">
                  {t}
                </Badge>
              ))}
            </div>
          ) : null}
        </article>
      </Section>

      {more.length ? (
        <Section className="pb-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="display mb-8 text-3xl md:text-4xl">Keep reading</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="group flex h-full flex-col rounded-xl2 border border-line bg-panel p-5 transition-colors hover:border-line-2">
                  <div className="mb-3 flex items-center justify-between">
                    <Badge tone="cyan">{p.category}</Badge>
                    <ArrowUpRight size={16} className="text-dim transition-colors group-hover:text-cyan" />
                  </div>
                  <h3 className="text-base font-semibold leading-snug text-fg">{p.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-muted">{p.summary}</p>
                </Link>
              ))}
            </div>
          </div>
        </Section>
      ) : null}

      <CtaBand
        eyebrow="Your number, not the average"
        title={
          <>
            Enough reading.
            <br />
            See <Accent tone="gold">your</Accent> worth.
          </>
        }
        primary={{ href: "/analyze", label: "Analyze my resume →" }}
        secondary={{ href: "/pricing", label: "See pricing" }}
      />
    </>
  );
}
