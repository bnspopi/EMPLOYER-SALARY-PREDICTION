"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, X, Minus, ArrowRight, Lock, CreditCard, Sparkles } from "lucide-react";
import { useApp } from "@/lib/store";
import { PLAN_META, PLAN_BULLETS, PLAN_RANK } from "@/lib/plans";
import type { Plan } from "@/lib/types";
import { Button, Eyebrow } from "@/components/ui";
import { Field } from "@/components/marketing/Field";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";
import { Reveal } from "@/components/marketing/Reveal";
import { cn } from "@/lib/utils";

const ORDER: Plan[] = ["curious", "explorer", "hunter"];

type Cell = boolean | "basic";
interface Row {
  label: string;
  curious: Cell;
  explorer: Cell;
  hunter: Cell;
}
interface Group {
  title: string;
  rows: Row[];
}

/** Comparison table rows — the catalog "fast map" of what each plan unlocks. */
const GROUPS: Group[] = [
  {
    title: "Salary & market value",
    rows: [
      { label: "Basic salary range (floor–ceiling)", curious: true, explorer: true, hunter: true },
      { label: "Market score & percentile overview", curious: true, explorer: true, hunter: true },
      { label: "Skill names detected", curious: true, explorer: true, hunter: true },
      { label: "Exact median + detailed breakdown", curious: false, explorer: true, hunter: true },
      { label: "Skill assessment scores & salary drivers", curious: false, explorer: true, hunter: true },
      { label: "Strengths & improvements analysis", curious: false, explorer: true, hunter: true },
      { label: "Salary Brief for negotiations", curious: false, explorer: true, hunter: true },
      { label: "Salary Brief PDF export", curious: false, explorer: false, hunter: true },
    ],
  },
  {
    title: "Resume & growth",
    rows: [
      { label: "Unlimited analyses", curious: true, explorer: true, hunter: true },
      { label: "Multiple resume versions", curious: true, explorer: true, hunter: true },
      { label: "Gap analysis (resume vs job)", curious: false, explorer: true, hunter: true },
      { label: "Recommended courses & certifications", curious: false, explorer: true, hunter: true },
      { label: "Career growth plan & level ladder", curious: false, explorer: true, hunter: true },
      { label: "Skill Roadmap", curious: false, explorer: "basic", hunter: true },
      { label: "Country comparison (US · CA · UK)", curious: false, explorer: true, hunter: true },
      { label: "AI resume-improvement chat", curious: false, explorer: false, hunter: true },
    ],
  },
  {
    title: "Offers & job search",
    rows: [
      { label: "Job search & personalised feed", curious: true, explorer: true, hunter: true },
      { label: "Offer verdict (below / at / above)", curious: true, explorer: true, hunter: true },
      { label: "Check My Fit & job comp map", curious: false, explorer: true, hunter: true },
      { label: "Compare offers side-by-side", curious: false, explorer: true, hunter: true },
      { label: "Full offer tabs & Decision Helper", curious: false, explorer: false, hunter: true },
      { label: "Negotiation Playbook", curious: false, explorer: false, hunter: true },
      { label: "Jobs Pipeline & Kanban board", curious: false, explorer: false, hunter: true },
      { label: "Application Pack (resume, cover letter, prep)", curious: false, explorer: false, hunter: true },
      { label: "Priority support", curious: false, explorer: false, hunter: true },
    ],
  },
];

const FAQ = [
  {
    q: "Can I try PayLens before paying?",
    a: "Yes. The Curious plan is free forever and gives you unlimited analyses, a basic salary range, your market score and the full skill-name list — no card required. Upgrade only when you want exact medians, negotiation briefs or the pipeline tools.",
  },
  {
    q: "What does the annual plan save me?",
    a: "Billing annually is 17% cheaper than paying month to month — you get two months effectively free. You can switch between monthly and annual at any time, and the change takes effect on your next renewal.",
  },
  {
    q: "Can I change or cancel my plan later?",
    a: "Any time. Upgrades unlock instantly; downgrades take effect at the end of your current period and you keep access until then. There are no cancellation fees and your resume data stays in your browser regardless of plan.",
  },
  {
    q: "Is this the same as the Recruiter plan?",
    a: "No. Curious, Explorer and Hunter are for individuals pricing their own profile. The Recruiter track turns a job description into a hiring benchmark and starts with a 14-day free trial — see the recruiter page.",
  },
];

function CellIcon({ v }: { v: Cell }) {
  if (v === "basic")
    return (
      <span className="mono-caps text-[9px] text-gold" title="Limited on this plan">
        Basic
      </span>
    );
  if (v) return <Check size={16} className="mx-auto text-cyan" aria-label="Included" />;
  return <Minus size={14} className="mx-auto text-dim" aria-label="Not included" />;
}

interface CardState {
  number: string;
  name: string;
  expiry: string;
  cvc: string;
}

export function PricingClient() {
  const hydrated = useApp((s) => s.hydrated);
  const plan = useApp((s) => s.plan);
  const billing = useApp((s) => s.billing);
  const setBilling = useApp((s) => s.setBilling);
  const setPlan = useApp((s) => s.setPlan);
  const user = useApp((s) => s.user);

  const annual = billing === "annual";
  const [checkout, setCheckout] = useState<Plan | null>(null);

  return (
    <>
      {/* Billing toggle */}
      <div className="mb-12 flex flex-col items-center gap-4">
        <div
          role="radiogroup"
          aria-label="Billing period"
          className="inline-flex items-center rounded-full border border-line bg-panel p-1"
        >
          {(["monthly", "annual"] as const).map((b) => (
            <button
              key={b}
              type="button"
              role="radio"
              aria-checked={billing === b}
              onClick={() => setBilling(b)}
              className={cn(
                "relative rounded-full px-5 py-2 text-sm font-medium capitalize transition-colors",
                billing === b ? "text-bg" : "text-muted hover:text-fg",
              )}
            >
              {billing === b ? (
                <motion.span layoutId="billing-pill" className="absolute inset-0 rounded-full bg-fg" transition={{ type: "spring", stiffness: 400, damping: 34 }} />
              ) : null}
              <span className="relative">{b}</span>
            </button>
          ))}
        </div>
        <span className="mono-caps text-[10px] text-gold">Save 17% with annual billing</span>
      </div>

      {/* Plan cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        {ORDER.map((p, i) => {
          const meta = PLAN_META[p];
          const popular = p === "explorer";
          const isCurrent = hydrated && plan === p;
          const price = annual ? meta.priceAnnual / 12 : meta.priceMonthly;
          const canUpgradeTo = !hydrated || PLAN_RANK[p] > PLAN_RANK[plan];
          const isDowngrade = hydrated && PLAN_RANK[p] < PLAN_RANK[plan];
          return (
            <Reveal key={p} delay={i * 0.06}>
              <div
                className={cn(
                  "relative flex h-full flex-col rounded-xl2 border p-6 md:p-7",
                  popular ? "border-gold/50 bg-panel shadow-glow-gold" : "border-line bg-panel",
                )}
              >
                {popular ? (
                  <span className="absolute -top-3 left-6 inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-bg">
                    <Sparkles size={11} /> Most Popular
                  </span>
                ) : null}
                {isCurrent ? (
                  <span className="absolute -top-3 right-6 inline-flex items-center rounded-full border border-cyan/40 bg-cyan/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-cyan">
                    Current plan
                  </span>
                ) : null}

                <div className="eyebrow text-fg">{meta.name}</div>
                <p className="mt-1 text-sm text-muted">{meta.tagline}</p>

                <div className="mt-6 flex items-end gap-1.5">
                  <span className="display text-6xl leading-none tabular-nums">${Math.round(price)}</span>
                  <span className="mb-1.5 text-sm text-dim">/ mo</span>
                </div>
                <p className="mt-1.5 h-4 text-xs text-dim">
                  {p === "curious"
                    ? "Free forever"
                    : annual
                      ? `Billed $${meta.priceAnnual} per year`
                      : "Billed monthly"}
                </p>

                <div className="mt-6">
                  {isCurrent ? (
                    <Button variant="secondary" size="md" className="w-full" disabled>
                      Your current plan
                    </Button>
                  ) : isDowngrade ? (
                    <Button variant="ghost" size="md" className="w-full border border-line" onClick={() => setPlan(p)}>
                      Switch to {meta.name}
                    </Button>
                  ) : p === "curious" ? (
                    <Button href="/analyze" variant="secondary" size="md" className="w-full">
                      Start free
                    </Button>
                  ) : (
                    <Button
                      variant={popular ? "gold" : "primary"}
                      size="md"
                      className="w-full"
                      onClick={() => setCheckout(p)}
                    >
                      {canUpgradeTo ? `Upgrade to ${meta.name}` : `Get ${meta.name}`}
                    </Button>
                  )}
                </div>

                <ul className="mt-7 space-y-3 border-t border-line pt-6">
                  {PLAN_BULLETS[p].map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-sm text-muted">
                      <Check size={15} className={cn("mt-0.5 shrink-0", popular ? "text-gold" : "text-cyan")} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          );
        })}
      </div>

      {/* Recruiter link */}
      <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-xl2 border border-line bg-panel px-6 py-5 md:flex-row">
        <p className="text-sm text-muted">
          Are you a recruiter? See how PayLens benchmarks salaries for hiring teams — 14-day free trial, no card.
        </p>
        <Link href="/for-recruiters" className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-medium text-cyan hover:text-fg">
          PayLens for recruiters <ArrowRight size={15} />
        </Link>
      </div>

      {/* Comparison table */}
      <div className="mt-24">
        <Eyebrow tone="cyan" className="mb-4 text-center">
          Compare every plan
        </Eyebrow>
        <h2 className="display mb-10 text-center text-4xl md:text-5xl">What you get</h2>

        <div className="overflow-x-auto rounded-xl2 border border-line">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line bg-panel">
                <th scope="col" className="px-5 py-4 text-left font-medium text-muted">
                  Feature
                </th>
                {ORDER.map((p) => (
                  <th key={p} scope="col" className="px-4 py-4 text-center">
                    <span className={cn("eyebrow", plan === p && hydrated ? "text-cyan" : "text-fg")}>{PLAN_META[p].name}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {GROUPS.map((g) => (
                <FragmentRows key={g.title} group={g} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ mini */}
      <div className="mx-auto mt-24 max-w-3xl">
        <Eyebrow tone="gold" className="mb-4 text-center">
          Pricing FAQ
        </Eyebrow>
        <h2 className="display mb-8 text-center text-4xl md:text-5xl">Good to know</h2>
        <FaqAccordion items={FAQ} />
      </div>

      {checkout ? <CheckoutModal plan={checkout} annual={annual} onClose={() => setCheckout(null)} onDone={(p) => { setPlan(p); setCheckout(null); }} defaultName={user?.name ?? ""} /> : null}
    </>
  );
}

function FragmentRows({ group }: { group: Group }) {
  return (
    <>
      <tr className="bg-bg-2">
        <th scope="colgroup" colSpan={4} className="px-5 py-3 text-left">
          <span className="mono-caps text-[10px] text-gold">{group.title}</span>
        </th>
      </tr>
      {group.rows.map((r) => (
        <tr key={r.label} className="border-b border-line/60 last:border-0">
          <th scope="row" className="px-5 py-3 text-left font-normal text-fg/90">
            {r.label}
          </th>
          <td className="px-4 py-3 text-center">
            <CellIcon v={r.curious} />
          </td>
          <td className="px-4 py-3 text-center">
            <CellIcon v={r.explorer} />
          </td>
          <td className="px-4 py-3 text-center">
            <CellIcon v={r.hunter} />
          </td>
        </tr>
      ))}
    </>
  );
}

/* ---------- Simulated checkout ---------- */

function luhnValid(num: string) {
  const digits = num.replace(/\s+/g, "");
  if (!/^\d{13,19}$/.test(digits)) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (alt) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function CheckoutModal({
  plan,
  annual,
  onClose,
  onDone,
  defaultName,
}: {
  plan: Plan;
  annual: boolean;
  onClose: () => void;
  onDone: (p: Plan) => void;
  defaultName: string;
}) {
  const meta = PLAN_META[plan];
  const total = annual ? meta.priceAnnual : meta.priceMonthly;
  const [card, setCard] = useState<CardState>({ number: "", name: defaultName, expiry: "", cvc: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof CardState, string>>>({});
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");

  const set = (k: keyof CardState) => (v: string) => setCard((c) => ({ ...c, [k]: v }));

  function validate(c: CardState): Partial<Record<keyof CardState, string>> {
    const e: Partial<Record<keyof CardState, string>> = {};
    if (!luhnValid(c.number)) e.number = "Enter a valid 16-digit card number.";
    if (c.name.trim().length < 2) e.name = "Enter the name on the card.";
    if (!/^(0[1-9]|1[0-2])\s*\/\s*\d{2}$/.test(c.expiry)) e.expiry = "Use MM/YY.";
    else {
      const [mm, yy] = c.expiry.split("/").map((s) => parseInt(s, 10));
      const exp = new Date(2000 + yy, mm, 0, 23, 59, 59);
      if (exp.getTime() < Date.now()) e.expiry = "Card has expired.";
    }
    if (!/^\d{3,4}$/.test(c.cvc)) e.cvc = "3–4 digits.";
    return e;
  }

  function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const errs = validate(card);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStatus("processing");
    window.setTimeout(() => {
      setStatus("done");
      window.setTimeout(() => onDone(plan), 900);
    }, 1100);
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-bg/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Upgrade to ${meta.name}`}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-xl2 border border-line bg-panel p-6 shadow-panel md:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="eyebrow text-gold">Upgrade · {meta.name}</div>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              ${total}
              <span className="ml-1.5 text-sm font-normal text-dim">{annual ? "/ year" : "/ month"}</span>
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-md text-muted hover:bg-white/5 hover:text-fg">
            <X size={18} />
          </button>
        </div>

        {status === "done" ? (
          <div className="py-8 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-green/15 text-green">
              <Check size={26} />
            </div>
            <p className="mt-4 text-lg font-semibold">You&apos;re on {meta.name}.</p>
            <p className="mt-1 text-sm text-muted">Every {meta.name} feature is unlocked.</p>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-4">
            <Field id="card-number" label="Card number" error={errors.number}>
              <div className="relative">
                <CreditCard size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
                <input
                  id="card-number"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="4242 4242 4242 4242"
                  value={card.number}
                  onChange={(e) => set("number")(e.target.value.replace(/[^\d ]/g, "").slice(0, 23))}
                  aria-invalid={!!errors.number}
                  className="w-full rounded-md border border-line bg-bg-2 py-2.5 pl-9 pr-3.5 text-sm tabular-nums text-fg placeholder:text-dim focus:border-cyan/60 focus:outline-none"
                />
              </div>
            </Field>
            <Field id="card-name" label="Name on card" error={errors.name}>
              <input
                id="card-name"
                autoComplete="cc-name"
                placeholder="Jordan Ellis"
                value={card.name}
                onChange={(e) => set("name")(e.target.value)}
                aria-invalid={!!errors.name}
                className="w-full rounded-md border border-line bg-bg-2 px-3.5 py-2.5 text-sm text-fg placeholder:text-dim focus:border-cyan/60 focus:outline-none"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field id="card-expiry" label="Expiry" error={errors.expiry}>
                <input
                  id="card-expiry"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="MM/YY"
                  value={card.expiry}
                  onChange={(e) => set("expiry")(e.target.value.replace(/[^\d/]/g, "").slice(0, 5))}
                  aria-invalid={!!errors.expiry}
                  className="w-full rounded-md border border-line bg-bg-2 px-3.5 py-2.5 text-sm tabular-nums text-fg placeholder:text-dim focus:border-cyan/60 focus:outline-none"
                />
              </Field>
              <Field id="card-cvc" label="CVC" error={errors.cvc}>
                <input
                  id="card-cvc"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  placeholder="123"
                  value={card.cvc}
                  onChange={(e) => set("cvc")(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  aria-invalid={!!errors.cvc}
                  className="w-full rounded-md border border-line bg-bg-2 px-3.5 py-2.5 text-sm tabular-nums text-fg placeholder:text-dim focus:border-cyan/60 focus:outline-none"
                />
              </Field>
            </div>

            <Button type="submit" variant="gold" size="md" className="w-full" disabled={status === "processing"}>
              {status === "processing" ? "Processing…" : `Pay $${total} & upgrade`}
            </Button>
            <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-dim">
              <Lock size={11} /> Simulated checkout — no real card is charged.
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
}
