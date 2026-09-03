import type { Metadata } from "next";
import { OfferEvaluatorClient } from "@/components/dashboard/offers";

export const metadata: Metadata = {
  title: "Offer Evaluator · PayLens",
  description:
    "Is your job offer actually fair? Get a market verdict, percentile, full salary range, total-comp view and a negotiation brief.",
};

export default function OfferEvaluatorPage() {
  return <OfferEvaluatorClient />;
}
