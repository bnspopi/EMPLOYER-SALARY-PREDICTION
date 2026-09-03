"use client";
import { useMemo, useState } from "react";
import { Briefcase, GitCompare, Map, ScanSearch, Search, SlidersHorizontal } from "lucide-react";
import { useApp, useActiveAnalysis } from "@/lib/store";
import { listLocations, listRoles, searchJobs } from "@/lib/engine";
import type { JobQuery } from "@/lib/types";
import { Topbar } from "@/components/dashboard/Topbar";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Gate } from "@/components/ui/Gate";
import { DashSkeleton, EmptyState, Reveal } from "@/components/dashboard/widgets";
import { JobCard } from "@/components/dashboard/jobs/JobCard";
import { CheckMyFit } from "@/components/dashboard/jobs/CheckMyFit";
import { CompensationMap } from "@/components/dashboard/jobs/CompensationMap";
import { CompareJobs } from "@/components/dashboard/jobs/CompareJobs";
import { cn } from "@/lib/utils";

type Tab = "feed" | "compare";

export function JobSearchClient() {
  const hydrated = useApp((s) => s.hydrated);
  const targets = useApp((s) => s.targets);
  const setTargets = useApp((s) => s.setTargets);
  const pipeline = useApp((s) => s.pipeline);
  const { analysis } = useActiveAnalysis();
  const profile = analysis?.profile;

  const roles = useMemo(() => listRoles(), []);
  const locations = useMemo(() => listLocations(), []);

  const [role, setRole] = useState(targets.role ?? "");
  const [location, setLocation] = useState(targets.location ?? "");
  const [minSalary, setMinSalary] = useState(targets.salary ? String(targets.salary) : "");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [text, setText] = useState("");
  const [tab, setTab] = useState<Tab>("feed");

  const parsedMin = Number(minSalary.replace(/[^0-9.]/g, ""));

  const query = useMemo<JobQuery>(
    () => ({
      role: role.trim() || undefined,
      location: location.trim() || undefined,
      minSalary: Number.isFinite(parsedMin) && parsedMin > 0 ? parsedMin : undefined,
      remoteOnly,
      query: text.trim() || undefined,
    }),
    [role, location, parsedMin, remoteOnly, text],
  );

  const matches = useMemo(() => (hydrated ? searchJobs(query, profile) : []), [hydrated, query, profile]);

  function persist() {
    setTargets({
      role: role.trim() || undefined,
      location: location.trim() || undefined,
      salary: Number.isFinite(parsedMin) && parsedMin > 0 ? parsedMin : undefined,
    });
  }

  const mapRole = role.trim() || profile?.role || "Software Engineer";
  const mapLocation = location.trim() || profile?.location.label || "Remote (US)";

  if (!hydrated) {
    return (
      <>
        <Topbar title="Job search" eyebrow="Jobs" />
        <DashSkeleton />
      </>
    );
  }

  return (
    <>
      <Topbar title="Job search" eyebrow="Jobs" />

      {/* Filters */}
      <Reveal>
        <form
          className="panel rounded-xl2 p-5 md:p-6"
          onSubmit={(e) => {
            e.preventDefault();
            persist();
          }}
        >
          <div className="mb-4 flex items-center gap-2 text-muted">
            <SlidersHorizontal className="h-4 w-4" aria-hidden />
            <span className="mono-caps">Filters</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.3fr_1.3fr_1fr_auto] xl:items-end">
            <div>
              <Label>Role</Label>
              <Input
                list="js-roles"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                onBlur={persist}
                placeholder={profile?.role ?? "e.g. Product Manager"}
                aria-label="Target role"
              />
              <datalist id="js-roles">
                {roles.map((r) => (
                  <option key={r} value={r} />
                ))}
              </datalist>
            </div>
            <div>
              <Label>Location</Label>
              <Input
                list="js-locations"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onBlur={persist}
                placeholder={profile?.location.label ?? "e.g. Remote (US)"}
                aria-label="Location"
              />
              <datalist id="js-locations">
                {locations.map((l) => (
                  <option key={l.label} value={l.label} />
                ))}
              </datalist>
            </div>
            <div>
              <Label>Min salary</Label>
              <Input
                inputMode="numeric"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                onBlur={persist}
                placeholder="e.g. 120000"
                aria-label="Minimum salary"
              />
            </div>
            <label className="flex h-11 items-center gap-2 rounded-md border border-line bg-bg-2 px-3.5 text-sm text-fg">
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={(e) => setRemoteOnly(e.target.checked)}
                className="h-4 w-4 accent-[color:var(--color-cyan)]"
              />
              Remote only
            </label>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Label>Search</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" aria-hidden />
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Company, skill or keyword…"
                  aria-label="Free text search"
                  className="pl-9"
                />
              </div>
            </div>
            <Button type="submit">
              <Search className="h-4 w-4" aria-hidden /> Search
            </Button>
          </div>
        </form>
      </Reveal>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {([
          { id: "feed", label: "Feed", icon: Briefcase },
          { id: "compare", label: "Compare", icon: GitCompare },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-pressed={tab === id}
            className={cn(
              "inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors",
              tab === id ? "border-cyan/40 bg-cyan/10 text-cyan" : "border-line text-muted hover:border-line-2 hover:text-fg",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden /> {label}
            {id === "compare" ? <span className="tabular-nums text-xs text-dim">({pipeline.length})</span> : null}
          </button>
        ))}
      </div>

      {tab === "feed" ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          {/* Feed */}
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-semibold text-fg">
                {matches.length} match{matches.length === 1 ? "" : "es"}
              </h2>
              <span className="mono-caps text-dim">Sorted by fit</span>
            </div>
            {matches.length ? (
              matches.map((m) => <JobCard key={m.job.id} match={m} />)
            ) : (
              <EmptyState
                icon={Briefcase}
                eyebrow="No matches"
                title="Widen your filters"
                body="No listings match every filter. Clear the salary floor, switch off remote-only, or broaden the role and try again."
                cta={{ href: "/dashboard/career-growth", label: "Plan a path instead" }}
              />
            )}
          </div>

          {/* Aside: Check My Fit + Compensation map */}
          <aside className="space-y-6">
            <div className="panel rounded-xl2 p-5">
              <div className="mb-4 flex items-center gap-2">
                <ScanSearch className="h-4 w-4 text-cyan" aria-hidden />
                <h2 className="text-sm font-semibold text-fg">Check my fit</h2>
              </div>
              <Gate feature="checkMyFit" compact>
                <CheckMyFit profile={profile} />
              </Gate>
            </div>

            <div className="panel rounded-xl2 p-5">
              <div className="mb-4 flex items-center gap-2">
                <Map className="h-4 w-4 text-gold" aria-hidden />
                <h2 className="text-sm font-semibold text-fg">Job compensation map</h2>
              </div>
              <Gate feature="compensationMap" compact>
                <CompensationMap role={mapRole} location={mapLocation} />
              </Gate>
            </div>
          </aside>
        </div>
      ) : (
        <div className="mt-6">
          <Gate feature="compareOffers">
            <CompareJobs cards={pipeline} profile={profile} />
          </Gate>
        </div>
      )}
    </>
  );
}
