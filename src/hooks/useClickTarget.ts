"use client";
import { useEffect, useRef } from "react";

export interface ClickTarget {
  /** normalized device coords of the last click: x -1..1 (left→right), y -1..1 (bottom→top) */
  x: number;
  y: number;
  /** performance.now() of the click, 0 when nothing has been clicked yet */
  at: number;
  /** incremented on every accepted click so consumers can detect a new one */
  seq: number;
}

/**
 * Records clicks in the "top sections" (the hero / nav area) as normalized device
 * coordinates, so the 3D robot can reach out and tap whatever the visitor clicked.
 *
 * Written to a ref — consumers read it inside `useFrame` without re-rendering.
 */
export function useClickTarget(): React.MutableRefObject<ClickTarget> {
  const target = useRef<ClickTarget>({ x: 0, y: 0, at: 0, seq: 0 });

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      // Only react to clicks while the top of the page (hero + nav) is on screen.
      if (window.scrollY > window.innerHeight * 1.8) return;
      const el = e.target as HTMLElement | null;
      // Ignore clicks on form fields so typing never triggers the arm.
      if (el?.closest("input, textarea, select")) return;
      target.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
      target.current.at = performance.now();
      target.current.seq += 1;
    };
    window.addEventListener("pointerdown", onDown, { passive: true });
    return () => window.removeEventListener("pointerdown", onDown);
  }, []);

  return target;
}
