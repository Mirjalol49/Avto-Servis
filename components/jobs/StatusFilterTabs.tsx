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
    "inline-flex h-8 items-center gap-1.5 rounded-lg border border-transparent px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-white/10 hover:bg-accent/50 hover:text-foreground";

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
    <div className="flex flex-wrap gap-1 rounded-xl border border-white/10 bg-card/75 p-1 backdrop-blur-xl">
      <Link
        href={hrefFor()}
        className={cn(baseClasses, !activeStatus && "border-primary/25 bg-primary/10 text-primary")}
      >
        All
        <Badge variant="secondary">{total}</Badge>
      </Link>
      {jobStatusFlow.map((status) => (
        <Link
          key={status}
          href={hrefFor(status)}
          className={cn(baseClasses, activeStatus === status && "border-primary/25 bg-primary/10 text-primary")}
        >
          {jobStatusLabels[status]}
          <Badge variant="secondary">{counts[status]}</Badge>
        </Link>
      ))}
    </div>
  );
}
