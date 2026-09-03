import type { Metadata } from "next";
import { MarketValueClient } from "./MarketValueClient";

export const metadata: Metadata = {
  title: "Market value",
  description:
    "Your personal salary range, market percentile, skills breakdown, strengths and gaps, and a negotiation-ready Salary Brief — priced on real openings for your role and location.",
};

export default function MarketValuePage() {
  return <MarketValueClient />;
}
