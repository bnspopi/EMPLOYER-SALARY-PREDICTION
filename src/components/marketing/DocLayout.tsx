import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TocItem {
  id: string;
  title: string;
}

/** Two-column reading layout for legal / help / guide pages: sticky anchor TOC + long-form content. */
export function DocLayout({ toc, children, aside, tocTitle = "On this page", className }: { toc: TocItem[]; children: ReactNode; aside?: ReactNode; tocTitle?: string; className?: string }) {
  return (
    <div className={cn("mx-auto grid max-w-6xl gap-12 px-5 pb-24 md:px-10 lg:grid-cols-[240px_1fr] lg:gap-16", className)}>
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <nav aria-label={tocTitle} className="panel rounded-xl2 p-5">
          <div className="eyebrow mb-4 text-fg">{tocTitle}</div>
          <ol className="space-y-2.5">
            {toc.map((t, i) => (
              <li key={t.id} className="flex gap-3 text-sm">
                <span className="mono-caps mt-0.5 w-5 shrink-0 text-[10px] text-dim tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <a href={`#${t.id}`} className="text-muted transition-colors hover:text-fg">
                  {t.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        {aside ? <div className="mt-5">{aside}</div> : null}
      </aside>
      <div className="min-w-0 space-y-14">{children}</div>
    </div>
  );
}

export function DocSection({ id, title, children, number }: { id: string; title: ReactNode; children: ReactNode; number?: number }) {
  return (
    <section id={id} className="scroll-mt-28">
      <div className="mb-5 flex items-baseline gap-4">
        {typeof number === "number" ? <span className="mono-caps text-[11px] text-gold tabular-nums">{String(number).padStart(2, "0")}</span> : null}
        <h2 className="display text-3xl leading-none md:text-4xl">{title}</h2>
      </div>
      <div className="space-y-4 text-[15px] leading-relaxed text-muted [&_a]:text-cyan [&_a]:underline-offset-4 hover:[&_a]:underline [&_strong]:text-fg [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5">
        {children}
      </div>
    </section>
  );
}
