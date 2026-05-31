"use client";

import dynamic from "next/dynamic";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardChartsProps } from "@/components/dashboard/DashboardCharts";

const DashboardCharts = dynamic(
  () => import("@/components/dashboard/DashboardCharts").then((mod) => mod.DashboardCharts),
  {
    loading: () => <DashboardChartsFallback />,
    ssr: false,
  }
);

function DashboardChartsFallback() {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(320px,2fr)]">
      <Card>
        <CardHeader>
          <CardTitle>...</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>...</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export function DashboardChartsLoader(props: DashboardChartsProps) {
  return <DashboardCharts {...props} />;
}
