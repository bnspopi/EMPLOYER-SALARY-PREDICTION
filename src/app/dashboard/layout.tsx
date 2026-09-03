import { Sidebar, MobileDashNav } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen pt-16">
      <Sidebar />
      <div className="min-w-0 flex-1 px-5 py-8 md:px-10">
        <MobileDashNav />
        <div className="mx-auto max-w-6xl">{children}</div>
      </div>
    </div>
  );
}
