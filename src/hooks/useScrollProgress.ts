"use client";
import { useEffect, type RefObject } from "react";
import { useMotionValue, type MotionValue } from "framer-motion";

/**
 * "sticky"   — 0 when the element's top reaches the viewport top, 1 when its bottom reaches the viewport bottom.
 *              Use for tall sections with a `position: sticky; height: 100vh` child (hero, watch chapter).
 * "traverse" — 0 when the element enters from below, 1 when it has fully left through the top.
 *              Use for parallax / draw-on-scroll effects on normal-flow sections.
 */
export type ScrollProgressMode = "sticky" | "traverse";

/**
 * Scroll progress (0..1) for a section as a motion value. Reads are free (`progress.get()` inside useFrame),
 * framer transforms subscribe via `useTransform`. Works with native scroll and Lenis (which scrolls natively).
 */
export function useScrollProgress(ref: RefObject<HTMLElement | null>, mode: ScrollProgressMode = "sticky"): MotionValue<number> {
  const progress = useMotionValue(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let top = 0;
    let height = 1;
    let vh = 1;

    const update = () => {
      const y = window.scrollY;
      const p = mode === "sticky" ? (y - top) / Math.max(1, height - vh) : (y + vh - top) / Math.max(1, height + vh);
      progress.set(p < 0 ? 0 : p > 1 ? 1 : p);
    };
    const measure = () => {
      const r = el.getBoundingClientRect();
      top = r.top + window.scrollY;
      height = r.height;
      vh = window.innerHeight;
      update();
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    ro.observe(document.body);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", measure);
    };
  }, [ref, mode, progress]);

  return progress;
}
