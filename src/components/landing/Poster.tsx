"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Static image stand-in for a canvas (loading + reduced-motion fallback). Hides
 * itself if the image 404s.
 *
 * `overlay="dim"` adds a dark scrim on top of the vignette, for a plate that
 * stays on screen as a backdrop and must not compete with type laid over it.
 */
export function Poster({
  src,
  alt,
  className,
  overlay = "vignette",
}: {
  src: string;
  alt: string;
  className?: string;
  overlay?: "vignette" | "dim" | "none";
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)} aria-hidden={alt === ""}>
      {!failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onError={() => setFailed(true)}
          className={cn("h-full w-full object-cover", overlay === "dim" ? "opacity-45" : "opacity-80")}
        />
      ) : (
        <div className="grid-bg h-full w-full opacity-40" />
      )}
      {overlay !== "none" ? <div className="vignette pointer-events-none absolute inset-0" /> : null}
      {overlay === "dim" ? <div className="pointer-events-none absolute inset-0 bg-bg/55" /> : null}
    </div>
  );
}
