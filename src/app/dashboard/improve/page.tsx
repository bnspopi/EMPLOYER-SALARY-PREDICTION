import type { Metadata } from "next";
import { ImproveClient } from "./ImproveClient";

export const metadata: Metadata = {
  title: "Improve",
  description:
    "Close the gap between your résumé and your worth — a /100 score, prioritized improvements ranked by salary impact, target-role skill gaps, certifications that pay, a learning roadmap and section-by-section rewrites that re-score as you edit.",
};

export default function ImprovePage() {
  return <ImproveClient />;
}
