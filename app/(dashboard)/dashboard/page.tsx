import { formatDistanceToNow } from "date-fns";
import {
  AlertCircleIcon,
  BanknoteIcon,
  BriefcaseBusinessIcon,
  CalendarDaysIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";

import { getDashboardStats } from "@/actions/dashboard";
import { DashboardAutoRefresh } from "@/components/dashboard/DashboardAutoRefresh";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { JobStatusBadge } from "@/components/jobs/JobStatusBadge";
import { MasterAvatar } from "@/components/masters/MasterAvatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { jobStatusFlow, shortJobId } from "@/lib/jobs/status";
import { formatCurrency, getCurrency } from "@/lib/money";

export const dynamic = "force-dynamic";

type KpiCardProps = {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
};

function KpiCard({ title, value, subtitle, icon: Icon }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
        <CardTitle className="font-mono text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex size-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary shadow-[0_0_24px_rgba(208,188,255,0.16)]">
          <Icon className="size-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="font-heading text-4xl font-bold leading-tight">{value}</div>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const currency = getCurrency();
  const jobsByStatus = jobStatusFlow.map((status) => ({
    status,
    count: stats.jobsByStatus[status],
  }));

  return (
    <DashboardAutoRefresh lastUpdatedAt={stats.lastUpdatedAt}>
      <div>
        <h1 className="font-heading text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Service operations, revenue, workload, and inventory alerts.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Today's Jobs"
          value={stats.todayJobsCount}
          subtitle="Job orders opened today"
          icon={CalendarDaysIcon}
        />
        <KpiCard
          title="Active Jobs"
          value={stats.activeJobsCount}
          subtitle="Currently in service"
          icon={BriefcaseBusinessIcon}
        />
        <KpiCard
          title="Today's Revenue"
          value={formatCurrency(stats.todayRevenue)}
          subtitle="Paid invoices today"
          icon={BanknoteIcon}
        />
        <KpiCard
          title="Month Revenue"
          value={formatCurrency(stats.monthRevenue)}
          subtitle="This month"
          icon={UsersIcon}
        />
      </div>

      <DashboardCharts
        revenueByDay={stats.revenueByDay}
        jobsByStatus={jobsByStatus}
        currency={currency}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Masters This Month</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topMasters.length > 0 ? (
              <div className="flex flex-col gap-3">
                {stats.topMasters.map((master, index) => (
                  <div
                    key={master.id || master.name}
                    className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-muted/30 p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="font-mono text-sm text-muted-foreground">
                        #{index + 1}
                      </div>
                      <MasterAvatar id={master.id || master.name} name={master.name} size="sm" />
                      <div className="min-w-0">
                        <div className="truncate font-medium">{master.name}</div>
                        <div className="truncate text-sm text-muted-foreground">
                          {master.specialization ?? "No specialization"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">
                        {master.completedJobsCount} jobs
                      </Badge>
                      <div className="mt-1 text-sm font-medium">
                        {formatCurrency(master.revenue)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-white/10 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                No completed master jobs this month.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Job Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentJobs.length > 0 ? (
              <div className="flex flex-col gap-2">
                {stats.recentJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/dashboard/jobs/${job.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-muted/30 p-3 transition-colors hover:bg-accent/50"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs">{shortJobId(job.id)}</span>
                        <span className="font-medium">{job.car.plateNumber}</span>
                      </div>
                      <div className="truncate text-sm text-muted-foreground">
                        {job.car.customer.name} ·{" "}
                        {formatDistanceToNow(job.createdAt, { addSuffix: true })}
                      </div>
                    </div>
                    <JobStatusBadge status={job.status} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-white/10 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                No job orders yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {stats.lowStockParts > 0 || stats.activeJobsCount > 10 ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {stats.lowStockParts > 0 ? (
            <Alert className="border-amber-400/25 bg-amber-400/10 text-amber-100">
              <AlertCircleIcon />
              <AlertTitle>Stock alert</AlertTitle>
              <AlertDescription className="text-amber-100/85">
                ⚠ {stats.lowStockParts} parts are running low on stock.{" "}
                <Link href="/dashboard/parts">Review inventory</Link>
              </AlertDescription>
            </Alert>
          ) : null}
          {stats.activeJobsCount > 10 ? (
            <Alert>
              <AlertCircleIcon />
              <AlertTitle>High workload</AlertTitle>
              <AlertDescription>
                ℹ {stats.activeJobsCount} jobs currently active — high load
              </AlertDescription>
            </Alert>
          ) : null}
        </div>
      ) : null}
    </DashboardAutoRefresh>
  );
}
