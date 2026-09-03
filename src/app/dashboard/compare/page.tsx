import type { Metadata } from "next";
import { CompareClient } from "@/components/dashboard/offers";

export const metadata: Metadata = {
  title: "Compare Offers · PayLens",
  description:
    "Compare your saved job offers side by side — base, bonus, equity, sign-on and total comp against each market median, with a recommended pick.",
};

export default function ComparePage() {
  return <CompareClient />;
}
