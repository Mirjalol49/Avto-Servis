import { Navbar } from "@/components/shared/Navbar";
import { RealtimeRefresh } from "@/components/shared/RealtimeRefresh";
import { MobileSidebarNav, Sidebar } from "@/components/shared/Sidebar";
import { getDictionary } from "@/lib/i18n/server";

export default async function DashboardGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const dictionary = getDictionary();
  const sidebarLabels = {
    common: dictionary.common,
    nav: dictionary.nav,
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar labels={sidebarLabels} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />
        <MobileSidebarNav labels={sidebarLabels} />
        <RealtimeRefresh />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
