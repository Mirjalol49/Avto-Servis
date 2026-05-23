import { differenceInCalendarDays, format } from "date-fns";
import { AlertTriangleIcon, EditIcon, ExternalLinkIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getMasterById, getMasterStats } from "@/actions/masters";
import { JobStatusBadge } from "@/components/jobs/JobStatusBadge";
import { MasterAvatar } from "@/components/masters/MasterAvatar";
import { MasterSheet } from "@/components/masters/MasterSheet";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatUzbekPhone } from "@/lib/customers/validation";
import { shortJobId } from "@/lib/jobs/status";
import { formatCurrency } from "@/lib/money";
import { cn } from "@/lib/utils";

type MasterDetailPageProps = {
  params: {
    id: string;
  };
  searchParams?: {
    page?: string;
  };
};

const pageSize = 10;

export const dynamic = "force-dynamic";

function parsePage(value?: string) {
  const page = Number(value ?? 1);

  return Number.isInteger(page) && page > 0 ? page : 1;
}

export default async function MasterDetailPage({
  params,
  searchParams,
}: MasterDetailPageProps) {
  const [master, stats] = await Promise.all([
    getMasterById(params.id),
    getMasterStats(params.id),
  ]);

  if (!master) {
    notFound();
  }

  const currentJobs = master.jobOrders.filter((job) => {
    return job.status === "IN_PROGRESS" || job.status === "WAITING";
  });
  const historyJobs = master.jobOrders.filter((job) => {
    return job.status === "COMPLETED" || job.status === "DELIVERED";
  });
  const currentPage = parsePage(searchParams?.page);
  const totalPages = Math.max(1, Math.ceil(historyJobs.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedHistory = historyJobs.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  return (
    <div className="flex flex-col gap-6">
      {!master.isActive ? (
        <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-900">
          <AlertTriangleIcon />
          This master is currently inactive and cannot be assigned to new jobs
        </div>
      ) : null}

      <div className="flex flex-col gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <MasterAvatar id={master.id} name={master.name} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-2xl font-semibold">{master.name}</h1>
              <Badge
                variant="outline"
                className={cn(
                  master.isActive
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-red-700"
                )}
              >
                {master.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {master.specialization ?? "No specialization"} · {formatUzbekPhone(master.phone)}
            </div>
          </div>
        </div>
        <MasterSheet
          master={master}
          trigger={
            <button
              type="button"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              <EditIcon data-icon="inline-start" />
              Edit
            </button>
          }
        />
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{stats.totalJobs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{stats.activeJobs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{stats.completedJobs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {formatCurrency(stats.totalRevenue)}
            </div>
          </CardContent>
        </Card>
      </div>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="font-heading text-lg font-semibold">Current Jobs</h2>
          <p className="text-sm text-muted-foreground">
            Waiting and in-progress jobs assigned to this master.
          </p>
        </div>
        {currentJobs.length > 0 ? (
          <div className="rounded-xl bg-card ring-1 ring-foreground/10">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Car Plate</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Days Open</TableHead>
                  <TableHead className="text-right">Job</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.car.plateNumber}</TableCell>
                    <TableCell>{job.car.customer.name}</TableCell>
                    <TableCell>
                      <JobStatusBadge status={job.status} />
                    </TableCell>
                    <TableCell>
                      {differenceInCalendarDays(new Date(), job.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/dashboard/jobs/${job.id}`}
                        className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                      >
                        <ExternalLinkIcon data-icon="inline-start" />
                        Open
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ExternalLinkIcon />
              </EmptyMedia>
              <EmptyTitle>No current jobs</EmptyTitle>
              <EmptyDescription>
                Active assignments will appear here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="font-heading text-lg font-semibold">Job History</h2>
          <p className="text-sm text-muted-foreground">
            Completed and delivered jobs, 10 per page.
          </p>
        </div>
        <div className="rounded-xl bg-card ring-1 ring-foreground/10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job ID</TableHead>
                <TableHead>Car Plate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Completed</TableHead>
                <TableHead>Total Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedHistory.length > 0 ? (
                pagedHistory.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-mono text-xs">{shortJobId(job.id)}</TableCell>
                    <TableCell className="font-medium">{job.car.plateNumber}</TableCell>
                    <TableCell>
                      <JobStatusBadge status={job.status} />
                    </TableCell>
                    <TableCell>{format(job.updatedAt, "dd MMM yyyy")}</TableCell>
                    <TableCell>{formatCurrency(job.totalCost)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-28 text-center text-muted-foreground">
                    No completed jobs yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {totalPages > 1 ? (
          <div className="flex items-center justify-end gap-2">
            <Link
              href={`/dashboard/masters/${master.id}?page=${Math.max(1, safePage - 1)}`}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                safePage === 1 && "pointer-events-none opacity-50"
              )}
            >
              Previous
            </Link>
            <span className="text-sm text-muted-foreground">
              Page {safePage} of {totalPages}
            </span>
            <Link
              href={`/dashboard/masters/${master.id}?page=${Math.min(totalPages, safePage + 1)}`}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                safePage === totalPages && "pointer-events-none opacity-50"
              )}
            >
              Next
            </Link>
          </div>
        ) : null}
      </section>
    </div>
  );
}
