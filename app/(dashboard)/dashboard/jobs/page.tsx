import type { JobStatus } from "@prisma/client";
import { format } from "date-fns";
import { ClipboardListIcon, EyeIcon } from "lucide-react";
import Link from "next/link";

import { getJobFormData, getJobOrders, getJobStatusCounts } from "@/actions/jobs";
import { JobSearch } from "@/components/jobs/JobSearch";
import { JobStatusBadge } from "@/components/jobs/JobStatusBadge";
import { NewJobOrderSheet } from "@/components/jobs/NewJobOrderSheet";
import { StatusFilterTabs } from "@/components/jobs/StatusFilterTabs";
import { buttonVariants } from "@/components/ui/button";
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
import { jobStatusFlow, shortJobId } from "@/lib/jobs/status";
import { cn } from "@/lib/utils";

type JobsPageProps = {
  searchParams?: {
    status?: string;
    search?: string;
  };
};

export const dynamic = "force-dynamic";

function parseStatus(value?: string): JobStatus | undefined {
  return jobStatusFlow.includes(value as JobStatus) ? (value as JobStatus) : undefined;
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const status = parseStatus(searchParams?.status);
  const search = searchParams?.search ?? "";
  const [jobs, counts, formData] = await Promise.all([
    getJobOrders({ status, search }),
    getJobStatusCounts(),
    getJobFormData(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Job Orders</h1>
          <p className="text-sm text-muted-foreground">
            Track intake, diagnosis, photos, and job progress.
          </p>
        </div>
        <NewJobOrderSheet cars={formData.cars} masters={formData.masters} />
      </div>

      <StatusFilterTabs activeStatus={status} counts={counts} search={search} />
      <JobSearch defaultValue={search} />

      {jobs.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-white/10 bg-card/80">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job ID</TableHead>
                <TableHead>Car Plate</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Master</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-mono text-xs">{shortJobId(job.id)}</TableCell>
                  <TableCell className="font-medium">{job.car.plateNumber}</TableCell>
                  <TableCell>{job.car.customer.name}</TableCell>
                  <TableCell>{job.master?.name ?? "Unassigned"}</TableCell>
                  <TableCell>
                    <JobStatusBadge status={job.status} />
                  </TableCell>
                  <TableCell>{format(job.createdAt, "dd MMM yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/dashboard/jobs/${job.id}`}
                      className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
                    >
                      <EyeIcon />
                      <span className="sr-only">View job order</span>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Empty className="min-h-80 border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ClipboardListIcon />
            </EmptyMedia>
            <EmptyTitle>No job orders found</EmptyTitle>
            <EmptyDescription>
              Create a new job order or adjust the filters.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}
