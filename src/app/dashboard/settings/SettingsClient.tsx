"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Lock, ShieldCheck, Trash2 } from "lucide-react";
import { useApp } from "@/lib/store";
import { PLAN_BULLETS, PLAN_META, PLAN_RANK } from "@/lib/plans";
import type { Plan } from "@/lib/types";
import { Topbar } from "@/components/dashboard/Topbar";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { DashSkeleton, SectionHeader } from "@/components/dashboard/widgets";
import { cn } from "@/lib/utils";

const PLANS: Plan[] = ["curious", "explorer", "hunter"];

export function SettingsClient() {
  const router = useRouter();
  const hydrated = useApp((s) => s.hydrated);
  const user = useApp((s) => s.user);
  const signIn = useApp((s) => s.signIn);
  const plan = useApp((s) => s.plan);
  const setPlan = useApp((s) => s.setPlan);
  const billing = useApp((s) => s.billing);
  const setBilling = useApp((s) => s.setBilling);
  const displayNameOverride = useApp((s) => s.displayNameOverride);
  const setDisplayNameOverride = useApp((s) => s.setDisplayNameOverride);
  const deleteAccount = useApp((s) => s.deleteAccount);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [savedAccount, setSavedAccount] = useState(false);
  const [override, setOverride] = useState("");
  const [savedOverride, setSavedOverride] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!hydrated) {
    return (
      <>
        <Topbar title="Settings" eyebrow="Account" />
        <DashSkeleton rows={2} />
      </>
    );
  }

  if (!initialized) {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
    setOverride(displayNameOverride);
    setInitialized(true);
  }

  function saveAccount() {
    signIn({ name: name.trim() || "Guest", email: email.trim() });
    setSavedAccount(true);
    setTimeout(() => setSavedAccount(false), 1800);
  }

  function saveOverride() {
    setDisplayNameOverride(override.trim());
    setSavedOverride(true);
    setTimeout(() => setSavedOverride(false), 1800);
  }

  return (
    <>
      <Topbar title="Settings" eyebrow="Account" />

      {/* Account */}
      <section className="mb-10">
        <SectionHeader as="h3" eyebrow="Account" title="Your details" />
        <div className="panel rounded-xl2 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" aria-label="Name" />
            </div>
            <div>
              <Label hint="stored locally">Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" aria-label="Email" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Button size="sm" onClick={saveAccount}>
              Save account
            </Button>
            {savedAccount ? (
              <span className="flex items-center gap-1 text-xs text-green">
                <Check className="h-4 w-4" aria-hidden /> Saved
              </span>
            ) : null}
          </div>
        </div>
      </section>

      {/* Display name override */}
      <section className="mb-10">
        <SectionHeader as="h3" eyebrow="Reports" title="Display name on reports" description="Replace the name shown on your Salary Brief and reports — useful when sharing a benchmark without your real name." />
        <div className="panel rounded-xl2 p-6">
          <div className="max-w-md">
            <Label hint="leave blank to use “You”">Report display name</Label>
            <Input value={override} onChange={(e) => setOverride(e.target.value)} placeholder="e.g. Candidate A" aria-label="Report display name" />
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Button size="sm" onClick={saveOverride}>
              Save
            </Button>
            {savedOverride ? (
              <span className="flex items-center gap-1 text-xs text-green">
                <Check className="h-4 w-4" aria-hidden /> Saved
              </span>
            ) : null}
          </div>
        </div>
      </section>

      {/* Plan switcher */}
      <section className="mb-10">
        <SectionHeader
          as="h3"
          eyebrow="Plan"
          title="Your plan"
          description="Simulated checkout — switch plans instantly to explore every feature. No card required."
          action={
            <div className="inline-flex rounded-full border border-line bg-bg-2 p-0.5 text-xs">
              {(["monthly", "annual"] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setBilling(b)}
                  className={cn("rounded-full px-3 py-1.5 capitalize transition-colors", billing === b ? "bg-fg text-bg" : "text-muted hover:text-fg")}
                  aria-pressed={billing === b}
                >
                  {b}
                  {b === "annual" ? <span className="ml-1 text-[10px] text-green">−17%</span> : null}
                </button>
              ))}
            </div>
          }
        />
        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((p) => {
            const meta = PLAN_META[p];
            const price = billing === "annual" ? meta.priceAnnual : meta.priceMonthly;
            const current = p === plan;
            const featured = p === "explorer";
            return (
              <div
                key={p}
                className={cn(
                  "relative flex flex-col rounded-xl2 border p-6",
                  current ? "border-cyan/50 bg-cyan/[0.04]" : featured ? "border-gold/30 bg-panel" : "border-line bg-panel",
                )}
              >
                {featured ? <Badge tone="gold" className="absolute right-4 top-4">Most popular</Badge> : null}
                <div className="eyebrow">{meta.name}</div>
                <div className="mt-2 flex items-end gap-1">
                  <span className="display text-4xl tabular-nums">${price}</span>
                  <span className="mb-1 text-xs text-dim">/{billing === "annual" ? "yr" : "mo"}</span>
                </div>
                <p className="mt-1 text-xs text-muted">{meta.tagline}</p>
                <ul className="mt-4 flex-1 space-y-2 text-xs text-muted">
                  {PLAN_BULLETS[p].map((b) => (
                    <li key={b} className="flex gap-2">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan" aria-hidden />
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  {current ? (
                    <Button variant="secondary" size="sm" className="w-full" disabled>
                      Current plan
                    </Button>
                  ) : (
                    <Button variant={featured ? "gold" : "primary"} size="sm" className="w-full" onClick={() => setPlan(p)}>
                      {PLAN_RANK[p] > PLAN_RANK[plan] ? "Upgrade" : "Switch"} to {meta.name}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Privacy */}
      <section className="mb-10">
        <SectionHeader as="h3" eyebrow="Privacy" title="Your data" />
        <div className="panel rounded-xl2 p-6">
          <div className="flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-green/30 bg-green/10 text-green" aria-hidden>
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h4 className="text-sm font-semibold text-fg">Data stays local. Never sold.</h4>
              <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-muted">
                <li className="flex gap-2">
                  <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-dim" aria-hidden /> Everything you enter is stored in your browser (localStorage) — nothing is uploaded to a server.
                </li>
                <li className="flex gap-2">
                  <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-dim" aria-hidden /> Contact details are stripped before any analysis runs.
                </li>
                <li className="flex gap-2">
                  <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-dim" aria-hidden /> We never sell or share your resume data. Delete it any time below.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Delete */}
      <section>
        <SectionHeader as="h3" eyebrow="Danger zone" title="Delete account & data" />
        <div className="rounded-xl2 border border-red/30 bg-red/[0.04] p-6">
          <p className="text-sm text-muted">
            This permanently removes your account, all resume versions, analyses, pipeline and offers from this browser. This cannot be undone.
          </p>
          <div className="mt-4">
            {confirmDelete ? (
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-red">Are you sure? This wipes everything.</span>
                <Button
                  variant="ember"
                  size="sm"
                  onClick={() => {
                    deleteAccount();
                    router.push("/");
                  }}
                >
                  <Trash2 className="h-4 w-4" aria-hidden /> Yes, delete everything
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-4 w-4" aria-hidden /> Delete account & data
              </Button>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
