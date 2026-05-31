"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

type DashboardAutoRefreshProps = {
  lastUpdatedAt: Date;
  lastUpdatedLabel: string;
  locale: string;
  children: React.ReactNode;
};

export function DashboardAutoRefresh({
  lastUpdatedAt,
  lastUpdatedLabel,
  locale,
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
        {lastUpdatedLabel}{" "}
        {new Intl.DateTimeFormat(locale, {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }).format(lastUpdatedAt)}
      </div>
    </div>
  );
}
