"use client";

import type { JobStatus } from "@prisma/client";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
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

const statusColors: Record<JobStatus, string> = {
  WAITING: "#6b7280",
  DIAGNOSED: "#2563eb",
  APPROVED: "#ca8a04",
  IN_PROGRESS: "#ea580c",
  COMPLETED: "#16a34a",
  DELIVERED: "#9333ea",
};

export function DashboardCharts({
  revenueByDay,
  jobsByStatus,
  currency,
}: DashboardChartsProps) {
  const [mounted, setMounted] = useState(false);
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
          <div className="h-80 min-w-0">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueByDay} margin={{ left: 8, right: 16, top: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => formatCurrency(Number(value), currency)}
                  />
                  <Tooltip
                    formatter={(value) => [
                      formatCurrency(Number(value), currency),
                      "Revenue",
                    ]}
                    labelFormatter={(_, payload) => {
                      const point = payload?.[0]?.payload as RevenuePoint | undefined;

                      return point?.date ?? "";
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
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
          <div className="h-80 min-w-0">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={96}
                    paddingAngle={2}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.status} fill={statusColors[entry.status]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [Number(value), "Jobs"]} />
                  <Legend verticalAlign="bottom" height={48} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Skeleton className="h-full w-full" />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
