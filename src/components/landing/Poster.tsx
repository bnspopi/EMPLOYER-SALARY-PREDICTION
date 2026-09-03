"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";

/** Static image stand-in for a canvas (loading + reduced-motion fallback). Hides itself if the image 404s. */
export function Poster({
  src,
  alt,
  className,
  overlay = "vignette",
}: {
  src: string;
  alt: string;
  className?: string;
  overlay?: "vignette" | "none";
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
          className="h-full w-full object-cover opacity-80"
        />
      ) : (
        <div className="grid-bg h-full w-full opacity-40" />
      )}
      {overlay === "vignette" ? <div className="vignette pointer-events-none absolute inset-0" /> : null}
    </div>
  );
}
