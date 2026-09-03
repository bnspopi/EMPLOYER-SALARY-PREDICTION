"use client";
import { useState } from "react";
import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BarChart3, ClipboardList, GripVertical, MapPin, MoreHorizontal, StickyNote, Trash2 } from "lucide-react";
import type { PipelineCard, Profile, Stage } from "@/lib/types";
import { STAGES } from "@/lib/types";
import { useApp } from "@/lib/store";
import { formatMoney } from "@/lib/format";
import { Textarea } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { FitRing } from "../FitRing";
import { BenchmarksDrawer } from "./BenchmarksDrawer";

const STAGE_LABEL: Record<Stage, string> = {
  saved: "Saved",
  applied: "Applied",
  interviewing: "Interviewing",
  offered: "Offered",
};

/** Static card body — shared by the sortable card and the drag overlay. */
export function CardBody({ card, dragging = false }: { card: PipelineCard; dragging?: boolean }) {
  return (
    <div className={cn("rounded-lg border border-line bg-panel p-3.5", dragging && "border-cyan/50 shadow-glow-cyan")}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-fg">{card.job.title}</div>
          <div className="mt-0.5 truncate text-xs text-muted">{card.job.company}</div>
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-dim">
            <MapPin className="h-3 w-3" aria-hidden /> {card.job.location}
          </div>
          <div className="mt-1 text-xs text-cyan tabular-nums">
            {formatMoney(card.marketMedian, card.job.currency, { compact: true })} median
          </div>
        </div>
        <FitRing score={card.fitScore} size={44} stroke={5} animate={false} label={`Fit for ${card.job.title}`} />
      </div>
    </div>
  );
}

export function PipelineCardItem({ card, profile }: { card: PipelineCard; profile?: Profile }) {
  const moveCard = useApp((s) => s.moveCard);
  const removeCard = useApp((s) => s.removeCard);
  const setCardNotes = useApp((s) => s.setCardNotes);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });
  const [menu, setMenu] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [benchOpen, setBenchOpen] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <li ref={setNodeRef} style={style} className="list-none">
      <div className="rounded-lg border border-line bg-panel p-3.5">
        <div className="flex items-start gap-2">
          <button
            type="button"
            className="mt-0.5 cursor-grab touch-none rounded p-0.5 text-dim hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50 active:cursor-grabbing"
            aria-label={`Drag ${card.job.title}`}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" aria-hidden />
          </button>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-fg">{card.job.title}</div>
            <div className="mt-0.5 truncate text-xs text-muted">{card.job.company}</div>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-dim">
              <MapPin className="h-3 w-3" aria-hidden /> {card.job.location}
            </div>
            <div className="mt-1 text-xs tabular-nums text-cyan">
              {formatMoney(card.marketMedian, card.job.currency, { compact: true })} median
            </div>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <FitRing score={card.fitScore} size={44} stroke={5} animate={false} label={`Fit for ${card.job.title}`} />
            <button
              type="button"
              onClick={() => setMenu((v) => !v)}
              aria-expanded={menu}
              aria-label="Card actions"
              className="rounded p-1 text-dim hover:text-fg"
            >
              <MoreHorizontal className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>

        {menu ? (
          <div className="mt-3 space-y-2.5 border-t border-line/70 pt-3">
            <label className="flex items-center justify-between gap-2 text-xs text-muted">
              Move to
              <select
                value={card.stage}
                onChange={(e) => moveCard(card.id, e.target.value as Stage)}
                className="rounded-md border border-line bg-bg-2 px-2 py-1 text-xs text-fg"
                aria-label={`Move ${card.job.title} to a stage`}
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {STAGE_LABEL[s]}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setNotesOpen((v) => !v)}
                aria-expanded={notesOpen}
                className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1 text-xs text-muted hover:text-fg"
              >
                <StickyNote className="h-3.5 w-3.5" aria-hidden /> Notes
              </button>
              <button
                type="button"
                onClick={() => setBenchOpen((v) => !v)}
                aria-expanded={benchOpen}
                className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1 text-xs text-muted hover:text-fg"
              >
                <BarChart3 className="h-3.5 w-3.5" aria-hidden /> Benchmarks
              </button>
              <Link
                href={`/dashboard/application-pack/${card.job.id}`}
                className="inline-flex items-center gap-1.5 rounded-md border border-gold/30 bg-gold/10 px-2.5 py-1 text-xs text-gold hover:bg-gold/15"
              >
                <ClipboardList className="h-3.5 w-3.5" aria-hidden /> Pack
              </Link>
              <button
                type="button"
                onClick={() => removeCard(card.id)}
                className="inline-flex items-center gap-1.5 rounded-md border border-red/30 px-2.5 py-1 text-xs text-red hover:bg-red/10"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden /> Remove
              </button>
            </div>
          </div>
        ) : null}

        {notesOpen ? (
          <div className="mt-3">
            <Textarea
              value={card.notes ?? ""}
              onChange={(e) => setCardNotes(card.id, e.target.value)}
              placeholder="Recruiter name, next step, follow-up date…"
              aria-label={`Notes for ${card.job.title}`}
              className="min-h-[80px] text-xs"
            />
          </div>
        ) : null}

        {benchOpen ? <BenchmarksDrawer job={card.job} profile={profile} /> : null}
      </div>
    </li>
  );
}
