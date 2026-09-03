import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Accessible label + control + error wrapper (the shared Label primitive has no htmlFor, so forms in marketing pages use this). */
export function Field({
  id,
  label,
  hint,
  error,
  children,
  className,
  optional,
}: {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  children: ReactNode;
  className?: string;
  optional?: boolean;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between gap-3 text-xs font-medium tracking-wide text-muted">
        <span>
          {label}
          {optional ? <span className="ml-2 text-dim">optional</span> : null}
        </span>
        {hint ? <span className="text-dim">{hint}</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-red">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
