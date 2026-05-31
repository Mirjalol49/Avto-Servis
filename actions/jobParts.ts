"use server";

import { revalidatePath } from "next/cache";

import { createAuditLog } from "@/lib/audit/log";
import { requireReception } from "@/lib/auth/permissions";
import {
  assertCanApproveEstimate,
  assertCanEditJobCosts,
} from "@/lib/jobs/status";
import { calculatePartsTotal } from "@/lib/money";
import { addJobPartSchema } from "@/lib/parts/validation";
import { prisma } from "@/lib/prisma";

function revalidateJobCostPaths(jobOrderId: string) {
  revalidatePath(`/dashboard/jobs/${jobOrderId}`);
  revalidatePath("/dashboard/jobs");
  revalidatePath("/dashboard/parts");
}

export async function getAvailableParts() {
  return prisma.part.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      stockQty: true,
      unitPrice: true,
    },
  });
}

export async function addPartToJob(
  jobOrderId: string,
  data: { partId: string; quantity: number }
) {
  const actor = await requireReception();

  const parsed = addJobPartSchema.parse(data);
  const result = await prisma.$transaction(async (tx) => {
    const job = await tx.jobOrder.findUnique({
      where: {
        id: jobOrderId,
      },
      select: {
        status: true,
        approvedByCustomer: true,
        serviceFee: true,
        invoice: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!job) {
      throw new Error("Job order not found");
    }

    assertCanEditJobCosts({
      status: job.status,
      approvedByCustomer: job.approvedByCustomer,
      hasInvoice: Boolean(job.invoice),
    });

    const part = await tx.part.findUnique({
      where: {
        id: parsed.partId,
      },
      select: {
        id: true,
        name: true,
        stockQty: true,
        unitPrice: true,
      },
    });

    if (!part) {
      throw new Error("Part not found");
    }

    if (part.stockQty < parsed.quantity) {
      throw new Error("Insufficient stock");
    }

    const jobPart = await tx.jobPart.create({
      data: {
        jobOrderId,
        partId: part.id,
        quantity: parsed.quantity,
        unitPrice: part.unitPrice,
      },
    });

    const stockUpdate = await tx.part.updateMany({
      where: {
        id: part.id,
        stockQty: {
          gte: parsed.quantity,
        },
      },
      data: {
        stockQty: {
          decrement: parsed.quantity,
        },
      },
    });

    if (stockUpdate.count !== 1) {
      throw new Error("Insufficient stock");
    }

    const updatedPart = await tx.part.findUniqueOrThrow({
      where: {
        id: part.id,
      },
      select: {
        name: true,
        stockQty: true,
      },
    });

    const updatedJob = await tx.jobOrder.findUnique({
      where: {
        id: jobOrderId,
      },
      select: {
        serviceFee: true,
        parts: {
          select: {
            quantity: true,
            unitPrice: true,
          },
        },
      },
    });

    if (!updatedJob) {
      throw new Error("Job order not found");
    }

    const partsTotal = calculatePartsTotal(updatedJob.parts);
    const total = partsTotal + Number(updatedJob.serviceFee);

    await tx.jobOrder.update({
      where: {
        id: jobOrderId,
      },
      data: {
        estimatedCost: total,
        totalCost: total,
      },
    });

    return {
      jobPart,
      depletedPartName: updatedPart.stockQty === 0 ? updatedPart.name : null,
    };
  });

  revalidateJobCostPaths(jobOrderId);
  await createAuditLog({
    user: actor,
    action: "JOB_PART_ADDED",
    entity: "JobPart",
    entityId: result.jobPart.id,
    metadata: {
      jobOrderId,
      partId: parsed.partId,
      quantity: parsed.quantity,
    },
  });

  return result;
}

export async function removePartFromJob(jobPartId: string) {
  const actor = await requireReception();

  const deletedJobPart = await prisma.$transaction(async (tx) => {
    const jobPart = await tx.jobPart.findUnique({
      where: {
        id: jobPartId,
      },
      select: {
        id: true,
        jobOrderId: true,
        partId: true,
        quantity: true,
        jobOrder: {
          select: {
            status: true,
            approvedByCustomer: true,
            invoice: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!jobPart) {
      throw new Error("Job part not found");
    }

    assertCanEditJobCosts({
      status: jobPart.jobOrder.status,
      approvedByCustomer: jobPart.jobOrder.approvedByCustomer,
      hasInvoice: Boolean(jobPart.jobOrder.invoice),
    });

    await tx.jobPart.delete({
      where: {
        id: jobPart.id,
      },
    });

    await tx.part.update({
      where: {
        id: jobPart.partId,
      },
      data: {
        stockQty: {
          increment: jobPart.quantity,
        },
      },
    });

    const job = await tx.jobOrder.findUnique({
      where: {
        id: jobPart.jobOrderId,
      },
      select: {
        serviceFee: true,
        parts: {
          select: {
            quantity: true,
            unitPrice: true,
          },
        },
      },
    });

    if (!job) {
      throw new Error("Job order not found");
    }

    const partsTotal = calculatePartsTotal(job.parts);
    const total = partsTotal + Number(job.serviceFee);

    await tx.jobOrder.update({
      where: {
        id: jobPart.jobOrderId,
      },
      data: {
        estimatedCost: total,
        totalCost: total,
      },
    });

    return jobPart;
  });

  revalidateJobCostPaths(deletedJobPart.jobOrderId);
  await createAuditLog({
    user: actor,
    action: "JOB_PART_REMOVED",
    entity: "JobPart",
    entityId: deletedJobPart.id,
    metadata: {
      jobOrderId: deletedJobPart.jobOrderId,
      partId: deletedJobPart.partId,
      quantity: deletedJobPart.quantity,
    },
  });

  return deletedJobPart;
}

export async function updateJobServiceFee(jobOrderId: string, serviceFee: number) {
  const actor = await requireReception();

  if (serviceFee < 0) {
    throw new Error("Service fee cannot be negative");
  }

  await prisma.$transaction(async (tx) => {
    const job = await tx.jobOrder.findUnique({
      where: {
        id: jobOrderId,
      },
      select: {
        status: true,
        approvedByCustomer: true,
        invoice: {
          select: {
            id: true,
          },
        },
        parts: {
          select: {
            quantity: true,
            unitPrice: true,
          },
        },
      },
    });

    if (!job) {
      throw new Error("Job order not found");
    }

    assertCanEditJobCosts({
      status: job.status,
      approvedByCustomer: job.approvedByCustomer,
      hasInvoice: Boolean(job.invoice),
    });

    const partsTotal = calculatePartsTotal(job.parts);
    const total = partsTotal + serviceFee;

    await tx.jobOrder.update({
      where: {
        id: jobOrderId,
      },
      data: {
        serviceFee,
        estimatedCost: total,
        totalCost: total,
      },
    });
  });
  revalidateJobCostPaths(jobOrderId);
  await createAuditLog({
    user: actor,
    action: "JOB_SERVICE_FEE_UPDATED",
    entity: "JobOrder",
    entityId: jobOrderId,
    metadata: {
      serviceFee,
    },
  });
}

export async function approveEstimate(jobOrderId: string) {
  const actor = await requireReception();

  const job = await prisma.jobOrder.findUnique({
    where: {
      id: jobOrderId,
    },
    select: {
      status: true,
      diagnosisNotes: true,
      invoice: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!job) {
    throw new Error("Job order not found");
  }

  assertCanApproveEstimate({
    status: job.status,
    hasDiagnosis: Boolean(job.diagnosisNotes),
    hasInvoice: Boolean(job.invoice),
  });

  await prisma.jobOrder.update({
    where: {
      id: jobOrderId,
    },
    data: {
      approvedByCustomer: true,
      status: "APPROVED",
    },
  });

  revalidateJobCostPaths(jobOrderId);
  await createAuditLog({
    user: actor,
    action: "JOB_ESTIMATE_APPROVED",
    entity: "JobOrder",
    entityId: jobOrderId,
  });
}
