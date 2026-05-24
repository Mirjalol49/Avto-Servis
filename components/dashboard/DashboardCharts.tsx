"use client";

import type { JobStatus } from "@prisma/client";
import { useEffect, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { jobStatusLabels } from "@/lib/jobs/status";
import { formatCurrency } from "@/lib/money";

type RevenuePoint = {
  date: string;
  label: string;
  revenue: number;
};

type StatusPoint = {
  status: JobStatus;
  count: number;
};

type DashboardChartsProps = {
  revenueByDay: RevenuePoint[];
  jobsByStatus: StatusPoint[];
  currency: string;
};

type ChartSize = {
  width: number;
  height: number;
};

const statusColors: Record<JobStatus, string> = {
  WAITING: "#958ea0",
  DIAGNOSED: "#60a5fa",
  APPROVED: "#f59e0b",
  IN_PROGRESS: "#fb923c",
  COMPLETED: "#10b981",
  DELIVERED: "#d0bcff",
};

function formatAxisValue(value: number) {
  if (value >= 1_000_000) {
    return `${Number((value / 1_000_000).toFixed(1))}M`;
  }

  if (value >= 1_000) {
    return `${Math.round(value / 1_000)}k`;
  }

  return String(value);
}

function useChartSize() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<ChartSize>({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return undefined;
    }

    const updateSize = () => {
      const rect = element.getBoundingClientRect();

      setSize({
        width: Math.max(1, Math.floor(rect.width)),
        height: Math.max(1, Math.floor(rect.height)),
      });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return [ref, size] as const;
}

export function DashboardCharts({
  revenueByDay,
  jobsByStatus,
  currency,
}: DashboardChartsProps) {
  const [mounted, setMounted] = useState(false);
  const [revenueChartRef, revenueChartSize] = useChartSize();
  const [statusChartRef, statusChartSize] = useChartSize();
  const pieData = jobsByStatus.map((item) => ({
    name: jobStatusLabels[item.status],
    value: item.count,
    status: item.status,
  }));

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(320px,2fr)]">
      <Card>
        <CardHeader>
          <CardTitle>Revenue Last 30 Days</CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={revenueChartRef} className="h-80 min-w-0">
            {mounted && revenueChartSize.width > 1 ? (
                <AreaChart
                  data={revenueByDay}
                  height={revenueChartSize.height}
                  margin={{ left: 8, right: 16, top: 8 }}
                  width={revenueChartSize.width}
                >
                  <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d0bcff" stopOpacity={0.34} />
                      <stop offset="95%" stopColor="#d0bcff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(218,226,253,0.1)" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "rgb(var(--muted-foreground))", fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "rgb(var(--muted-foreground))", fontSize: 12 }}
                    tickFormatter={(value) => formatAxisValue(Number(value))}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgb(var(--popover))",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "rgb(var(--popover-foreground))",
                    }}
                    formatter={(value) => [
                      formatCurrency(Number(value), currency),
                      "Revenue",
                    ]}
                    labelFormatter={(_, payload) => {
                      const point = payload?.[0]?.payload as RevenuePoint | undefined;

                      return point?.date ?? "";
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#d0bcff"
                    strokeWidth={3}
                    fill="url(#revenueFill)"
                    dot={false}
                    isAnimationActive={false}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
            ) : (
              <Skeleton className="h-full w-full" />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Jobs by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={statusChartRef} className="h-80 min-w-0">
            {mounted && statusChartSize.width > 1 ? (
                <PieChart height={statusChartSize.height} width={statusChartSize.width}>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={96}
                    isAnimationActive={false}
                    paddingAngle={2}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.status} fill={statusColors[entry.status]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "rgb(var(--popover))",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "rgb(var(--popover-foreground))",
                    }}
                    formatter={(value) => [Number(value), "Jobs"]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={48}
                    wrapperStyle={{ color: "rgb(var(--muted-foreground))" }}
                  />
                </PieChart>
            ) : (
              <Skeleton className="h-full w-full" />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
