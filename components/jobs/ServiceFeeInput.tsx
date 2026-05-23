"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateJobServiceFee } from "@/actions/jobParts";
import { Input } from "@/components/ui/input";

export function ServiceFeeInput({
  jobId,
  defaultValue,
}: {
  jobId: string;
  defaultValue: number;
}) {
  const [value, setValue] = useState(String(defaultValue));
  const [isPending, startTransition] = useTransition();

  function saveServiceFee() {
    const numericValue = Number(value || 0);

    if (Number.isNaN(numericValue)) {
      toast.error("Service fee must be a valid number");
      return;
    }

    startTransition(async () => {
      try {
        await updateJobServiceFee(jobId, numericValue);
        toast.success("Service fee saved");
      } catch (caught) {
        toast.error(caught instanceof Error ? caught.message : "Could not save service fee");
      }
    });
  }

  return (
    <Input
      type="number"
      min={0}
      value={value}
      disabled={isPending}
      onChange={(event) => setValue(event.target.value)}
      onBlur={saveServiceFee}
    />
  );
}
