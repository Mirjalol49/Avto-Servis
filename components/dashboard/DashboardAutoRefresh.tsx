"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type DashboardAutoRefreshProps = {
  lastUpdatedAt: Date;
  children: React.ReactNode;
};

export function DashboardAutoRefresh({
  lastUpdatedAt,
  children,
}: DashboardAutoRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    const interval = window.setInterval(() => {
      router.refresh();
    }, 60_000);

    return () => window.clearInterval(interval);
  }, [router]);

  return (
    <div className="flex flex-col gap-6">
      {children}
      <div className="text-right text-xs text-muted-foreground">
        Last updated {format(lastUpdatedAt, "dd MMM yyyy, HH:mm:ss")}
      </div>
    </div>
  );
}
