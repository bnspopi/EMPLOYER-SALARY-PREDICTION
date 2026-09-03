"use client";
import { useMemo } from "react";
import { KanbanSquare } from "lucide-react";
import type { Stage } from "@/lib/types";
import { STAGES } from "@/lib/types";
import { useApp, useActiveAnalysis } from "@/lib/store";
import { Topbar } from "@/components/dashboard/Topbar";
import { Gate } from "@/components/ui/Gate";
import { DashSkeleton, EmptyState, Reveal } from "@/components/dashboard/widgets";
import { PipelineBoard } from "@/components/dashboard/jobs/board/PipelineBoard";

const STAGE_LABEL: Record<Stage, string> = {
  saved: "Saved",
  applied: "Applied",
  interviewing: "Interviewing",
  offered: "Offered",
};

export function PipelineClient() {
  const hydrated = useApp((s) => s.hydrated);
  const pipeline = useApp((s) => s.pipeline);
  const { analysis } = useActiveAnalysis();
  const profile = analysis?.profile;

  const counts = useMemo(() => {
    const c: Record<Stage, number> = { saved: 0, applied: 0, interviewing: 0, offered: 0 };
    for (const card of pipeline) c[card.stage] += 1;
    return c;
  }, [pipeline]);

  if (!hydrated) {
    return (
      <>
        <Topbar title="Pipeline" eyebrow="Jobs" />
        <DashSkeleton />
      </>
    );
  }

  return (
    <>
      <Topbar title="Pipeline" eyebrow="Jobs" />
      <Gate feature="pipeline">
        {pipeline.length === 0 ? (
          <EmptyState
            icon={KanbanSquare}
            eyebrow="Your job search, organised"
            title="Your pipeline is empty"
            body="Save roles from the job feed and they land here. Drag cards across Saved → Applied → Interviewing → Offered, add notes, and open a tailored application pack for each."
            cta={{ href: "/dashboard/job-search", label: "Find jobs to save" }}
          />
        ) : (
          <>
            <Reveal>
              <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {STAGES.map((stage) => (
                  <div key={stage} className="panel rounded-xl2 p-4">
                    <div className="mono-caps text-dim">{STAGE_LABEL[stage]}</div>
                    <div className="display mt-1 text-3xl tabular-nums text-fg">{counts[stage]}</div>
                  </div>
                ))}
              </div>
            </Reveal>
            <p className="mb-4 text-xs text-dim">
              Drag a card by its handle, or use the card menu to move, add notes, view level benchmarks and course picks, or open its application pack.
            </p>
            <PipelineBoard cards={pipeline} profile={profile} />
          </>
        )}
      </Gate>
    </>
  );
}
