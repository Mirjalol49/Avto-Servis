import type { JobStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { getDictionary } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

const statusClasses: Record<JobStatus, string> = {
  WAITING: "border-white/15 bg-white/5 text-muted-foreground",
  DIAGNOSED: "border-sky-300/20 bg-sky-300/10 text-sky-200",
  APPROVED: "border-amber-300/20 bg-amber-300/10 text-amber-200",
  IN_PROGRESS: "border-orange-300/20 bg-orange-300/10 text-orange-200",
  COMPLETED: "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
  DELIVERED: "border-slate-300/20 bg-slate-300/10 text-slate-200",
};

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const dictionary = getDictionary();

  return (
    <Badge variant="outline" className={cn(statusClasses[status])}>
      {dictionary.jobs.statuses[status]}
    </Badge>
  );
}
