import type { JobStatus } from "@prisma/client";

export const jobStatusFlow = [
  "WAITING",
  "DIAGNOSED",
  "APPROVED",
  "IN_PROGRESS",
  "COMPLETED",
  "DELIVERED",
] as const satisfies JobStatus[];

export const jobStatusLabels: Record<JobStatus, string> = {
  WAITING: "Waiting",
  DIAGNOSED: "Diagnosed",
  APPROVED: "Approved",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  DELIVERED: "Delivered",
};

export type JobTransitionContext = {
  hasDiagnosis: boolean;
  approvedByCustomer: boolean;
  hasAfterPhoto: boolean;
  hasPaidInvoice: boolean;
};

function statusIndex(status: JobStatus) {
  return jobStatusFlow.indexOf(status);
}

export function assertCanTransitionJobStatus(
  currentStatus: JobStatus,
  nextStatus: JobStatus,
  context: JobTransitionContext
) {
  const currentIndex = statusIndex(currentStatus);
  const nextIndex = statusIndex(nextStatus);

  if (nextIndex === -1) {
    throw new Error("Unknown job status");
  }

  if (nextIndex < currentIndex) {
    throw new Error("Cannot move job status backwards");
  }

  if (nextIndex === currentIndex) {
    return;
  }

  if (nextIndex !== currentIndex + 1) {
    throw new Error("Job status can only move one step at a time");
  }

  if (currentStatus === "WAITING" && nextStatus === "DIAGNOSED" && !context.hasDiagnosis) {
    throw new Error("Diagnosis notes are required before diagnosing a job");
  }

  if (
    currentStatus === "DIAGNOSED" &&
    nextStatus === "APPROVED" &&
    !context.approvedByCustomer
  ) {
    throw new Error("Customer approval is required before approving a job");
  }

  if (
    currentStatus === "IN_PROGRESS" &&
    nextStatus === "COMPLETED" &&
    !context.hasAfterPhoto
  ) {
    throw new Error("At least one after photo is required before completion");
  }

  if (
    currentStatus === "COMPLETED" &&
    nextStatus === "DELIVERED" &&
    !context.hasPaidInvoice
  ) {
    throw new Error("Paid invoice is required before delivery");
  }
}

export function getNextJobStatuses(
  currentStatus: JobStatus,
  context: JobTransitionContext
) {
  const currentIndex = statusIndex(currentStatus);
  const nextStatus = jobStatusFlow[currentIndex + 1];

  if (!nextStatus) {
    return [];
  }

  try {
    assertCanTransitionJobStatus(currentStatus, nextStatus, context);
    return [nextStatus];
  } catch {
    return [];
  }
}

export function shortJobId(id: string) {
  return `#JO-${id.slice(-4).toUpperCase()}`;
}

export function assertCanSaveDiagnosis(status: JobStatus) {
  if (status !== "WAITING" && status !== "DIAGNOSED") {
    throw new Error("Diagnosis can only be saved before customer approval");
  }
}

export function assertCanApproveEstimate({
  status,
  hasDiagnosis,
  hasInvoice,
}: {
  status: JobStatus;
  hasDiagnosis: boolean;
  hasInvoice: boolean;
}) {
  if (hasInvoice) {
    throw new Error("Invoice already exists for this job");
  }

  if (status !== "DIAGNOSED") {
    throw new Error("Estimate can only be approved after diagnosis");
  }

  if (!hasDiagnosis) {
    throw new Error("Diagnosis notes are required before customer approval");
  }
}

export function assertCanEditJobCosts({
  status,
  approvedByCustomer,
  hasInvoice,
}: {
  status: JobStatus;
  approvedByCustomer: boolean;
  hasInvoice: boolean;
}) {
  if (hasInvoice || approvedByCustomer || status === "COMPLETED" || status === "DELIVERED") {
    throw new Error(
      "Job costs are locked after customer approval, completion, delivery, or invoice generation"
    );
  }
}

export function assertCanGenerateInvoice(status: JobStatus) {
  if (status !== "COMPLETED") {
    throw new Error("Invoice can only be generated after the job is completed");
  }
}

export function assertCanMarkInvoicePaid({
  isPaid,
  jobStatus,
}: {
  isPaid: boolean;
  jobStatus: JobStatus;
}) {
  if (isPaid) {
    throw new Error("Invoice is already paid");
  }

  if (jobStatus !== "COMPLETED") {
    throw new Error("Only completed jobs can be paid and delivered");
  }
}
