"use client";
import { useScroll, type MotionValue } from "framer-motion";
import type { RefObject } from "react";

type Edge = "start" | "end" | "center" | (string & {});
type Intersection = `${Edge} ${Edge}` | Edge;

/**
 * Scroll progress (0 → 1) of `ref` across the viewport. Returns a framer-motion
 * `MotionValue<number>` — read `.get()` inside `useFrame` (no React re-render) or
 * feed it to `useTransform` for DOM animations.
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  offset: [Intersection, Intersection] = ["start start", "end end"],
): MotionValue<number> {
  const { scrollYProgress } = useScroll({ target: ref, offset });
  return scrollYProgress;
}
