"use client";
import { useScroll, type MotionValue, type UseScrollOptions } from "framer-motion";
import type { RefObject } from "react";

/**
 * Scroll progress (0 → 1) of `ref` across the viewport. Returns a framer-motion
 * `MotionValue<number>` — read `.get()` inside `useFrame` (no React re-render) or
 * feed it to `useTransform` for DOM animations.
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  offset: UseScrollOptions["offset"] = ["start start", "end end"],
): MotionValue<number> {
  const { scrollYProgress } = useScroll({ target: ref, offset });
  return scrollYProgress;
}
