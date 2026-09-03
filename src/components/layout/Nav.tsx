"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BRAND } from "@/lib/brand";
import { useApp } from "@/lib/store";
import { PLAN_META } from "@/lib/plans";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const LINKS = [
  { href: "/", label: "Individuals" },
  { href: "/for-recruiters", label: "Recruiters" },
  { href: "/salaries", label: "Salary Guides" },
  { href: "/blog", label: "Blog" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

export function Nav() {
  const pathname = usePathname();
  const user = useApp((s) => s.user);
  const plan = useApp((s) => s.plan);
  const hydrated = useApp((s) => s.hydrated);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  // Close the mobile menu on navigation by adjusting state during render
  // (React-recommended pattern; avoids setState-in-effect cascading renders).
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setOpen(false);
  }

  const onLanding = pathname === "/";
  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled || !onLanding ? "bg-bg/80 backdrop-blur-md border-b border-white/5" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 md:px-10">
        <Link href="/" className="flex items-center gap-2" aria-label={`${BRAND.name} home`}>
          <span className="grid h-7 w-7 place-items-center rounded-sm bg-fg text-bg display text-base leading-none">P</span>
          <span className="display text-2xl leading-none tracking-wider">{BRAND.name}</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "mono-caps text-[11px] transition-colors hover:text-fg",
                pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href)) ? "text-fg" : "text-muted",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {hydrated && user ? (
            <>
              <span className="mono-caps text-[10px] text-gold">{PLAN_META[plan].name}</span>
              <Button href="/dashboard" variant="secondary" size="sm">
                Dashboard
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="mono-caps text-[11px] text-muted hover:text-fg">
                Sign in
              </Link>
              <Button href="/analyze" size="sm">
                Analyze my resume
              </Button>
            </>
          )}
        </div>

        <button
          className="grid h-10 w-10 place-items-center md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="relative block h-3.5 w-5">
            <span className={cn("absolute left-0 top-0 h-px w-full bg-fg transition-transform", open && "translate-y-[7px] rotate-45")} />
            <span className={cn("absolute left-0 top-[7px] h-px w-full bg-fg transition-opacity", open && "opacity-0")} />
            <span className={cn("absolute left-0 bottom-0 h-px w-full bg-fg transition-transform", open && "-translate-y-[6px] -rotate-45")} />
          </span>
        </button>
      </div>

      {open ? (
        <div className="border-t border-white/5 bg-bg/95 px-5 py-6 backdrop-blur-md md:hidden">
          <div className="flex flex-col gap-4">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="mono-caps text-xs text-muted hover:text-fg">
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-3">
              {hydrated && user ? (
                <Button href="/dashboard" size="sm" className="flex-1">
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button href="/auth/signin" variant="secondary" size="sm" className="flex-1">
                    Sign in
                  </Button>
                  <Button href="/analyze" size="sm" className="flex-1">
                    Analyze
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
