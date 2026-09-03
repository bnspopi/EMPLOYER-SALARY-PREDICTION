import type { Metadata } from "next";
import { CareerGrowthClient } from "./CareerGrowthClient";

export const metadata: Metadata = {
  title: "Career growth",
  description:
    "Map your path to a higher salary — set a target role, salary and location and get a months-to-target plan: the level ladder, the skills and courses to build, certifications for the path and your cumulative salary at each step.",
};

export default function CareerGrowthPage() {
  return <CareerGrowthClient />;
}
