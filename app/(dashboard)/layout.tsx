import { Navbar } from "@/components/shared/Navbar";
import { RealtimeRefresh } from "@/components/shared/RealtimeRefresh";
import { Sidebar } from "@/components/shared/Sidebar";

export default function DashboardGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-muted/20">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />
        <RealtimeRefresh />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
