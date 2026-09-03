import type { Metadata } from "next";
import { InsightsClient } from "./InsightsClient";

export const metadata: Metadata = {
  title: "Market insights",
  description:
    "Salary trends, demand shifts and skill movement for your role and region — a 12-month median trend, supply-and-demand balance, emerging vs declining skills, remote-vs-city premiums and a US/CA/UK country comparison.",
};

export default function InsightsPage() {
  return <InsightsClient />;
}
