"use client";
import { useEffect, useRef, type ReactNode } from "react";
import type { MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

function isMotionValue(v: unknown): v is MotionValue<number> {
  return typeof v === "object" && v !== null && typeof (v as { on?: unknown }).on === "function" && typeof (v as { get?: unknown }).get === "function";
}

/**
 * Scroll-scrubbed film. When `src` is a URL, renders a muted, inline <video> and
 * seeks `currentTime = progress * duration` (rAF-throttled, seeks coalesced).
 * When `src` is null it renders `children` (the 3D scene) instead.
 */
export function ScrollFilm({
  src,
  poster,
  progress,
  className,
  children,
}: {
  src: string | null;
  poster?: string;
  progress: MotionValue<number> | number;
  className?: string;
  children?: ReactNode;
}) {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!src) return;
    const el = video.current;
    if (!el) return;
    let raf = 0;
    let seeking = false;
    let pending = 0;

    const apply = () => {
      raf = 0;
      const d = el.duration;
      if (!d || Number.isNaN(d)) return;
      if (seeking) {
        raf = requestAnimationFrame(apply);
        return;
      }
      const target = Math.max(0, Math.min(0.999, pending)) * d;
      if (Math.abs(el.currentTime - target) > 0.03) {
        seeking = true;
        el.currentTime = target;
      }
    };
    const onSeeked = () => {
      seeking = false;
    };
    el.addEventListener("seeked", onSeeked);

    const schedule = (v: number) => {
      pending = v;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    let unsub: (() => void) | undefined;
    if (isMotionValue(progress)) {
      schedule(progress.get());
      unsub = progress.on("change", schedule);
    } else {
      schedule(progress);
    }

    return () => {
      el.removeEventListener("seeked", onSeeked);
      if (raf) cancelAnimationFrame(raf);
      unsub?.();
    };
  }, [src, progress]);

  if (!src) return <div className={cn("absolute inset-0", className)}>{children}</div>;

  return (
    <video
      ref={video}
      className={cn("absolute inset-0 h-full w-full object-cover", className)}
      src={src}
      poster={poster}
      muted
      playsInline
      preload="auto"
      aria-hidden
    />
  );
}
