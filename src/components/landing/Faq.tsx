"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Section, Eyebrow } from "@/components/ui";
import { FAQ } from "@/data/faq";
import { Reveal } from "./Reveal";
import { FAQ_FALLBACK } from "./data";

const ITEMS = FAQ ?? FAQ_FALLBACK;

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Section className="py-24 md:py-32">
      <Reveal>
        <Eyebrow tone="cyan">Questions</Eyebrow>
        <h2 className="display mt-3 text-5xl md:text-7xl">Frequently asked.</h2>
      </Reveal>
      <div className="mx-auto mt-12 max-w-3xl">
        <ul className="flex flex-col divide-y divide-line border-y border-line">
          {ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <li key={item.q}>
                <button
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span className="text-lg font-medium text-fg">{item.q}</span>
                  <Plus
                    className={`h-5 w-5 shrink-0 text-cyan transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
                    aria-hidden
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 pr-9 leading-relaxed text-muted">{item.a}</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}
