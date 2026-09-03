import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { PageHero, Accent } from "@/components/marketing/PageHero";
import { DocLayout, DocSection, type TocItem } from "@/components/marketing/DocLayout";

export const metadata: Metadata = {
  title: "Terms of service",
  description: `The terms that govern your use of ${BRAND.name} — what the service does, what it doesn't guarantee, and the ground rules for using it.`,
  alternates: { canonical: "/terms" },
};

const TOC: TocItem[] = [
  { id: "acceptance", title: "Acceptance" },
  { id: "the-service", title: "The service" },
  { id: "estimates", title: "Estimates & no guarantee" },
  { id: "accounts", title: "Accounts & your data" },
  { id: "acceptable-use", title: "Acceptable use" },
  { id: "plans-billing", title: "Plans & billing" },
  { id: "recruiter", title: "Recruiter features" },
  { id: "ip", title: "Intellectual property" },
  { id: "liability", title: "Disclaimer & liability" },
  { id: "changes", title: "Changes & governing law" },
];

const UPDATED = "September 3, 2026";

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow={`Legal · Updated ${UPDATED}`}
        title={
          <>
            Terms of <Accent tone="gold">service</Accent>.
          </>
        }
        sub="The ground rules for using PayLens. Plain language where we can manage it."
        tone="cyan"
        compact
      />

      <DocLayout toc={TOC}>
        <DocSection id="acceptance" title="Acceptance of these terms" number={1}>
          <p>
            By accessing or using PayLens (the &quot;Service&quot;), you agree to these Terms of Service. If you don&apos;t
            agree, please don&apos;t use the Service. If you use PayLens on behalf of an organisation, you confirm you have
            authority to bind that organisation to these terms.
          </p>
        </DocSection>

        <DocSection id="the-service" title="The service" number={2}>
          <p>
            PayLens is a career-intelligence tool that analyses a resume or job description and produces salary estimates,
            market percentiles, resume scores, offer evaluations, job matches, negotiation briefs and related career
            planning outputs for the US, Canada and the UK. The Service is provided for informational purposes to help you
            make your own decisions.
          </p>
        </DocSection>

        <DocSection id="estimates" title="Estimates & no guarantee" number={3}>
          <p>
            Salary figures, percentiles and recommendations are <strong>estimates</strong> generated from market data and
            statistical models. They are not offers of employment, promises of compensation, financial advice, or a guarantee
            of any outcome. Real pay depends on many factors we can&apos;t see, and you should treat every number as a
            well-informed starting point for your own judgment — not a certainty.
          </p>
        </DocSection>

        <DocSection id="accounts" title="Accounts & your data" number={4}>
          <p>
            A PayLens account is stored locally in your browser; you are responsible for the device and browser you use.
            Your resumes and analyses are held in local storage and can be deleted by you at any time. Our handling of data is
            described in the <Link href="/privacy">privacy policy</Link>, which forms part of these terms.
          </p>
        </DocSection>

        <DocSection id="acceptable-use" title="Acceptable use" number={5}>
          <p>You agree not to:</p>
          <ul>
            <li>upload content you don&apos;t have the right to use, or another person&apos;s resume without their consent;</li>
            <li>attempt to scrape, reverse-engineer, or resell the Service&apos;s data or models;</li>
            <li>use the Service to build a competing dataset or to harm, harass or discriminate against any individual;</li>
            <li>interfere with the Service&apos;s operation or security.</li>
          </ul>
        </DocSection>

        <DocSection id="plans-billing" title="Plans & billing" number={6}>
          <p>
            PayLens offers a free plan and paid plans (Explorer and Hunter), billed monthly or annually. Upgrades take effect
            immediately; downgrades take effect at the end of the current billing period. Prices are shown on the{" "}
            <Link href="/pricing">pricing page</Link>. In this build, checkout is simulated and no real payment is taken; where
            real billing applies, fees are non-refundable except where required by law.
          </p>
        </DocSection>

        <DocSection id="recruiter" title="Recruiter features" number={7}>
          <p>
            Recruiter tools turn a job description into salary benchmarks by city, industry and level, and are intended to help
            hiring teams set competitive, fair compensation. Benchmarks are estimates and must not be used as the sole basis
            for any hiring or pay decision, or in any way that unlawfully discriminates against candidates. Recruiter access
            may be offered on a free-trial basis and is subject to these terms.
          </p>
        </DocSection>

        <DocSection id="ip" title="Intellectual property" number={8}>
          <p>
            The Service, including its software, models, design and content, is owned by {BRAND.name} and protected by
            applicable law. You retain ownership of the resume content you provide. Outputs generated for you — your briefs,
            packs and reports — are yours to keep and use.
          </p>
        </DocSection>

        <DocSection id="liability" title="Disclaimer & limitation of liability" number={9}>
          <p>
            The Service is provided &quot;as is&quot; without warranties of any kind, express or implied. To the fullest
            extent permitted by law, {BRAND.name} is not liable for any indirect, incidental or consequential damages, or for
            any decision you make based on an estimate produced by the Service. Nothing in these terms limits liability that
            cannot be limited by law.
          </p>
        </DocSection>

        <DocSection id="changes" title="Changes & governing law" number={10}>
          <p>
            We may update these terms from time to time; material changes will be reflected here with a new date, and continued
            use constitutes acceptance. These terms are governed by the laws of the jurisdiction in which {BRAND.name}
            operates, without regard to conflict-of-laws rules. Questions? Email{" "}
            <a href={`mailto:${BRAND.supportEmail}`}>{BRAND.supportEmail}</a> or use the <Link href="/contact">contact form</Link>.
          </p>
        </DocSection>
      </DocLayout>
    </>
  );
}
