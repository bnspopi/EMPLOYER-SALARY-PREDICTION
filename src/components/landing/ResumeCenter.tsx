"use client";
import { motion } from "framer-motion";
import { Section, Eyebrow } from "@/components/ui";
import { formatMoney } from "@/lib/format";
import { Reveal } from "./Reveal";
import { CountUp } from "./CountUp";
import { CENTER_BULLETS, CENTER_RANGE, CENTER_TARGETS } from "./data";

const EASE = [0.22, 1, 0.36, 1] as const;

function Bar({ label, amount, width, tone }: { label: string; amount: number; width: number; tone: "muted" | "cyan" | "gold" }) {
  const barColor = tone === "cyan" ? "bg-cyan" : tone === "gold" ? "bg-gold" : "bg-line-2";
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="mono-caps text-[10px] text-muted">{label}</span>
        <span className="tabular-nums text-sm font-semibold text-fg">{formatMoney(amount, "USD", { compact: true })}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-panel-2">
        <motion.div
          className={`h-full rounded-full ${barColor}`}
          initial={{ width: 0 }}
          whileInView={{ width: `${width}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: EASE }}
        />
      </div>
    </div>
  );
}

export function ResumeCenter() {
  return (
    <Section wide className="border-t border-line py-24 md:py-32">
      <div className="grid items-center gap-14 md:grid-cols-2">
        <Reveal>
          <Eyebrow tone="cyan">One upload. A complete picture.</Eyebrow>
          <h2 className="display mt-3 text-5xl md:text-6xl">The resume is the center.</h2>
          <p className="mt-4 max-w-md text-muted">
            Everything the platform does is priced from your actual skills — not a title, not a survey average.
          </p>
          <ul className="mt-8 flex flex-col gap-2.5">
            {CENTER_BULLETS.map((b) => (
              <li key={b} className="flex items-center gap-3 text-fg">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan" aria-hidden />
                {b}
              </li>
            ))}
          </ul>
        </Reveal>

        <div className="flex flex-col gap-5">
          <Reveal delay={0.1}>
            <div className="panel rounded-xl2 p-6">
              <div className="flex items-center justify-between">
                <div className="eyebrow">Market salary range</div>
                <div className="mono-caps text-dim">Senior PM · LA</div>
              </div>
              <div className="mt-3 display text-5xl leading-none tabular-nums text-cyan">
                <CountUp value={CENTER_RANGE.median / 1000} suffix="K" />
                <span className="text-fg/40">/yr median</span>
              </div>
              <div className="mt-6 flex flex-col gap-4">
                <Bar label="Floor" amount={CENTER_RANGE.floor} width={72} tone="muted" />
                <Bar label="Median" amount={CENTER_RANGE.median} width={84} tone="cyan" />
                <Bar label="Ceiling" amount={CENTER_RANGE.ceiling} width={96} tone="muted" />
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="panel rounded-xl2 p-6">
              <div className="eyebrow">Negotiation targets</div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { k: "Your floor", v: CENTER_TARGETS.floor, tone: "text-muted" },
                  { k: "Target ask", v: CENTER_TARGETS.target, tone: "text-cyan" },
                  { k: "Stretch goal", v: CENTER_TARGETS.stretch, tone: "text-gold" },
                ].map((t) => (
                  <div key={t.k} className="rounded-lg border border-line bg-panel-2 p-3 text-center">
                    <div className={`display text-2xl leading-none tabular-nums ${t.tone}`}>
                      {formatMoney(t.v, "USD", { compact: true })}
                    </div>
                    <div className="mono-caps mt-1.5 text-[9px] text-dim">{t.k}</div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-dim">+ Opening script · Counter-tactics · Total potential gain</p>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
