"use client";
import { useId, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { Currency, OfferInput } from "@/lib/types";
import { listRoles, listLocations, findLocation } from "@/lib/engine";
import { Input, Textarea, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type OfferDraft = Omit<OfferInput, "id">;

const CURRENCY_SYMBOL: Record<Currency, string> = { USD: "$", CAD: "CA$", GBP: "£" };

function numOrUndef(v: string): number | undefined {
  const n = Number(v.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? Math.round(n) : undefined;
}

/**
 * Reusable offer input form. Job title + location use datalists from the
 * catalog; currency is derived automatically from the resolved location.
 */
export function OfferForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Evaluate offer",
  compact = false,
  showJd = true,
  className,
}: {
  initial?: Partial<OfferInput>;
  onSubmit: (draft: OfferDraft) => void;
  onCancel?: () => void;
  submitLabel?: string;
  compact?: boolean;
  showJd?: boolean;
  className?: string;
}) {
  const roles = useMemo(() => listRoles(), []);
  const locations = useMemo(() => listLocations(), []);
  const rolesListId = useId();
  const locListId = useId();

  const [company, setCompany] = useState(initial?.company ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [base, setBase] = useState(initial?.base ? String(initial.base) : "");
  const [bonus, setBonus] = useState(initial?.bonus ? String(initial.bonus) : "");
  const [equity, setEquity] = useState(initial?.equity ? String(initial.equity) : "");
  const [signOn, setSignOn] = useState(initial?.signOn ? String(initial.signOn) : "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [error, setError] = useState<string | null>(null);

  const currency: Currency = useMemo(
    () => (location.trim() ? findLocation(location).currency : "USD"),
    [location],
  );
  const resolvedCity = useMemo(() => (location.trim() ? findLocation(location).label : ""), [location]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const baseNum = numOrUndef(base);
    if (!title.trim()) return setError("Enter a job title.");
    if (!location.trim()) return setError("Enter a location.");
    if (!baseNum) return setError("Enter a valid base salary.");
    setError(null);
    onSubmit({
      company: company.trim() || undefined,
      title: title.trim(),
      location: location.trim(),
      base: baseNum,
      bonus: numOrUndef(bonus),
      equity: numOrUndef(equity),
      signOn: numOrUndef(signOn),
      description: description.trim() || undefined,
      currency,
    });
  };

  const grid = compact ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <form onSubmit={submit} className={cn("space-y-4", className)} noValidate>
      <div className={cn("grid gap-4", grid)}>
        <div>
          <Label>Company / label <span className="text-dim">(optional)</span></Label>
          <Input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Stripe"
            aria-label="Company or label"
          />
        </div>
        <div>
          <Label>Job title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            list={rolesListId}
            placeholder="Senior Product Manager"
            aria-label="Job title"
            required
          />
          <datalist id={rolesListId}>
            {roles.map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>
        </div>
        <div>
          <Label>Location {resolvedCity ? <span className="text-dim">· {currency}</span> : null}</Label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            list={locListId}
            placeholder="San Francisco, US"
            aria-label="Location"
            required
          />
          <datalist id={locListId}>
            {locations.map((l) => (
              <option key={l.label} value={l.label} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MoneyField label="Base salary" sym={CURRENCY_SYMBOL[currency]} value={base} onChange={setBase} required placeholder="105,000" />
        <MoneyField label="Bonus / yr" sym={CURRENCY_SYMBOL[currency]} value={bonus} onChange={setBonus} placeholder="Optional" />
        <MoneyField label="Equity / yr" sym={CURRENCY_SYMBOL[currency]} value={equity} onChange={setEquity} placeholder="Optional" />
        <MoneyField label="Signing bonus" sym={CURRENCY_SYMBOL[currency]} value={signOn} onChange={setSignOn} placeholder="Optional" />
      </div>

      {showJd ? (
        <div>
          <Label>Job description <span className="text-dim">(optional — sharpens the estimate)</span></Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Paste the JD to factor in industry and required skills…"
            aria-label="Job description"
            className="min-h-[90px]"
          />
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="text-sm text-red">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="gold" size="sm">
          {submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function MoneyField({
  label,
  sym,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  sym: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-dim">{sym}</span>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputMode="numeric"
          placeholder={placeholder}
          aria-label={label}
          required={required}
          className="pl-9 tabular-nums"
        />
      </div>
    </div>
  );
}
