import { BarChart3Icon, BriefcaseBusinessIcon, PackageIcon, UsersIcon } from "lucide-react";
import Link from "next/link";

import { getDashboardStats } from "@/actions/dashboard";
import { JobStatusBadge } from "@/components/jobs/JobStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { jobStatusFlow, jobStatusLabels, shortJobId } from "@/lib/jobs/status";
import { formatCurrency } from "@/lib/money";

export const dynamic = "force-dynamic";

type ReportCardProps = {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

function ReportCard({ title, value, description, icon: Icon }: ReportCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
        <div>
          <CardTitle className="font-mono text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="flex size-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary shadow-[0_0_24px_rgba(208,188,255,0.16)]">
          <Icon className="size-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="font-heading text-3xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

export default async function ReportsPage() {
  const stats = await getDashboardStats();
  const jobsByStatus = jobStatusFlow.map((status) => ({
    status,
    count: stats.jobsByStatus[status],
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Operational summaries for revenue, workload, masters, and inventory.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ReportCard
          title="Customers"
          value={stats.totalCustomers}
          description="Total customer records"
          icon={UsersIcon}
        />
        <ReportCard
          title="Active Jobs"
          value={stats.activeJobsCount}
          description="Waiting, diagnosed, or in progress"
          icon={BriefcaseBusinessIcon}
        />
        <ReportCard
          title="Month Revenue"
          value={formatCurrency(stats.monthRevenue)}
          description="Paid invoice revenue"
          icon={BarChart3Icon}
        />
        <ReportCard
          title="Low Stock"
          value={stats.lowStockParts}
          description="Parts below 5 units"
          icon={PackageIcon}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Jobs by Status</CardTitle>
            <CardDescription>Current service pipeline distribution.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Jobs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobsByStatus.map((item) => (
                  <TableRow key={item.status}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <JobStatusBadge status={item.status} />
                        <span className="text-muted-foreground">
                          {jobStatusLabels[item.status]}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {item.count}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Masters This Month</CardTitle>
            <CardDescription>Completed jobs and revenue contribution.</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topMasters.length > 0 ? (
              <div className="space-y-3">
                {stats.topMasters.map((master, index) => (
                  <div key={master.id} className="rounded-lg border border-white/10 bg-muted/30 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium">
                          #{index + 1} {master.name}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {master.specialization ?? "No specialization"}
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {master.completedJobsCount} jobs
                      </Badge>
                    </div>
                    <div className="mt-2 text-sm font-medium">
                      {formatCurrency(master.revenue)}
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Job Orders</CardTitle>
          <CardDescription>Latest service intake activity.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job</TableHead>
                <TableHead>Car</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recentJobs.length > 0 ? (
                stats.recentJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/jobs/${job.id}`}
                        className="font-mono text-xs underline-offset-4 hover:underline"
                      >
                        {shortJobId(job.id)}
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">{job.car.plateNumber}</TableCell>
                    <TableCell>{job.car.customer.name}</TableCell>
                    <TableCell>
                      <JobStatusBadge status={job.status} />
                    </TableCell>
                    <TableCell>{job.createdAt.toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No job orders yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
