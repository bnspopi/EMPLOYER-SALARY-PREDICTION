"use client";
import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { PipelineCard, Profile, Stage } from "@/lib/types";
import { STAGES } from "@/lib/types";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import { CardBody, PipelineCardItem } from "./PipelineCardItem";

const STAGE_LABEL: Record<Stage, string> = {
  saved: "Saved",
  applied: "Applied",
  interviewing: "Interviewing",
  offered: "Offered",
};

const STAGE_TONE: Record<Stage, string> = {
  saved: "text-muted",
  applied: "text-cyan",
  interviewing: "text-gold",
  offered: "text-green",
};

function Column({
  stage,
  cards,
  profile,
}: {
  stage: Stage;
  cards: PipelineCard[];
  profile?: Profile;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  return (
    <div className="flex min-w-0 flex-col">
      <div className="mb-3 flex items-center justify-between">
        <span className={cn("mono-caps", STAGE_TONE[stage])}>{STAGE_LABEL[stage]}</span>
        <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs font-semibold tabular-nums text-muted">
          {cards.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "min-h-[120px] flex-1 rounded-xl2 border border-dashed p-2 transition-colors",
          isOver ? "border-cyan/50 bg-cyan/5" : "border-line/70 bg-bg-2/30",
        )}
      >
        <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <ul className="space-y-2.5">
            {cards.map((card) => (
              <PipelineCardItem key={card.id} card={card} profile={profile} />
            ))}
          </ul>
        </SortableContext>
        {cards.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-dim">Drop cards here</p>
        ) : null}
      </div>
    </div>
  );
}

export function PipelineBoard({ cards, profile }: { cards: PipelineCard[]; profile?: Profile }) {
  const moveCard = useApp((s) => s.moveCard);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const byStage = useMemo(() => {
    const map: Record<Stage, PipelineCard[]> = { saved: [], applied: [], interviewing: [], offered: [] };
    for (const card of cards) map[card.stage].push(card);
    return map;
  }, [cards]);

  const activeCard = activeId ? cards.find((c) => c.id === activeId) ?? null : null;

  function stageOf(id: string): Stage | null {
    if ((STAGES as string[]).includes(id)) return id as Stage;
    return cards.find((c) => c.id === id)?.stage ?? null;
  }

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const target = stageOf(String(over.id));
    const current = cards.find((c) => c.id === String(active.id))?.stage;
    if (target && current && target !== current) {
      moveCard(String(active.id), target);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {STAGES.map((stage) => (
          <Column key={stage} stage={stage} cards={byStage[stage]} profile={profile} />
        ))}
      </div>
      <DragOverlay>{activeCard ? <CardBody card={activeCard} dragging /> : null}</DragOverlay>
    </DndContext>
  );
}
