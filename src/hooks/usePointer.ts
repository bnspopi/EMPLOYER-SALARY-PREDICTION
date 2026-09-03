"use client";
import { useEffect, type RefObject } from "react";
import { useMotionValue, type MotionValue } from "framer-motion";

export interface PointerValues {
  /** -1 (left) .. 1 (right) */
  x: MotionValue<number>;
  /** -1 (bottom) .. 1 (top) */
  y: MotionValue<number>;
}

const clamp1 = (n: number) => (n < -1 ? -1 : n > 1 ? 1 : n);

/**
 * Normalised pointer position as motion values (no re-renders).
 * Relative to the viewport by default, or to `target` when a ref is given.
 * Touch input is ignored so the values rest at 0 on phones; leaving the window resets to 0.
 */
export function usePointer(target?: RefObject<HTMLElement | null>): PointerValues {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    const el = target?.current ?? null;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      let nx: number;
      let ny: number;
      if (el) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return;
        nx = ((e.clientX - r.left) / r.width) * 2 - 1;
        ny = -(((e.clientY - r.top) / r.height) * 2 - 1);
      } else {
        nx = (e.clientX / window.innerWidth) * 2 - 1;
        ny = -((e.clientY / window.innerHeight) * 2 - 1);
      }
      x.set(clamp1(nx));
      y.set(clamp1(ny));
    };
    const onLeave = () => {
      x.set(0);
      y.set(0);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [target, x, y]);

  return { x, y };
}
