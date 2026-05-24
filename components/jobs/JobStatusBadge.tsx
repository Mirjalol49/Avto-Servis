import type { JobStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { jobStatusLabels } from "@/lib/jobs/status";
import { cn } from "@/lib/utils";

const statusClasses: Record<JobStatus, string> = {
  WAITING: "border-white/15 bg-white/5 text-muted-foreground",
  DIAGNOSED: "border-blue-400/25 bg-blue-400/10 text-blue-200",
  APPROVED: "border-amber-400/25 bg-amber-400/10 text-amber-200",
  IN_PROGRESS: "border-orange-400/25 bg-orange-400/10 text-orange-200",
  COMPLETED: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
  DELIVERED: "border-primary/25 bg-primary/10 text-primary",
};

export function JobStatusBadge({ status }: { status: JobStatus }) {
  return (
    <Badge variant="outline" className={cn(statusClasses[status])}>
      {jobStatusLabels[status]}
    </Badge>
  );
}
