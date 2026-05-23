import type { JobStatus } from "@prisma/client";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { jobStatusFlow, jobStatusLabels } from "@/lib/jobs/status";
import { cn } from "@/lib/utils";

type StatusFilterTabsProps = {
  activeStatus?: JobStatus;
  counts: Record<JobStatus, number>;
  search: string;
};

export function StatusFilterTabs({
  activeStatus,
  counts,
  search,
}: StatusFilterTabsProps) {
  const baseClasses =
    "inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground";

  function hrefFor(status?: JobStatus) {
    const params = new URLSearchParams();

    if (status) {
      params.set("status", status);
    }

    if (search) {
      params.set("search", search);
    }

    const query = params.toString();
    return query ? `/dashboard/jobs?${query}` : "/dashboard/jobs";
  }

  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="flex flex-wrap gap-1 rounded-xl bg-card p-1 ring-1 ring-foreground/10">
      <Link
        href={hrefFor()}
        className={cn(baseClasses, !activeStatus && "bg-muted text-foreground")}
      >
        All
        <Badge variant="secondary">{total}</Badge>
      </Link>
      {jobStatusFlow.map((status) => (
        <Link
          key={status}
          href={hrefFor(status)}
          className={cn(baseClasses, activeStatus === status && "bg-muted text-foreground")}
        >
          {jobStatusLabels[status]}
          <Badge variant="secondary">{counts[status]}</Badge>
        </Link>
      ))}
    </div>
  );
}
