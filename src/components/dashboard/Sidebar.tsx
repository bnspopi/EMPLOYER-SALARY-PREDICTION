"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Briefcase, Compass, FileText, GitCompare, KanbanSquare, LineChart, MessageSquare, Scale, Settings, Sparkles, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export const DASH_LINKS = [
  { href: "/dashboard", label: "Overview", icon: Compass, exact: true },
  { href: "/dashboard/market-value", label: "Market value", icon: BarChart3 },
  { href: "/dashboard/improve", label: "Improve", icon: Sparkles },
  { href: "/dashboard/offer-evaluator", label: "Offer evaluator", icon: Scale },
  { href: "/dashboard/compare", label: "Compare offers", icon: GitCompare },
  { href: "/dashboard/job-search", label: "Job search", icon: Briefcase },
  { href: "/dashboard/pipeline", label: "Pipeline", icon: KanbanSquare },
  { href: "/dashboard/career-growth", label: "Career growth", icon: TrendingUp },
  { href: "/dashboard/insights", label: "Market insights", icon: LineChart },
  { href: "/dashboard/resumes", label: "Resumes", icon: FileText },
  { href: "/dashboard/chat", label: "AI resume chat", icon: MessageSquare },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-60 shrink-0 border-r border-white/5 bg-bg-2/60 lg:block">
      <nav className="sticky top-16 flex flex-col gap-0.5 p-3" aria-label="Dashboard">
        {DASH_LINKS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active ? "bg-white/8 text-fg" : "text-muted hover:bg-white/5 hover:text-fg",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className={cn("h-4 w-4", active ? "text-cyan" : "text-dim")} aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function MobileDashNav() {
  const pathname = usePathname();
  return (
    <div className="-mx-5 mb-4 overflow-x-auto border-b border-white/5 px-5 lg:hidden">
      <div className="flex gap-1 pb-3">
        {DASH_LINKS.map(({ href, label, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={cn("whitespace-nowrap rounded-full border px-3 py-1.5 text-xs", active ? "border-cyan/40 bg-cyan/10 text-cyan" : "border-white/10 text-muted")}>
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
