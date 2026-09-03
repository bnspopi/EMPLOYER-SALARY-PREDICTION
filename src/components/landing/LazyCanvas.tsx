"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Mounts an R3F canvas only when it approaches the viewport (IntersectionObserver),
 * shows a poster until then, and reports `active` (currently on-screen) so the scene
 * can switch to `frameloop="demand"` when scrolled away. Renders the poster forever
 * when `reduced` (prefers-reduced-motion) is set.
 */
export function LazyCanvas({
  poster,
  reduced = false,
  className,
  children,
}: {
  poster: ReactNode;
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
    const near = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setMounted(true);
      },
      { rootMargin: "300px" },
    );
    const on = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0.01 });
    near.observe(el);
    on.observe(el);
    return () => {
      near.disconnect();
      on.disconnect();
    };
  }, [reduced]);

  return (
    <div ref={ref} className={cn("absolute inset-0", className)}>
      {poster}
      {!reduced && mounted ? <div className="absolute inset-0">{children(active)}</div> : null}
    </div>
  );
}
