import type { Metadata } from "next";
import Link from "next/link";
import { Mail, LifeBuoy, Building2 } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { PageHero, Accent } from "@/components/marketing/PageHero";
import { Section } from "@/components/ui";
import { ContactClient } from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with the ${BRAND.name} team — questions, billing, recruiter enquiries, bugs or feedback. We reply within one business day.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Talk to <Accent tone="gold">us</Accent>.
          </>
        }
        sub="Questions about your analysis, your plan, or hiring with PayLens? Send a note and we'll get back to you within one business day."
        tone="cyan"
        compact
      />

      <Section className="pb-28" wide>
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <ContactClient />

          <aside className="space-y-4">
            <div className="rounded-xl2 border border-line bg-panel p-6">
              <div className="mb-3 inline-grid h-10 w-10 place-items-center rounded-md bg-cyan/10 text-cyan">
                <Mail size={18} />
              </div>
              <h2 className="text-base font-semibold text-fg">Email us</h2>
              <p className="mt-1 text-sm text-muted">Prefer email? Reach the team directly.</p>
              <a href={`mailto:${BRAND.supportEmail}`} className="mt-2 inline-block text-sm text-cyan hover:underline">
                {BRAND.supportEmail}
              </a>
            </div>

            <div className="rounded-xl2 border border-line bg-panel p-6">
              <div className="mb-3 inline-grid h-10 w-10 place-items-center rounded-md bg-gold/10 text-gold">
                <LifeBuoy size={18} />
              </div>
              <h2 className="text-base font-semibold text-fg">Help center</h2>
              <p className="mt-1 text-sm text-muted">Most answers are already written up.</p>
              <Link href="/help" className="mt-2 inline-block text-sm text-cyan hover:underline">
                Browse the help center →
              </Link>
            </div>

            <div className="rounded-xl2 border border-line bg-panel p-6">
              <div className="mb-3 inline-grid h-10 w-10 place-items-center rounded-md bg-ember/10 text-ember">
                <Building2 size={18} />
              </div>
              <h2 className="text-base font-semibold text-fg">Hiring teams</h2>
              <p className="mt-1 text-sm text-muted">Benchmark roles with a 14-day free trial.</p>
              <Link href="/for-recruiters" className="mt-2 inline-block text-sm text-cyan hover:underline">
                PayLens for recruiters →
              </Link>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
