import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { PageHero, Accent } from "@/components/marketing/PageHero";
import { DocLayout, DocSection, type TocItem } from "@/components/marketing/DocLayout";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `How ${BRAND.name} handles your data: your resume stays in your browser, contact details are stripped before analysis, and nothing is sold or used to train our models.`,
  alternates: { canonical: "/privacy" },
};

const TOC: TocItem[] = [
  { id: "summary", title: "The short version" },
  { id: "what-we-collect", title: "What we collect" },
  { id: "where-it-lives", title: "Where your data lives" },
  { id: "how-we-use-it", title: "How we use it" },
  { id: "sharing", title: "Sharing & selling" },
  { id: "retention", title: "Retention & deletion" },
  { id: "security", title: "Security" },
  { id: "your-rights", title: "Your rights" },
  { id: "changes", title: "Changes" },
  { id: "contact", title: "Contact" },
];

const UPDATED = "September 3, 2026";

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow={`Legal · Updated ${UPDATED}`}
        title={
          <>
            Your data stays <Accent tone="gold">yours</Accent>.
          </>
        }
        sub="PayLens is built so your resume never has to leave your device. This policy explains exactly what that means."
        tone="cyan"
        compact
      />

      <DocLayout toc={TOC}>
        <DocSection id="summary" title="The short version" number={1}>
          <ul>
            <li>Your resume and analyses are stored in <strong>your browser&apos;s local storage</strong>, not on our servers.</li>
            <li>Contact details are <strong>stripped before analysis</strong> — we price an anonymised profile.</li>
            <li>We <strong>never sell</strong> your data and <strong>never share</strong> it with employers or recruiters.</li>
            <li>We <strong>don&apos;t use your resume to train</strong> our models.</li>
            <li>You can <strong>delete everything</strong> in one click, at any time, from Settings.</li>
          </ul>
        </DocSection>

        <DocSection id="what-we-collect" title="What we collect" number={2}>
          <p>PayLens works with the information you choose to provide:</p>
          <ul>
            <li><strong>Resume content</strong> — the text you paste or the PDF you upload, which is parsed into a profile.</li>
            <li><strong>Account basics</strong> — a display name and email if you create a local account, used to personalise the app.</li>
            <li><strong>Inputs you enter</strong> — target roles, offer details, job searches and pipeline notes.</li>
          </ul>
          <p>
            We do not require your real name, and contact details found inside a resume (email, phone, address) are removed
            before the profile is priced.
          </p>
        </DocSection>

        <DocSection id="where-it-lives" title="Where your data lives" number={3}>
          <p>
            The defining feature of PayLens is local-first storage. Your resumes, analyses, offers, pipeline and settings are
            persisted to your browser using local storage on your device. That data is not transmitted to us for storage, is
            not synced across your devices, and is not visible to anyone but you. Clearing your browser data or switching
            devices removes it.
          </p>
          <p>
            When a feature needs to compute — for example scoring a resume — it runs in your browser or in a stateless request
            that returns a result without retaining your input.
          </p>
        </DocSection>

        <DocSection id="how-we-use-it" title="How we use it" number={4}>
          <p>
            We use your inputs solely to produce the outputs you asked for: a salary range, a market percentile, a resume
            score, an offer verdict, job matches, a negotiation brief, and so on. We do not build advertising profiles, and we
            do not feed your resume into model training.
          </p>
        </DocSection>

        <DocSection id="sharing" title="Sharing & selling" number={5}>
          <p>
            We do not sell your personal data, and we do not share your resume or analyses with employers, recruiters or data
            brokers. Because your data is stored locally, there is generally nothing for us to share in the first place.
          </p>
        </DocSection>

        <DocSection id="retention" title="Retention & deletion" number={6}>
          <p>
            Data lives on your device until you remove it. Delete a single resume version from the Resumes page, or wipe your
            account and all associated data from Settings. Deletion is immediate and irreversible — there is no server-side
            copy to recover.
          </p>
        </DocSection>

        <DocSection id="security" title="Security" number={7}>
          <p>
            We serve PayLens over encrypted connections and follow standard practices to protect any data in transit. Since
            your resume is not stored on our servers, the most important safeguard is your own device: use a trusted browser
            and keep it up to date.
          </p>
        </DocSection>

        <DocSection id="your-rights" title="Your rights" number={8}>
          <p>
            Depending on where you live, you may have rights to access, correct, export or delete personal data. With
            PayLens you can exercise these directly: your data is in your hands, and Settings gives you export and delete
            controls without needing to file a request. If you need help, contact us.
          </p>
        </DocSection>

        <DocSection id="changes" title="Changes to this policy" number={9}>
          <p>
            If we make material changes to how PayLens handles data, we&apos;ll update this page and revise the date at the top.
            Continued use after an update means you accept the revised policy.
          </p>
        </DocSection>

        <DocSection id="contact" title="Contact" number={10}>
          <p>
            Questions about privacy? Email <a href={`mailto:${BRAND.supportEmail}`}>{BRAND.supportEmail}</a> or use the{" "}
            <Link href="/contact">contact form</Link>. See also our <Link href="/terms">terms of service</Link>.
          </p>
        </DocSection>
      </DocLayout>
    </>
  );
}
