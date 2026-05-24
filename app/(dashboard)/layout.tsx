import { Navbar } from "@/components/shared/Navbar";
import { RealtimeRefresh } from "@/components/shared/RealtimeRefresh";
import { MobileSidebarNav, Sidebar } from "@/components/shared/Sidebar";

export default function DashboardGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />
        <MobileSidebarNav />
        <RealtimeRefresh />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
