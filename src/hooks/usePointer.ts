"use client";
import { useEffect, useRef } from "react";

export interface PointerState {
  /** -1 (left) .. 1 (right) */
  x: number;
  /** -1 (top) .. 1 (bottom) */
  y: number;
  /** true once the visitor has actually moved a pointer (so idle scenes can drift instead) */
  moved: boolean;
}

/**
 * Global pointer position normalized to [-1, 1] on both axes, written to a ref
 * so consumers (e.g. R3F `useFrame`) can read it every frame without re-rendering.
 *
 * Listens on `window` in the capture phase for both `pointermove` and `mousemove`
 * so the value keeps updating even when the cursor is over an overlay that sits
 * above the canvas (the hero HUD panels) or over an element that stops propagation.
 */
export function usePointer(): React.MutableRefObject<PointerState> {
  const pointer = useRef<PointerState>({ x: 0, y: 0, moved: false });

  useEffect(() => {
    const set = (clientX: number, clientY: number) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      pointer.current.x = (clientX / w) * 2 - 1;
      pointer.current.y = (clientY / h) * 2 - 1;
      pointer.current.moved = true;
    };
    const onPointer = (e: PointerEvent) => set(e.clientX, e.clientY);
    const onMouse = (e: MouseEvent) => set(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) set(t.clientX, t.clientY);
    };
    window.addEventListener("pointermove", onPointer, { passive: true, capture: true });
    window.addEventListener("mousemove", onMouse, { passive: true, capture: true });
    window.addEventListener("touchmove", onTouch, { passive: true, capture: true });
    return () => {
      window.removeEventListener("pointermove", onPointer, true);
      window.removeEventListener("mousemove", onMouse, true);
      window.removeEventListener("touchmove", onTouch, true);
    };
  }, []);

  return pointer;
}
