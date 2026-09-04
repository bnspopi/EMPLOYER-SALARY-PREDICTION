"use client";
import { useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useTransform } from "framer-motion";
import { Plus, ArrowRight } from "lucide-react";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { LazyCanvas } from "./LazyCanvas";
import { Poster } from "./Poster";
import { HERO_MODULES, HERO_STATS } from "./data";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), { ssr: false });

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(ref);
  const reduced = useReducedMotion();

  const headlineScale = useTransform(progress, [0, 0.6], [1, 1.15]);
  const headlineOpacity = useTransform(progress, [0, 0.5], [1, 0]);
  const leftX = useTransform(progress, [0, 0.4], [0, -60]);
  const rightX = useTransform(progress, [0, 0.4], [0, 60]);
  const hudOpacity = useTransform(progress, [0, 0.35], [1, 0]);

  return (
    <section ref={ref} className="relative h-[220vh]" aria-label="PayLens — know your true worth">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Headline layered behind the canvas */}
        <motion.h1
          style={reduced ? undefined : { scale: headlineScale, opacity: headlineOpacity }}
          className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center text-center"
        >
          <span className="display text-fg/90 text-[18vw] leading-none">Know Your</span>
          <span className="display text-fg text-[18vw] leading-none">
            <span className="serif-italic text-cyan">True</span> Worth.
          </span>
        </motion.h1>

        {/* 3D canvas */}
        <div className="absolute inset-0 z-10">
          <LazyCanvas
            reduced={reduced}
            // The backdrop stays behind the live canvas, so it is the empty studio:
            // the robot itself is drawn in 3D, and a robot plate here doubled it.
            poster={<Poster src="/images/studio-backdrop.webp" alt="" overlay="dim" />}
            still={<Poster src="/images/robot-full.webp" alt="" overlay="none" />}
          >
            {(active) => <HeroScene progress={progress} active={active} dpr={reduced ? 1 : 1.75} />}
          </LazyCanvas>
        </div>

        {/* Corner meta */}
        <div className="pointer-events-none absolute inset-x-5 top-20 z-20 flex justify-between md:inset-x-10">
          <span className="mono-caps text-dim">US · CA · UK</span>
          <span className="mono-caps text-dim">Updated daily</span>
        </div>

        {/* Left HUD — modules */}
        <motion.aside
          style={reduced ? undefined : { x: leftX, opacity: hudOpacity }}
          className="absolute left-5 top-1/2 z-20 hidden -translate-y-1/2 md:block md:left-10"
        >
          <div className="glass rounded-xl2 p-4 w-56">
            <div className="eyebrow mb-3">Modules S — A</div>
            <ul className="flex flex-col gap-1.5">
              {HERO_MODULES.map((m, i) => {
                const Icon = m.icon;
                return (
                  <li key={m.key}>
                    <Link
                      href={m.href}
                      className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${
                        i === 0 ? "border-cyan/40 bg-cyan/10 text-fg" : "border-transparent text-muted hover:border-line-2 hover:text-fg"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden />
                      <span className="mono-caps text-[11px]">{m.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </motion.aside>

        {/* Right HUD — market value + stat bars */}
        <motion.aside
          style={reduced ? undefined : { x: rightX, opacity: hudOpacity }}
          className="absolute right-5 top-1/2 z-20 hidden -translate-y-1/2 md:block md:right-10"
        >
          <div className="glass rounded-xl2 p-5 w-64">
            <div className="eyebrow mb-1 text-cyan">Market value</div>
            <div className="display text-6xl leading-none tabular-nums">$147K</div>
            <div className="mono-caps mt-1 text-dim">Senior PM · Los Angeles</div>
            <div className="mt-5 flex flex-col gap-3.5">
              {HERO_STATS.map((s, i) => (
                <div key={s.label}>
                  <div className="mb-1 flex items-baseline justify-between">
                    <span className="mono-caps text-[10px] text-muted">{s.label}</span>
                    <span className="tabular-nums text-sm font-semibold text-fg">{s.value}</span>
                  </div>
                  <div className="stat-bar rounded-full">
                    <motion.span
                      className="rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${s.width}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 + i * 0.12 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.aside>

        {/* Bottom CTAs */}
        <div className="absolute inset-x-5 bottom-10 z-20 flex items-center justify-between md:inset-x-10">
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 rounded-md bg-fg px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-bg transition-all hover:bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.25)]"
          >
            Analyze my resume <Plus className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 rounded-md border border-fg/30 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-fg transition-colors hover:border-fg hover:bg-fg/5"
          >
            Start <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        {/* Mobile HUD stack */}
        <div className="absolute inset-x-5 bottom-24 z-20 flex flex-col gap-3 md:hidden">
          <div className="glass rounded-xl2 p-4">
            <div className="flex items-baseline justify-between">
              <span className="eyebrow text-cyan">Market value</span>
              <span className="display text-3xl leading-none tabular-nums">$147K</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
