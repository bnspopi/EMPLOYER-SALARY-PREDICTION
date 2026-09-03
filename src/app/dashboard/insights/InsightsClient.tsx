"use client";
import { useMemo, useState } from "react";
import { Activity, Globe, LineChart as LineIcon, MapPin, TrendingDown, TrendingUp } from "lucide-react";
import { useApp, useActiveAnalysis } from "@/lib/store";
import { getInsights, listRoles, listLocations } from "@/lib/engine";
import { formatMoney } from "@/lib/format";
import type { InsightsReport } from "@/lib/types";
import { Topbar } from "@/components/dashboard/Topbar";
import { Select, Label } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Gate } from "@/components/ui/Gate";
import { DashSkeleton, EmptyState, SectionHeader, StatTile, Reveal } from "@/components/dashboard/widgets";
import { CityPremiumChart, DemandChart, TrendChart } from "@/components/dashboard/insights/Charts";

const MARKET_EXPLAIN: Record<InsightsReport["marketLabel"], string> = {
  "Critically Undersupplied": "Far more open roles than qualified candidates — strong leverage to name your number.",
  "Highly Competitive": "Candidates outnumber roles, but demand is healthy — a sharp, evidenced résumé still wins.",
  Competitive: "A balanced-to-tight market — differentiate on specialist skills and quantified impact.",
  Balanced: "Supply and demand are roughly matched — fit and evidence decide the outcome.",
  Saturated: "Many candidates per role — lean hard on niche skills and referrals to stand out.",
};

const LABEL_TONE: Record<InsightsReport["marketLabel"], "green" | "cyan" | "gold" | "amber" | "red"> = {
  "Critically Undersupplied": "green",
  "Highly Competitive": "amber",
  Competitive: "cyan",
  Balanced: "gold",
  Saturated: "red",
};

export function InsightsClient() {
  const hydrated = useApp((s) => s.hydrated);
  const { analysis } = useActiveAnalysis();

  const roles = useMemo(() => listRoles(), []);
  const locations = useMemo(() => listLocations(), []);

  const defaultRole = analysis?.estimate.role ?? "";
  const defaultLocation = analysis?.estimate.location.label ?? "";

  const [role, setRole] = useState(defaultRole);
  const [location, setLocation] = useState(defaultLocation);

  const report = useMemo<InsightsReport | null>(() => {
    if (!hydrated || !analysis) return null;
    return getInsights(role || analysis.estimate.role, location || analysis.estimate.location.label, analysis.profile);
  }, [hydrated, analysis, role, location]);

  if (!hydrated) {
    return (
      <>
        <Topbar title="Market insights" eyebrow="Trends" />
        <DashSkeleton />
      </>
    );
  }

  if (!analysis || !report) {
    return (
      <>
        <Topbar title="Market insights" eyebrow="Trends" />
        <EmptyState
          icon={LineIcon}
          eyebrow="Trends & demand"
          title="Analyze a resume to see the market"
          body="Once we know your role and region, PayLens charts the 12-month salary trend, demand shifts, emerging skills, remote-vs-city premiums and a US/CA/UK comparison."
          cta={{ href: "/analyze", label: "Analyze my resume" }}
        />
      </>
    );
  }

  const sd = report.supplyDemandRatio;

  return (
    <>
      <Topbar title="Market insights" eyebrow="Trends" />

      {/* Selectors */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 md:max-w-2xl">
        <div>
          <Label>Role</Label>
          <Select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Role">
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Location</Label>
          <Select value={location} onChange={(e) => setLocation(e.target.value)} aria-label="Location">
            {locations.map((l) => (
              <option key={l.label} value={l.label}>
                {l.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <Reveal>
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <h2 className="display text-3xl md:text-4xl">{report.role}</h2>
          <span className="text-sm text-muted">{report.location}</span>
          <Badge tone={LABEL_TONE[report.marketLabel]}>{report.marketLabel}</Badge>
        </div>
      </Reveal>

      {/* Trend + demand charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Reveal>
          <div className="panel rounded-xl2 p-6">
            <div className="mb-4 flex items-center gap-2 text-muted">
              <LineIcon className="h-4 w-4 text-cyan" aria-hidden />
              <span className="eyebrow">12-month median trend</span>
            </div>
            <TrendChart data={report.trend} currency={report.currency} />
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <div className="panel rounded-xl2 p-6">
            <div className="mb-4 flex items-center gap-2 text-muted">
              <Activity className="h-4 w-4 text-gold" aria-hidden />
              <span className="eyebrow">Hiring demand index</span>
            </div>
            <DemandChart data={report.trend} />
          </div>
        </Reveal>
      </div>

      {/* Supply/demand + active roles */}
      <div className="mt-4 grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <Reveal>
          <div className="panel rounded-xl2 p-6">
            <SectionHeader as="h3" eyebrow="Supply & demand" title={`${sd.toFixed(2)} : 1`} />
            <p className="text-sm leading-relaxed text-muted">
              About <span className="font-semibold text-fg">{sd.toFixed(1)}</span> candidates per open role —{" "}
              <span className="font-semibold text-fg">{report.marketLabel}</span>. {MARKET_EXPLAIN[report.marketLabel]}
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <StatTile
            label="Active roles · US"
            value={report.activeRoles.toLocaleString("en-US")}
            sub="open postings tracked"
            tone="cyan"
            className="h-full"
          />
        </Reveal>
      </div>

      {/* Emerging vs declining skills */}
      <section className="mt-12">
        <SectionHeader eyebrow="Skill movement" title="Emerging vs declining" description="Which skills are gaining or losing salary pull in this role, year over year." />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="panel rounded-xl2 p-6">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green" aria-hidden />
              <h3 className="text-sm font-semibold text-green">Emerging</h3>
            </div>
            <ul className="space-y-3">
              {report.emergingSkills.map((s) => (
                <li key={s.skill} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-fg">{s.skill}</span>
                  <span className="tabular-nums font-semibold text-green">+{s.growthPct}%</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="panel rounded-xl2 p-6">
            <div className="mb-4 flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red" aria-hidden />
              <h3 className="text-sm font-semibold text-red">Declining</h3>
            </div>
            <ul className="space-y-3">
              {report.decliningSkills.map((s) => (
                <li key={s.skill} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-fg">{s.skill}</span>
                  <span className="tabular-nums font-semibold text-red">
                    {s.changePct > 0 ? "+" : ""}
                    {s.changePct}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Remote vs city premium */}
      <section className="mt-12">
        <SectionHeader
          eyebrow="Location premium"
          title="Remote vs city"
          description={`Remote pays about ${report.remotePremiumPct > 0 ? "+" : ""}${report.remotePremiumPct}% versus the regional average. City premiums vs that baseline:`}
        />
        <div className="panel rounded-xl2 p-6">
          <CityPremiumChart data={report.cityPremiums} currency={report.currency} />
        </div>
      </section>

      {/* Country comparison */}
      <section className="mt-12">
        <SectionHeader
          eyebrow="Across markets"
          title="Country comparison"
          description="The same role priced across the US, Canada and the UK — in local currency and normalized to USD."
        />
        <Gate feature="countryComparison">
          <div className="panel overflow-hidden rounded-xl2">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-line text-left">
                    <th className="px-4 py-3 font-medium text-muted">Country</th>
                    <th className="px-4 py-3 font-medium text-muted">Currency</th>
                    <th className="px-4 py-3 text-right font-medium text-muted">Median (local)</th>
                    <th className="px-4 py-3 text-right font-medium text-muted">Median (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  {report.countryComparison.map((c) => (
                    <tr key={c.country} className="border-b border-line/60 last:border-0">
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2 font-medium text-fg">
                          {c.country === report.countryComparison[0].country ? (
                            <Globe className="h-4 w-4 text-cyan" aria-hidden />
                          ) : (
                            <MapPin className="h-4 w-4 text-dim" aria-hidden />
                          )}
                          {c.country}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted">{c.currency}</td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums text-fg">
                        {formatMoney(c.median, c.currency)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted">{formatMoney(c.medianUSD, "USD")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Gate>
      </section>
    </>
  );
}
