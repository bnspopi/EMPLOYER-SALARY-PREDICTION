import type { Metadata } from "next";
import { PipelineClient } from "./PipelineClient";

export const metadata: Metadata = {
  title: "Pipeline",
  description:
    "A drag-and-drop Kanban of your job search — Saved, Applied, Interviewing and Offered — with market median and fit on every card, notes, level benchmarks and course picks per role, and a link to each tailored application pack.",
};

export default function PipelinePage() {
  return <PipelineClient />;
}
