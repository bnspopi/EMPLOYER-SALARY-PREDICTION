"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { NAV_DELAY_MS } from "@/lib/gesture";

export interface ClickTarget {
  /** normalized device coords of the last click: x -1..1 (left→right), y -1..1 (bottom→top) */
  x: number;
  y: number;
  /** performance.now() of the click, 0 when nothing has been clicked yet */
  at: number;
  /** incremented on every accepted click so consumers can detect a new one */
  seq: number;
}

/** Only a plain left-click on an in-app link should wait for the robot. */
function escortable(e: MouseEvent): string | null {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return null;
  const link = (e.target as HTMLElement | null)?.closest("a");
  if (!link || link.hasAttribute("download")) return null;
  const target = link.getAttribute("target");
  if (target && target !== "_self") return null;
  const href = link.getAttribute("href");
  // Same-app paths only: never hold up an external link or an in-page anchor.
  if (!href || !href.startsWith("/") || href.startsWith("//")) return null;
  return href;
}

/**
 * Records clicks in the "top sections" (the hero / nav area) as normalized device
 * coordinates, so the 3D robot can reach out and tap whatever the visitor clicked
 * — and holds the resulting navigation until it has.
 *
 * Without the hold the gesture is invisible on the links that matter: clicking a
 * nav item swaps the page on the next frame, so the robot is unmounted a few
 * milliseconds into a reach that takes over a second. Here the link is
 * intercepted, the robot reaches out and presses it, the contact ripple lands,
 * and only then does the section open.
 *
 * The click target is written to a ref — consumers read it inside `useFrame`
 * without re-rendering.
 */
export function useClickTarget(): React.MutableRefObject<ClickTarget> {
  const target = useRef<ClickTarget>({ x: 0, y: 0, at: 0, seq: 0 });
  const pending = useRef(0);
  const router = useRouter();

  useEffect(() => {
    /** True while the hero — and so the robot — is still on screen. */
    const inHero = () => window.scrollY <= window.innerHeight * 1.8;

    // Start the reach on press, so the arm answers the moment you click.
    const onDown = (e: PointerEvent) => {
      if (!inHero()) return;
      const el = e.target as HTMLElement | null;
      // Ignore clicks on form fields so typing never triggers the arm.
      if (el?.closest("input, textarea, select")) return;
      target.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
      target.current.at = performance.now();
      target.current.seq += 1;
    };

    const onClick = (e: MouseEvent) => {
      // A second click while the robot is mid-reach goes straight through, so a
      // visitor in a hurry is never held up by the animation.
      if (pending.current) {
        clearTimeout(pending.current);
        pending.current = 0;
        return;
      }
      if (!inHero()) return;
      const href = escortable(e);
      if (!href) return;
      e.preventDefault();
      pending.current = window.setTimeout(() => {
        pending.current = 0;
        router.push(href);
      }, NAV_DELAY_MS);
    };

    window.addEventListener("pointerdown", onDown, { passive: true });
    // Capture phase, so this runs before the Link's own handler.
    window.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("click", onClick, true);
      if (pending.current) clearTimeout(pending.current);
    };
  }, [router]);

  return target;
}
