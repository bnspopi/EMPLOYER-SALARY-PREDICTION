"use client";
import { useEffect, useRef } from "react";

export interface PointerState {
  /** -1 (left) .. 1 (right) */
  x: number;
  /** -1 (top) .. 1 (bottom) */
  y: number;
}

/**
 * Global pointer position normalized to [-1, 1] on both axes, written to a ref
 * so consumers (e.g. R3F `useFrame`) can read it every frame without re-rendering.
 */
export function usePointer(): React.MutableRefObject<PointerState> {
  const pointer = useRef<PointerState>({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  return pointer;
}
