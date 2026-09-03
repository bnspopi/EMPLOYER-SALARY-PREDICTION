import Link from "next/link";
import { BRAND } from "@/lib/brand";

const COLS = [
  {
    title: "Product",
    links: [
      { href: "/analyze", label: "Resume Analysis" },
      { href: "/dashboard/offer-evaluator", label: "Job Offer Analysis" },
      { href: "/dashboard/improve", label: "Resume Improvement" },
      { href: "/dashboard/pipeline", label: "Jobs Pipeline" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/blog", label: "Blog" },
      { href: "/salaries", label: "Salary Guides" },
      { href: "/help", label: "Help Center" },
      { href: "/#faq", label: "FAQ" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/for-recruiters", label: "For Recruiters" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-bg px-5 py-16 md:px-10">
      <div className="mx-auto grid max-w-[1400px] gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="display text-3xl tracking-wider">{BRAND.name}</div>
          <p className="mt-3 max-w-xs text-sm text-muted">{BRAND.tagline}</p>
          <p className="mt-6 mono-caps text-[10px] text-dim">US · Canada · UK</p>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <div className="eyebrow mb-4 text-fg">{c.title}</div>
            <ul className="space-y-2.5">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted transition-colors hover:text-fg">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-14 flex max-w-[1400px] flex-col gap-2 border-t border-white/5 pt-6 text-xs text-dim md:flex-row md:items-center md:justify-between">
        <span>© {new Date().getFullYear()} {BRAND.name} · {BRAND.domain}</span>
        <span>Salary · Offers · Job Search · Career Growth</span>
      </div>
    </footer>
  );
}
