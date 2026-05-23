"use client";

import type { JobStatus } from "@prisma/client";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateJobStatus } from "@/actions/jobs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { jobStatusLabels } from "@/lib/jobs/status";

type JobStatusChangerProps = {
  jobId: string;
  currentStatus: JobStatus;
  nextStatuses: JobStatus[];
};

export function JobStatusChanger({
  jobId,
  currentStatus,
  nextStatuses,
}: JobStatusChangerProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticStatus, setOptimisticStatus] = useState(currentStatus);

  if (nextStatuses.length === 0) {
    return (
      <Button type="button" variant="outline" disabled>
        No status change available
      </Button>
    );
  }

  return (
    <Select
      items={nextStatuses.map((status) => ({
        label: jobStatusLabels[status],
        value: status,
      }))}
      value={optimisticStatus}
      onValueChange={(value) => {
        const nextStatus = value as JobStatus;
        setOptimisticStatus(nextStatus);
        startTransition(async () => {
          try {
            await updateJobStatus(jobId, nextStatus);
            toast.success("Status updated");
          } catch (caught) {
            setOptimisticStatus(currentStatus);
            toast.error(caught instanceof Error ? caught.message : "Could not update status");
          }
        });
      }}
    >
      <SelectTrigger className="w-52" disabled={isPending}>
        <SelectValue placeholder="Change Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value={currentStatus}>{jobStatusLabels[currentStatus]}</SelectItem>
          {nextStatuses.map((status) => (
            <SelectItem key={status} value={status}>
              {jobStatusLabels[status]}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
