"use client";
import { useMemo, useState } from "react";
import { Award, Clock, GraduationCap, Route, TrendingUp } from "lucide-react";
import { useApp, useActiveAnalysis } from "@/lib/store";
import { buildGrowthPlan, listRoles, listLocations } from "@/lib/engine";
import { formatMoney } from "@/lib/format";
import type { GrowthPlan } from "@/lib/types";
import { Topbar } from "@/components/dashboard/Topbar";
import { Button } from "@/components/ui/Button";
import { Input, Select, Label } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Gate } from "@/components/ui/Gate";
import {
  DashSkeleton,
  EmptyState,
  SectionHeader,
  StatTile,
  Reveal,
  LEVEL_LABEL,
} from "@/components/dashboard/widgets";
import { cn } from "@/lib/utils";

export function CareerGrowthClient() {
  const hydrated = useApp((s) => s.hydrated);
  const targets = useApp((s) => s.targets);
  const setTargets = useApp((s) => s.setTargets);
  const { analysis } = useActiveAnalysis();

  const roles = useMemo(() => listRoles(), []);
  const locations = useMemo(() => listLocations(), []);

  const [role, setRole] = useState(targets.role ?? "");
  const [salary, setSalary] = useState(targets.salary ? String(targets.salary) : "");
  const [location, setLocation] = useState(targets.location ?? "");

  const [plan, setPlan] = useState<GrowthPlan | null>(null);

  if (!hydrated) {
    return (
      <>
        <Topbar title="Career growth" eyebrow="Plan" />
        <DashSkeleton />
      </>
    );
  }

  if (!analysis) {
    return (
      <>
        <Topbar title="Career growth" eyebrow="Plan" />
        <EmptyState
          icon={Route}
          eyebrow="Want to earn more?"
          title="Analyze a resume to plan your path"
          body="Set a target role, salary and location and PayLens builds a step-by-step growth plan — the level ladder, the skills and certifications to build, and your cumulative salary at each milestone."
          cta={{ href: "/analyze", label: "Analyze my resume" }}
        />
      </>
    );
  }

  const profile = analysis.profile;
  const currency = analysis.estimate.currency;

  function build() {
    if (!analysis) return;
    const targetRole = role.trim() || analysis.estimate.role;
    const parsedSalary = Number(salary.replace(/[^0-9.]/g, ""));
    const next = buildGrowthPlan(profile, {
      role: targetRole,
      salary: Number.isFinite(parsedSalary) && parsedSalary > 0 ? parsedSalary : undefined,
      location: location.trim() || analysis.estimate.location.label,
    });
    setPlan(next);
    setTargets({
      role: targetRole,
      salary: Number.isFinite(parsedSalary) && parsedSalary > 0 ? parsedSalary : undefined,
      location: location.trim() || undefined,
    });
  }

  return (
    <>
      <Topbar title="Career growth" eyebrow="Plan" />

      {/* Form */}
      <Reveal>
        <div className="panel rounded-xl2 p-6 md:p-7">
          <SectionHeader
            eyebrow="Set your target"
            title="Map your path to a higher salary"
            description="Aim at a role and number. We plan the level ladder, skills, courses and certifications to get you there."
            as="h2"
          />
          <div className="grid gap-4 md:grid-cols-[1.4fr_1fr_1.4fr_auto] md:items-end">
            <div>
              <Label>Target role</Label>
              <Input
                list="growth-roles"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder={analysis.estimate.role}
                aria-label="Target role"
              />
              <datalist id="growth-roles">
                {roles.map((r) => (
                  <option key={r} value={r} />
                ))}
              </datalist>
            </div>
            <div>
              <Label>Target salary</Label>
              <Input
                inputMode="numeric"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="e.g. 160000"
                aria-label="Target salary"
              />
            </div>
            <div>
              <Label>Location</Label>
              <Select value={location} onChange={(e) => setLocation(e.target.value)} aria-label="Location">
                <option value="">{analysis.estimate.location.label} (current)</option>
                {locations.map((l) => (
                  <option key={l.label} value={l.label}>
                    {l.label}
                  </option>
                ))}
              </Select>
            </div>
            <Button onClick={build}>
              <Route className="h-4 w-4" aria-hidden /> Build plan
            </Button>
          </div>
        </div>
      </Reveal>

      {plan ? <GrowthResult plan={plan} currentLevel={profile.level} planCurrency={currency} /> : null}
    </>
  );
}

function GrowthResult({
  plan,
  currentLevel,
  planCurrency,
}: {
  plan: GrowthPlan;
  currentLevel: GrowthPlan["ladder"][number]["level"];
  planCurrency: GrowthPlan["currency"];
}) {
  return (
    <>
      {/* Months-to-target header */}
      <Reveal className="mt-6">
        <div className="panel grid-bg relative overflow-hidden rounded-xl2 p-6 md:p-8">
          <div className="vignette pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
            <div className="text-center">
              <div className="display text-6xl tabular-nums text-cyan md:text-7xl">{plan.months}</div>
              <div className="mono-caps mt-1 text-muted">months to target</div>
            </div>
            <div>
              <div className="eyebrow text-cyan">Path to {plan.targetRole}</div>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
                From a current median of{" "}
                <span className="font-semibold text-fg">{formatMoney(plan.currentMedian, plan.currency, { compact: true })}</span>{" "}
                to a target of{" "}
                <span className="font-semibold text-gold">{formatMoney(plan.targetSalary, plan.currency, { compact: true })}</span>{" "}
                — about {plan.months} months at a steady pace of shipping evidence and closing skill gaps.
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <StatTile label="Current median" value={formatMoney(plan.currentMedian, plan.currency, { compact: true })} />
                <StatTile label="Target salary" value={formatMoney(plan.targetSalary, plan.currency, { compact: true })} tone="gold" />
                <StatTile label="Steps" value={`${plan.steps.length}`} sub="skills to build" tone="cyan" />
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Level ladder (visible to everyone) */}
      <section className="mt-10">
        <SectionHeader eyebrow="The ladder" title="Where each level pays" description={`Medians for ${plan.targetRole}, in your market. Your current level is highlighted.`} />
        <div className="grid gap-3 md:grid-cols-4">
          {plan.ladder.map((rung) => {
            const active = rung.level === currentLevel;
            return (
              <div
                key={rung.level}
                className={cn(
                  "panel relative overflow-hidden rounded-xl2 p-5",
                  active && "border-cyan/50 shadow-glow-cyan",
                )}
              >
                {active ? <span className="absolute right-4 top-4"><Badge tone="cyan">You</Badge></span> : null}
                <div className="mono-caps text-dim">{LEVEL_LABEL[rung.level]}</div>
                <div className="display mt-2 text-3xl tabular-nums text-fg">
                  {formatMoney(rung.median, plan.currency, { compact: true })}
                </div>
                <div className="mt-1 text-xs text-muted">{rung.title}</div>
                <div className="mt-1 text-[11px] text-dim">{rung.years}</div>
                <p className="mt-3 text-xs leading-relaxed text-muted">{rung.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Step plan + certifications (Explorer gate) */}
      <section className="mt-12">
        <SectionHeader eyebrow="Sequenced" title="Your step plan" description="Skills, courses, time and your cumulative salary as each gap closes." />
        <Gate feature="careerGrowth">
          <ol className="relative space-y-4 border-l border-line-2 pl-6">
            {plan.steps.map((step) => (
              <li key={step.skill} className="relative">
                <span className="absolute -left-[27px] top-5 h-2.5 w-2.5 rounded-full bg-cyan shadow-glow-cyan" aria-hidden />
                <div className="panel rounded-xl2 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge tone="cyan">Step {step.order}</Badge>
                      <span className="text-sm font-semibold text-fg">{step.skill}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="inline-flex items-center gap-1 text-muted">
                        <Clock className="h-3.5 w-3.5" aria-hidden /> {step.weeks} wks
                      </span>
                      <span className="font-semibold tabular-nums text-green">+{step.upliftPct}%</span>
                      <span className="font-semibold tabular-nums text-gold">
                        {formatMoney(step.cumulativeSalary, planCurrency, { compact: true })}
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{step.milestone}</p>
                  {step.courses.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {step.courses.map((co) => (
                        <span key={co.name} className="inline-flex items-center gap-1.5 rounded-md border border-line bg-bg-2 px-2.5 py-1 text-xs text-muted">
                          <GraduationCap className="h-3.5 w-3.5 text-cyan" aria-hidden /> {co.name}
                          <span className="text-dim">· {co.provider}</span>
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
            {plan.steps.length === 0 ? (
              <li className="text-sm text-dim">You already cover the core skills for this role — focus on scope and evidence.</li>
            ) : null}
          </ol>

          <div className="mt-8">
            <SectionHeader as="h3" eyebrow="For the path" title="Certifications that pay" />
            <div className="grid gap-3 sm:grid-cols-2">
              {plan.certifications.map((c) => (
                <div key={c.name} className="panel flex items-center justify-between gap-3 rounded-xl2 p-4">
                  <span className="flex min-w-0 items-center gap-2">
                    <Award className="h-4 w-4 shrink-0 text-gold" aria-hidden />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-fg">{c.name}</span>
                      <span className="mono-caps text-dim">{c.provider} · {c.duration}</span>
                    </span>
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold tabular-nums text-green">
                    <TrendingUp className="h-3.5 w-3.5" aria-hidden /> +{c.upliftPct}%
                  </span>
                </div>
              ))}
              {plan.certifications.length === 0 ? (
                <div className="panel rounded-xl2 p-4 text-sm text-dim">No high-ROI certifications outstanding.</div>
              ) : null}
            </div>
          </div>
        </Gate>
      </section>
    </>
  );
}
