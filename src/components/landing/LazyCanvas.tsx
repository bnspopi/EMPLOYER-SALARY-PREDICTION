"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Mounts an R3F canvas only when it approaches the viewport (IntersectionObserver),
 * shows a poster until then, and reports `active` (currently on-screen) so the scene
 * can switch to `frameloop="demand"` when scrolled away. Once the canvas scrolls far
 * out of view (past a wider margin) it unmounts so R3F disposes the WebGL context —
 * keeping at most one live context around the viewport instead of three for the
 * session. Renders the poster forever when `reduced` (prefers-reduced-motion) is set.
 *
 * `poster` stays mounted throughout, so it must be a backdrop the live scene can
 * sit on top of. Pass `still` when the standalone fallback should show something
 * the backdrop deliberately leaves out — the subject the 3D scene draws, which
 * would otherwise be doubled behind the canvas.
 */
export function LazyCanvas({
  poster,
  still,
  reduced = false,
  className,
  children,
}: {
  poster: ReactNode;
  still?: ReactNode;
  reduced?: boolean;
  className?: string;
  children: (active: boolean) => ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    // Mount when within 300px of the viewport.
    const near = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setMounted(true);
      },
      { rootMargin: "300px" },
    );
    // Unmount (release the GL context) only once well past the viewport (1200px),
    // giving hysteresis so scrolling near the boundary doesn't thrash mount state.
    const far = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) setMounted(false);
      },
      { rootMargin: "1200px" },
    );
    const on = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0.01 });
    near.observe(el);
    far.observe(el);
    on.observe(el);
    return () => {
      near.disconnect();
      far.disconnect();
      on.disconnect();
    };
  }, [reduced]);

  return (
    <div ref={ref} className={cn("absolute inset-0", className)}>
      {poster}
      {!reduced && mounted ? (
        <div className="absolute inset-0">{children(active)}</div>
      ) : (
        still ?? null
      )}
    </div>
  );
}
