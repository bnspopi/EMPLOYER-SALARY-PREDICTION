import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";
import { Accent } from "@/components/marketing/PageHero";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you were looking for does not exist.",
};

const LINKS = [
  { href: "/analyze", label: "Analyze my resume" },
  { href: "/pricing", label: "Pricing" },
  { href: "/salaries", label: "Salary guides" },
  { href: "/for-recruiters", label: "For recruiters" },
];

export default function NotFound() {
  return (
    <div className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-5 py-32 text-center">
      <div
        aria-hidden
        className="grid-bg pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_60%)]"
      />
      <div className="relative">
        <div className="eyebrow mb-6 text-ember">Error 404</div>
        <h1 className="display text-[clamp(4.5rem,18vw,12rem)] leading-[0.85]">
          Off the <Accent tone="gold">map</Accent>.
        </h1>
        <p className="mx-auto mt-6 max-w-md text-lg text-muted">
          We couldn&apos;t price this one — the page you&apos;re after doesn&apos;t exist or has moved.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button href="/" size="lg">
            Back to home
          </Button>
          <Button href="/analyze" variant="outline" size="lg">
            Analyze my resume →
          </Button>
        </div>
        <nav aria-label="Popular pages" className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="mono-caps text-[11px] text-dim transition-colors hover:text-fg">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
