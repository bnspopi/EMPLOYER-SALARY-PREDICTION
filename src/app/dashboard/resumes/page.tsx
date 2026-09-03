import type { Metadata } from "next";
import { ResumesClient } from "./ResumesClient";

export const metadata: Metadata = {
  title: "Resumes",
  description: "Manage your resume versions, analyze someone else's resume, set the active version, rename, and delete — everything stays in your browser.",
};

export default function ResumesPage() {
  return <ResumesClient />;
}
