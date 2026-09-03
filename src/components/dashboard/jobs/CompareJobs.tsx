"use client";
import { useMemo, useState } from "react";
import { Check, GraduationCap, Lightbulb, Minus } from "lucide-react";
import type { Course, PipelineCard, Profile } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { coursePicks } from "./helpers";

const MAX = 3;

function ownedSet(profile?: Profile): Set<string> {
  return new Set((profile?.skills ?? []).map((s) => s.name.toLowerCase()));
}

export function CompareJobs({ cards, profile }: { cards: PipelineCard[]; profile?: Profile }) {
  const [selected, setSelected] = useState<string[]>(() => cards.slice(0, 2).map((c) => c.id));

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX) return [...prev.slice(1), id];
      return [...prev, id];
    });
  }

  const chosen = useMemo(() => cards.filter((c) => selected.includes(c.id)), [cards, selected]);
  const owned = useMemo(() => ownedSet(profile), [profile]);

  const skillRows = useMemo(() => {
    const map = new Map<string, string>(); // lower → display
    for (const card of chosen) for (const s of card.job.skills) if (!map.has(s.toLowerCase())) map.set(s.toLowerCase(), s);
    return [...map.entries()]
      .map(([key, name]) => ({
        key,
        name,
        owned: owned.has(key),
        needs: chosen.map((c) => c.job.skills.some((s) => s.toLowerCase() === key)),
      }))
      .sort((a, b) => Number(a.owned) - Number(b.owned) || b.needs.filter(Boolean).length - a.needs.filter(Boolean).length);
  }, [chosen, owned]);

  const gapSkills = useMemo(
    () => skillRows.filter((r) => !r.owned && r.needs.some(Boolean)).map((r) => r.name),
    [skillRows],
  );

  const courses = useMemo<Course[]>(() => {
    if (!profile) return [];
    const seen = new Set<string>();
    const out: Course[] = [];
    for (const card of chosen) {
      for (const c of coursePicks(profile, card.job, 4)) {
        if (seen.has(c.name.toLowerCase())) continue;
        seen.add(c.name.toLowerCase());
        out.push(c);
      }
    }
    return out.slice(0, 6);
  }, [chosen, profile]);

  const actions = useMemo(() => {
    if (chosen.length < 2) return [];
    const out: string[] = [];
    const bestFit = [...chosen].sort((a, b) => b.fitScore - a.fitScore)[0];
    const bestPay = [...chosen].sort((a, b) => b.marketMedian - a.marketMedian)[0];
    out.push(`Strongest fit: ${bestFit.job.company} (${bestFit.job.title}) at ${bestFit.fitScore}%.`);
    out.push(
      `Highest market median: ${bestPay.job.company} at ${formatMoney(bestPay.marketMedian, bestPay.job.currency, { compact: true })}.`,
    );
    if (gapSkills.length) {
      const shared = skillRows.filter((r) => !r.owned && r.needs.filter(Boolean).length >= 2).map((r) => r.name);
      if (shared.length) out.push(`Close ${shared.slice(0, 3).join(", ")} first — needed across multiple roles.`);
      else out.push(`Prioritise ${gapSkills.slice(0, 3).join(", ")} to lift your fit.`);
    } else {
      out.push("You already evidence every listed skill — lead with quantified outcomes in your applications.");
    }
    return out;
  }, [chosen, gapSkills, skillRows]);

  if (cards.length < 2) {
    return (
      <div className="panel rounded-xl2 p-6 text-sm text-muted">
        Save at least two jobs from the feed to compare them side by side.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selector */}
      <div>
        <div className="mb-2 text-sm text-muted">Pick 2–3 saved jobs to compare.</div>
        <div className="flex flex-wrap gap-2">
          {cards.map((card) => {
            const on = selected.includes(card.id);
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => toggle(card.id)}
                aria-pressed={on}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                  on ? "border-cyan/50 bg-cyan/10 text-cyan" : "border-line text-muted hover:border-line-2 hover:text-fg",
                )}
              >
                {card.job.company} · {card.job.title}
              </button>
            );
          })}
        </div>
      </div>

      {chosen.length < 2 ? (
        <div className="panel rounded-xl2 p-6 text-sm text-dim">Select two or three jobs above.</div>
      ) : (
        <>
          {/* Skills match table */}
          <div className="panel overflow-x-auto rounded-xl2 p-0">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="p-4 font-medium text-muted">Skill</th>
                  <th className="p-4 text-center font-medium text-muted">You</th>
                  {chosen.map((c) => (
                    <th key={c.id} className="p-4 text-center font-medium text-muted">
                      <span className="block truncate">{c.job.company}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {skillRows.map((row) => (
                  <tr key={row.key} className="border-b border-line/50 last:border-0">
                    <td className="p-4 text-fg">{row.name}</td>
                    <td className="p-4 text-center">
                      {row.owned ? (
                        <Check className="mx-auto h-4 w-4 text-green" aria-label="You have this" />
                      ) : (
                        <Minus className="mx-auto h-4 w-4 text-dim" aria-label="Not evidenced" />
                      )}
                    </td>
                    {row.needs.map((need, i) => (
                      <td key={chosen[i].id} className="p-4 text-center">
                        {need ? (
                          <span
                            className={cn(
                              "inline-block h-2 w-2 rounded-full",
                              row.owned ? "bg-green" : "bg-amber",
                            )}
                            aria-label={need ? (row.owned ? "Required and matched" : "Required — gap") : "Not required"}
                          />
                        ) : (
                          <span className="text-dim" aria-hidden>
                            ·
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Courses to close gaps */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-cyan" aria-hidden />
              <h3 className="text-sm font-semibold text-fg">Courses to close the gaps</h3>
            </div>
            {courses.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {courses.map((c) => (
                  <div key={c.name} className="panel flex items-center justify-between gap-3 rounded-xl2 p-4">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-fg">{c.name}</span>
                      <span className="mono-caps text-dim">
                        {c.provider} · {c.duration}
                      </span>
                    </span>
                    <Badge tone="green">+{c.upliftPct}%</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="panel rounded-xl2 p-4 text-sm text-dim">
                {profile ? "No outstanding skill gaps for these roles." : "Analyze a resume to get course recommendations."}
              </div>
            )}
          </div>

          {/* Recommended actions */}
          <div className="panel rounded-xl2 p-5">
            <div className="mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-gold" aria-hidden />
              <h3 className="text-sm font-semibold text-fg">Recommended actions</h3>
            </div>
            <ul className="space-y-2">
              {actions.map((a) => (
                <li key={a} className="flex items-start gap-2 text-sm text-muted">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
