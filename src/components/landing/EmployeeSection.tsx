"use client";
import dynamic from "next/dynamic";
import { Check } from "lucide-react";
import { Eyebrow } from "@/components/ui";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { LazyCanvas } from "./LazyCanvas";
import { Poster } from "./Poster";
import { Reveal } from "./Reveal";
import { EMPLOYEE_BULLETS } from "./data";

const EmployeeScene = dynamic(() => import("@/components/three/EmployeeScene"), { ssr: false });

export function EmployeeSection() {
  const reduced = useReducedMotion();
  return (
    <section className="relative overflow-hidden border-t border-line py-24 md:py-32" aria-label="Your profile, at work">
      <div className="mx-auto grid max-w-[1400px] items-center gap-12 px-5 md:grid-cols-2 md:px-10">
        <Reveal className="order-2 md:order-1">
          <Eyebrow tone="cyan">Your profile, at work</Eyebrow>
          <h2 className="display mt-3 text-5xl md:text-6xl">
            Upload once — the platform organizes <span className="serif-italic text-cyan">around you</span>.
          </h2>
          <p className="mt-4 max-w-md text-muted">
            One resume becomes the center of everything: salary range, percentile, gaps, ROI and job matches, all keyed to
            your actual profile.
          </p>
          <ul className="mt-8 flex flex-col gap-3">
            {EMPLOYEE_BULLETS.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan" aria-hidden />
                <span className="text-fg">{b}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <div className="relative order-1 h-[420px] overflow-hidden rounded-xl2 border border-line md:order-2 md:h-[540px]">
          <LazyCanvas
            reduced={reduced}
            poster={<Poster src="/images/employee-backdrop.jpg" alt="A professional at a desk" />}
          >
            {(active) => (
              <>
                <div className="pointer-events-none absolute inset-0 z-0">
                  <Poster src="/images/employee-backdrop.jpg" alt="" />
                </div>
                <div className="absolute inset-0 z-10">
                  <EmployeeScene active={active} dpr={reduced ? 1 : 1.5} />
                </div>
              </>
            )}
          </LazyCanvas>
        </div>
      </div>
    </section>
  );
}
