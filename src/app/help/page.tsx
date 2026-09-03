import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, Accent } from "@/components/marketing/PageHero";
import { DocLayout, DocSection, type TocItem } from "@/components/marketing/DocLayout";
import { CtaBand } from "@/components/marketing/CtaBand";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Help center",
  description:
    "Everything you need to get the most out of PayLens — uploads, plans, offers, the pipeline, application packs, recruiter benchmarking, privacy and billing.",
  alternates: { canonical: "/help" },
};

const TOC: TocItem[] = [
  { id: "getting-started", title: "Getting started" },
  { id: "uploads", title: "Uploading a resume" },
  { id: "privacy", title: "Privacy & your data" },
  { id: "plans", title: "Plans & what's included" },
  { id: "offers", title: "Evaluating an offer" },
  { id: "pipeline", title: "Jobs & pipeline" },
  { id: "application-pack", title: "Application packs" },
  { id: "recruiter", title: "For recruiters" },
  { id: "data-model", title: "Data & model" },
  { id: "deleting-data", title: "Deleting your data" },
  { id: "billing", title: "Billing & upgrades" },
  { id: "contact", title: "Contact support" },
];

export default function HelpPage() {
  return (
    <>
      <PageHero
        eyebrow="Help center"
        title={
          <>
            How can we <Accent tone="gold">help</Accent>?
          </>
        }
        sub="Short, practical answers to the questions we hear most. Everything runs in your browser, so most steps take seconds."
        tone="cyan"
        compact
      />

      <DocLayout toc={TOC}>
        <DocSection id="getting-started" title="Getting started" number={1}>
          <p>
            PayLens turns your resume into a salary range and a to-do list. The fastest way in is the{" "}
            <Link href="/analyze">Analyze</Link> page: paste your resume text or upload a PDF, and within a minute you&apos;ll
            see your floor, median and ceiling, your market percentile, and the skills driving the number.
          </p>
          <p>
            A basic analysis is free and needs no account. Sign up to save resume versions, track a pipeline, and unlock
            exact medians and negotiation briefs. Your dashboard organises everything around whichever resume you mark as
            active.
          </p>
        </DocSection>

        <DocSection id="uploads" title="Uploading a resume" number={2}>
          <p>You can bring your resume in three ways:</p>
          <ul>
            <li>
              <strong>Upload a PDF</strong> — parsed in your browser; the text never leaves your device to be stored.
            </li>
            <li>
              <strong>Paste the text</strong> — copy your resume into the box, useful if your PDF is image-only.
            </li>
            <li>
              <strong>Paste a job description</strong> — to price a role you&apos;re targeting rather than your own profile.
            </li>
          </ul>
          <p>
            For the best read, keep standard section headings (Experience, Skills, Education) and quantify your bullet points.
            The parser infers your level from years and responsibility language, so scope words like &quot;led&quot;, &quot;owned&quot;
            and team sizes materially improve accuracy.
          </p>
        </DocSection>

        <DocSection id="privacy" title="Privacy & your data" number={3}>
          <p>
            Your resume stays in your browser&apos;s local storage. Contact details — name, email, phone — are stripped before
            any analysis runs, and only the anonymised profile is priced. We never sell your data, never share it with
            employers or recruiters, and never use it to train our models.
          </p>
          <p>
            Because everything is stored locally, clearing your browser data or using a different device starts you fresh.
            See <Link href="/privacy">our privacy policy</Link> for the full detail.
          </p>
        </DocSection>

        <DocSection id="plans" title="Plans & what's included" number={4}>
          <p>There are three individual plans:</p>
          <ul>
            <li>
              <strong>Curious (free)</strong> — unlimited analyses, a basic salary range, market score and the full skill-name
              list.
            </li>
            <li>
              <strong>Explorer</strong> — exact medians and breakdowns, gap analysis, strengths &amp; improvements, courses and
              certifications, the career-growth planner, country comparison and the Salary Brief.
            </li>
            <li>
              <strong>Hunter</strong> — everything in Explorer plus the jobs pipeline, full offer analysis, negotiation
              playbook, application packs, the AI resume chat and Salary Brief PDF export.
            </li>
          </ul>
          <p>
            Compare them side by side on the <Link href="/pricing">pricing page</Link>. Annual billing saves 17%.
          </p>
        </DocSection>

        <DocSection id="offers" title="Evaluating an offer" number={5}>
          <p>
            Open the Offer Evaluator and enter the job title, location and base salary — plus optional bonus, equity and
            sign-on. PayLens returns a verdict (below, at or above market), your percentile, the full floor/median/ceiling
            range and a total-compensation view.
          </p>
          <p>
            On Hunter you also get the negotiation playbook: an opening script, counter-tactics for common pushback, and a
            Decision Helper that ranks competing offers on comp and market context together.
          </p>
        </DocSection>

        <DocSection id="pipeline" title="Jobs & pipeline" number={6}>
          <p>
            Job search ranks live listings by fit to your active resume, with a breakdown of what&apos;s matched, partial and a
            gap. Save any role to your pipeline and drag it across the Saved → Applied → Interviewing → Offered board.
          </p>
          <p>
            Each card shows the company, city, market median and your fit score. On Hunter, saved jobs also surface level
            benchmarks and course picks so you can close gaps before you apply. The pipeline is a Hunter feature.
          </p>
        </DocSection>

        <DocSection id="application-pack" title="Application packs" number={7}>
          <p>
            For any saved job, Hunter can generate a tailored application pack: a rewritten resume summary aimed at that role,
            tailored bullet points, a cover letter drafted from your profile, and interview prep questions with answer
            outlines. Every field is editable and copy-ready — treat the draft as a strong first version, then make it yours.
          </p>
        </DocSection>

        <DocSection id="recruiter" title="For recruiters" number={8}>
          <p>
            Hiring? The <Link href="/for-recruiters">recruiter tools</Link> turn a job description into a salary benchmark with
            bands by city, industry and experience level, plus a recommended posting band and the skills to screen hardest
            for. Paste a JD, add a title and location, and print the report. Recruiter access starts with a 14-day free trial,
            no card required.
          </p>
        </DocSection>

        <DocSection id="data-model" title="Data & model" number={9}>
          <p>
            PayLens uses two models. A <strong>parsing model</strong> converts a resume or job description into structured
            attributes — skills, employment type, employer type, industry, education, location and certifications. A{" "}
            <strong>pricing model</strong> maps those attributes into the same vector space as live vacancies with known
            salaries, and your estimate is the alignment of your profile with current openings that pay a known amount.
          </p>
          <p>
            We ingest roughly 10 million data points a month across the US, Canada and the UK and re-train daily, which is why
            fast-moving roles re-price over the year.
          </p>
        </DocSection>

        <DocSection id="deleting-data" title="Deleting your data" number={10}>
          <p>
            You&apos;re always in control. Delete an individual resume version from the Resumes page, or wipe everything —
            account, resumes, analyses, pipeline and offers — from Settings. Deletion is immediate and irreversible because
            the data lives only in your browser; there&apos;s no server copy to purge.
          </p>
        </DocSection>

        <DocSection id="billing" title="Billing & upgrades" number={11}>
          <p>
            Upgrade from the <Link href="/pricing">pricing page</Link> or Settings. Upgrades unlock instantly; if you
            downgrade you keep your current plan until the end of the billing period. Switching between monthly and annual
            takes effect at your next renewal.
          </p>
          <p>
            Note: checkout in this build is simulated — no real card is charged — so you can explore every plan freely.
          </p>
        </DocSection>

        <DocSection id="contact" title="Contact support" number={12}>
          <p>
            Still stuck? Reach us at <a href={`mailto:${BRAND.supportEmail}`}>{BRAND.supportEmail}</a> or through the{" "}
            <Link href="/contact">contact form</Link>. Include your role, location and what you were trying to do — the more
            context, the faster we can help.
          </p>
        </DocSection>
      </DocLayout>

      <CtaBand
        eyebrow="Ready when you are"
        title={
          <>
            Got the basics?
            <br />
            <Accent tone="gold">Run</Accent> your analysis.
          </>
        }
        primary={{ href: "/analyze", label: "Analyze my resume →" }}
        secondary={{ href: "/contact", label: "Contact us" }}
      />
    </>
  );
}
