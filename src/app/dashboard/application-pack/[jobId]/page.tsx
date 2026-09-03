import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase } from "lucide-react";
import { getJob } from "@/lib/engine";
import { EmptyState } from "@/components/dashboard/widgets";
import { ApplicationPackClient } from "./ApplicationPackClient";

export async function generateMetadata({ params }: { params: Promise<{ jobId: string }> }): Promise<Metadata> {
  const { jobId } = await params;
  const job = getJob(jobId);
  return {
    title: job ? `Application pack · ${job.company}` : "Application pack",
    description: job
      ? `A tailored application pack for ${job.title} at ${job.company}: tailored resume summary, bullets, cover letter and interview prep — editable, copyable and downloadable — with a live fit matrix.`
      : "Tailored resume summary, bullets, cover letter and interview prep for a saved job.",
  };
}

export default async function ApplicationPackPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const job = getJob(jobId);

  if (!job) {
    return (
      <div className="pt-2">
        <EmptyState
          icon={Briefcase}
          eyebrow="Not found"
          title="We couldn't find that job"
          body="This listing may have been removed, or the link is out of date. Head back to the job search to find roles and save them to your pipeline."
          cta={{ href: "/dashboard/job-search", label: "Back to job search" }}
          secondary={{ href: "/dashboard/pipeline", label: "View pipeline" }}
        />
        <p className="mt-6 text-center text-xs text-dim">
          Looking for a saved role?{" "}
          <Link href="/dashboard/pipeline" className="text-cyan hover:underline">
            Open your pipeline
          </Link>
          .
        </p>
      </div>
    );
  }

  return <ApplicationPackClient job={job} />;
}
