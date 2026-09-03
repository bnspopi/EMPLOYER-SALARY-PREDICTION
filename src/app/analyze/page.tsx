import type { Metadata } from "next";
import { Suspense } from "react";
import { AnalyzeClient } from "./AnalyzeClient";

export const metadata: Metadata = {
  title: "Analyze your resume",
  description:
    "Upload a PDF or paste your resume or a job description. Get your real salary range, market percentile and skills breakdown in seconds — no sign-up required.",
};

export default function AnalyzePage() {
  return (
    <Suspense fallback={null}>
      <AnalyzeClient />
    </Suspense>
  );
}
