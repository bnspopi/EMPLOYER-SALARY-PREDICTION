import type { Metadata } from "next";
import { JobSearchClient } from "./JobSearchClient";

export const metadata: Metadata = {
  title: "Job search",
  description:
    "Search a personalised job feed with a fit score and matched / partial / gap breakdown for every listing, save roles to your pipeline, check your fit against any pasted job description, and map median pay for a role across eight cities.",
};

export default function JobSearchPage() {
  return <JobSearchClient />;
}
