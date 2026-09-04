"use client";
import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useMotionValueEvent, useTransform, type MotionValue } from "framer-motion";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { LazyCanvas } from "./LazyCanvas";
import { Poster } from "./Poster";
import { ScrollFilm } from "./ScrollFilm";
import { WATCH_CHAPTERS, type Chapter } from "./data";
import films from "@/data/films.json";

const WatchScene = dynamic(() => import("@/components/three/WatchScene"), { ssr: false });

function ChapterBlock({
  chapter,
  progress,
  reduced,
  active,
}: {
  chapter: Chapter;
  progress: MotionValue<number>;
  reduced: boolean;
  /** Only the chapter the scroll is currently inside may be painted. */
  active: boolean;
}) {
  const [r0, r1] = chapter.range;
  const inA = Math.max(0, r0 + 0.02);
  const outA = Math.min(1, r1 - 0.04);
  // Opacity is the sequential reveal (functional, kept under reduced motion);
  // the y slide is decorative parallax and is flattened when reduced.
  const opacity = useTransform(progress, [r0, inA, outA, r1], [r0 === 0 ? 1 : 0, 1, 1, 0]);
  const y = useTransform(progress, [r0, inA, outA, r1], [40, 0, 0, -40]);
  return (
    <motion.div
      // The chapters are stacked in the same spot, so a transform that stops
      // tracking scroll leaves its chapter painted on top of the live one — two
      // captions overlapping into unreadable type. `active` is derived in React
      // from the same progress value and hides every chapter but the current
      // one, so a stale opacity can no longer put text on screen.
      style={{ opacity, y: reduced ? 0 : y, visibility: active ? "visible" : "hidden" }}
      className="absolute left-5 top-1/2 max-w-sm -translate-y-1/2 md:left-16"
    >
      <div className="display text-gold text-7xl leading-none md:text-8xl">{chapter.num}</div>
      <h3 className="display mt-2 text-3xl md:text-4xl">{chapter.title}</h3>
      <p className="mt-3 text-base leading-relaxed text-muted">{chapter.body}</p>
    </motion.div>
  );
}

export function WatchChapter() {
  const ref = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(ref);
  const reduced = useReducedMotion();
  const [activeIdx, setActiveIdx] = useState(0);
  // Fires every scroll frame; setState with an unchanged value is a no-op in
  // React, so this only re-renders on an actual chapter change.
  useMotionValueEvent(progress, "change", (p) => {
    const i = WATCH_CHAPTERS.findIndex((c) => p < c.range[1]);
    setActiveIdx(i === -1 ? WATCH_CHAPTERS.length - 1 : i);
  });

  return (
    <section ref={ref} className="relative h-[200vh] md:h-[300vh]" aria-label="How the market engine works">
      <div className="sticky top-0 h-screen overflow-hidden bg-bg">
        <div className="absolute inset-0">
          <LazyCanvas reduced={reduced} poster={<Poster src="/images/watch.jpg" alt="" />}>
            {(active) => (
              <ScrollFilm src={films.watch} progress={progress}>
                <WatchScene progress={progress} active={active} dpr={reduced ? 1 : 1.75} />
              </ScrollFilm>
            )}
          </LazyCanvas>
        </div>

        {/* Eyebrow + corner meta */}
        <div className="pointer-events-none absolute inset-x-5 top-24 z-10 flex justify-between md:inset-x-16">
          <span className="eyebrow text-gold">PayLens · Edition I — Market Engine</span>
          <div className="hidden text-right md:block">
            <div className="mono-caps text-dim">US · CA · UK</div>
            <div className="mono-caps text-dim">3 markets</div>
          </div>
        </div>

        {WATCH_CHAPTERS.map((c, i) => (
          <ChapterBlock key={c.num} chapter={c} progress={progress} reduced={reduced} active={i === activeIdx} />
        ))}
      </div>
    </section>
  );
}
