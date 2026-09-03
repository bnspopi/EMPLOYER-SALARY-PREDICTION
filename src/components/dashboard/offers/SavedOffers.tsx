"use client";
import { useState } from "react";
import { Pencil, Trash2, Scale } from "lucide-react";
import type { OfferInput, Profile } from "@/lib/types";
import { evaluateOffer } from "@/lib/engine";
import { formatMoney, formatPct } from "@/lib/format";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import { OfferForm } from "./OfferForm";
import { offerLabel } from "./logic";

const VERDICT_TONE = {
  below: "text-ember",
  at: "text-cyan",
  above: "text-green",
} as const;

/** Saved-offer list with inline edit + delete, each row re-priced by the engine. */
export function SavedOffers({ profile }: { profile?: Profile }) {
  const offers = useApp((s) => s.offers);
  const updateOffer = useApp((s) => s.updateOffer);
  const removeOffer = useApp((s) => s.removeOffer);
  const [editingId, setEditingId] = useState<string | null>(null);

  if (offers.length === 0) {
    return (
      <div className="panel rounded-xl2 p-6 text-center text-sm text-muted">
        No saved offers yet. Evaluate an offer above, then <span className="text-fg">Save offer</span> to compare them side
        by side.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {offers.map((offer) => {
        if (editingId === offer.id) {
          return (
            <div key={offer.id} className="panel rounded-xl2 p-5">
              <div className="eyebrow mb-3">Edit offer</div>
              <OfferForm
                initial={offer}
                submitLabel="Save changes"
                compact
                onSubmit={(draft) => {
                  updateOffer(offer.id, draft);
                  setEditingId(null);
                }}
                onCancel={() => setEditingId(null)}
              />
            </div>
          );
        }
        return (
          <SavedRow
            key={offer.id}
            offer={offer}
            profile={profile}
            onEdit={() => setEditingId(offer.id)}
            onDelete={() => removeOffer(offer.id)}
          />
        );
      })}
    </div>
  );
}

function SavedRow({
  offer,
  profile,
  onEdit,
  onDelete,
}: {
  offer: OfferInput;
  profile?: Profile;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const v = evaluateOffer(offer, profile);
  const money = (n: number) => formatMoney(n, v.currency, { compact: true });
  return (
    <div className="panel flex flex-wrap items-center gap-4 rounded-xl2 p-4 md:p-5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-line-2 bg-white/5 text-muted">
        <Scale className="h-5 w-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-fg">{offerLabel(offer)}</div>
        <div className="truncate text-[11px] text-dim">
          {offer.title} · {offer.location}
        </div>
      </div>
      <div className="hidden text-right sm:block">
        <div className="mono-caps text-dim">Total comp</div>
        <div className="text-sm font-semibold tabular-nums text-fg">{money(v.totalComp)}</div>
      </div>
      <div className="text-right">
        <div className="mono-caps text-dim">vs median</div>
        <div className={cn("text-sm font-semibold tabular-nums", VERDICT_TONE[v.verdict])}>
          {formatPct(v.pctVsMedian)}
        </div>
      </div>
      <div className="text-right">
        <div className="mono-caps text-dim">Score</div>
        <div className="text-sm font-semibold tabular-nums text-fg">{v.decisionScore}</div>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${offerLabel(offer)}`}
          className="rounded-md border border-line-2 bg-white/5 p-2 text-muted transition-colors hover:text-cyan"
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete ${offerLabel(offer)}`}
          className="rounded-md border border-line-2 bg-white/5 p-2 text-muted transition-colors hover:text-red"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
