import type { Metadata } from "next";
import { Hero } from "@/components/landing/Hero";
import { StatsStrip } from "@/components/landing/StatsStrip";
import { IntentGrid } from "@/components/landing/IntentGrid";
import { WatchChapter } from "@/components/landing/WatchChapter";
import { EmployeeSection } from "@/components/landing/EmployeeSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ResumeCenter } from "@/components/landing/ResumeCenter";
import { FixesWithYou } from "@/components/landing/FixesWithYou";
import { ProofOfWork } from "@/components/landing/ProofOfWork";
import { PricingTeaser } from "@/components/landing/PricingTeaser";
import { Testimonials } from "@/components/landing/Testimonials";
import { Faq } from "@/components/landing/Faq";
import { FinalCta } from "@/components/landing/FinalCta";

export const metadata: Metadata = {
  title: "PayLens — Know Your True Worth. Then Act On It.",
  description:
    "Upload your resume and get instant salary insights priced against real vacancies across the US, Canada and the UK. See your market value, close the gap, and negotiate with confidence.",
  openGraph: {
    title: "PayLens — Know Your True Worth.",
    description:
      "Career intelligence powered by real market data. Salary range, market percentile, skill gaps and negotiation targets — personalized to your actual profile.",
    images: ["/images/robot-face.jpg"],
  },
};

export default function Home() {
  return (
    <main className="overflow-clip">
      <Hero />
      <StatsStrip />
      <IntentGrid />
      <WatchChapter />
      <EmployeeSection />
      <HowItWorks />
      <ResumeCenter />
      <FixesWithYou />
      <ProofOfWork />
      <PricingTeaser />
      <Testimonials />
      <Faq />
      <FinalCta />
    </main>
  );
}
