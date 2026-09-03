import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("panel rounded-xl2 p-5 md:p-6", className)} {...rest}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, eyebrow }: { className?: string; children: React.ReactNode; eyebrow?: string }) {
  return (
    <div className={cn("mb-4", className)}>
      {eyebrow ? <div className="eyebrow mb-1">{eyebrow}</div> : null}
      <h3 className="text-lg font-semibold tracking-tight">{children}</h3>
    </div>
  );
}
