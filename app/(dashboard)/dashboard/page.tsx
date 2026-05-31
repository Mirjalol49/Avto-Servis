import { format, formatDistanceToNow } from "date-fns";
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
import { DashboardChartsLoader } from "@/components/dashboard/DashboardChartsLoader";
import { JobStatusBadge } from "@/components/jobs/JobStatusBadge";
import { MasterAvatar } from "@/components/masters/MasterAvatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { jobStatusFlow, shortJobId } from "@/lib/jobs/status";
import { getDateFnsLocale } from "@/lib/i18n/date";
import { getDictionary, getLocale } from "@/lib/i18n/server";
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
        <div className="flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 shadow-[0_8px_20px_rgba(0,0,0,0.16)]">
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
  const locale = getLocale();
  const dictionary = getDictionary();
  const dateLocale = getDateFnsLocale(locale);
  const jobsByStatus = jobStatusFlow.map((status) => ({
    status,
    count: stats.jobsByStatus[status],
  }));
  const revenueByDay = stats.revenueByDay.map((point) => ({
    ...point,
    label: format(new Date(`${point.date}T00:00:00.000`), "MMM dd", {
      locale: dateLocale,
    }),
  }));

  return (
    <DashboardAutoRefresh
      lastUpdatedAt={stats.lastUpdatedAt}
      lastUpdatedLabel={dictionary.dashboard.lastUpdated}
      locale={locale}
    >
      <div>
        <h1 className="font-heading text-2xl font-semibold">{dictionary.dashboard.title}</h1>
        <p className="text-sm text-muted-foreground">
          {dictionary.dashboard.description}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title={dictionary.dashboard.todaysJobs}
          value={stats.todayJobsCount}
          subtitle={dictionary.dashboard.todaysJobsSubtitle}
          icon={CalendarDaysIcon}
        />
        <KpiCard
          title={dictionary.dashboard.activeJobs}
          value={stats.activeJobsCount}
          subtitle={dictionary.dashboard.activeJobsSubtitle}
          icon={BriefcaseBusinessIcon}
        />
        <KpiCard
          title={dictionary.dashboard.todaysRevenue}
          value={formatCurrency(stats.todayRevenue)}
          subtitle={dictionary.dashboard.todaysRevenueSubtitle}
          icon={BanknoteIcon}
        />
        <KpiCard
          title={dictionary.dashboard.monthRevenue}
          value={formatCurrency(stats.monthRevenue)}
          subtitle={dictionary.dashboard.monthRevenueSubtitle}
          icon={UsersIcon}
        />
      </div>

      <DashboardChartsLoader
        revenueByDay={revenueByDay}
        jobsByStatus={jobsByStatus}
        currency={currency}
        labels={{
          revenueLast30Days: dictionary.dashboard.revenueLast30Days,
          jobsByStatus: dictionary.dashboard.jobsByStatus,
          revenue: dictionary.dashboard.revenue,
          jobs: dictionary.common.jobs,
          statuses: dictionary.jobs.statuses,
        }}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{dictionary.dashboard.topMastersThisMonth}</CardTitle>
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
                          {master.specialization ?? dictionary.common.noSpecialization}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">
                        {dictionary.dashboard.completedJobsBadge(master.completedJobsCount)}
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
                {dictionary.dashboard.noCompletedMasterJobs}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{dictionary.dashboard.recentJobOrders}</CardTitle>
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
                        {formatDistanceToNow(job.createdAt, { addSuffix: true, locale: dateLocale })}
                      </div>
                    </div>
                    <JobStatusBadge status={job.status} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-white/10 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                {dictionary.dashboard.noJobOrdersYet}
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
              <AlertTitle>{dictionary.dashboard.stockAlert}</AlertTitle>
              <AlertDescription className="text-amber-100/85">
                {dictionary.dashboard.stockAlertText(stats.lowStockParts)}{" "}
                <Link href="/dashboard/parts">{dictionary.dashboard.reviewInventory}</Link>
              </AlertDescription>
            </Alert>
          ) : null}
          {stats.activeJobsCount > 10 ? (
            <Alert>
              <AlertCircleIcon />
              <AlertTitle>{dictionary.dashboard.highWorkload}</AlertTitle>
              <AlertDescription>
                {dictionary.dashboard.highWorkloadText(stats.activeJobsCount)}
              </AlertDescription>
            </Alert>
          ) : null}
        </div>
      ) : null}
    </DashboardAutoRefresh>
  );
}
