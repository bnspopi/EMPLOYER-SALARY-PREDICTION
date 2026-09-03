import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "gold" | "ember" | "outline";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-medium tracking-wide transition-all duration-200 select-none disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";
const variants: Record<Variant, string> = {
  primary: "bg-fg text-bg hover:bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.25)]",
  secondary: "bg-panel-2 text-fg border border-line hover:border-line-2 hover:bg-panel",
  ghost: "text-fg hover:bg-white/5",
  gold: "bg-gold text-bg hover:bg-[#e8c56a] hover:shadow-glow-gold",
  ember: "bg-ember text-white hover:bg-[#ff6f47] hover:shadow-[0_0_30px_rgba(255,90,46,0.35)]",
  outline: "border border-fg/30 text-fg hover:border-fg hover:bg-fg/5",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-xs rounded-md",
  md: "h-11 px-6 text-sm rounded-md",
  lg: "h-13 px-8 text-base rounded-md",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  href?: string;
  children: ReactNode;
}

export function Button({ variant = "primary", size = "md", href, className, children, ...rest }: ButtonProps) {
  const cls = cn(base, variants[variant], sizes[size], className);
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
