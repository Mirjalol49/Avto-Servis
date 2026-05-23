import type { JobStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { jobStatusLabels } from "@/lib/jobs/status";
import { cn } from "@/lib/utils";

const statusClasses: Record<JobStatus, string> = {
  WAITING: "bg-muted text-muted-foreground",
  DIAGNOSED: "bg-blue-100 text-blue-700",
  APPROVED: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-orange-100 text-orange-800",
  COMPLETED: "bg-green-100 text-green-700",
  DELIVERED: "bg-purple-100 text-purple-700",
};

export function JobStatusBadge({ status }: { status: JobStatus }) {
  return (
    <Badge className={cn("border-transparent", statusClasses[status])}>
      {jobStatusLabels[status]}
    </Badge>
  );
}
