"use client";
import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * The Proof-of-Work set: a photograph of a presenter talking to a cinema camera on
 * a lit studio floor. It is a real photograph rather than a modelled figure — a
 * procedural body reads as a mannequin at this size, and the section only needs
 * him to be believably *there*.
 *
 * A slow scroll-driven push and drift give it life (a cinemagraph rather than a
 * still), and the bulbs flicker faintly on their own. If the generated plate has
 * not been committed yet, it falls back to the empty studio backdrop.
 */
export function PresenterBackdrop({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [src, setSrc] = useState("/images/presenter-studio.jpg");
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.14, 1.02]);
  const y = useTransform(scrollYProgress, [0, 1], ["-3%", "3%"]);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <motion.img
        src={src}
        alt=""
        aria-hidden
        onError={() => setSrc("/images/studio-backdrop.jpg")}
        style={reduced ? undefined : { scale, y }}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* faint tungsten flicker over the bulbs */}
      {!reduced ? (
        <motion.div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_35%,rgba(255,164,81,0.16),transparent_60%)]"
          animate={{ opacity: [0.55, 0.85, 0.62, 0.9, 0.6] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : null}
    </div>
  );
}
