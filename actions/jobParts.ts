"use server";

import { revalidatePath } from "next/cache";

import { createAuditLog } from "@/lib/audit/log";
import { requireReception } from "@/lib/auth/permissions";
import { calculatePartsTotal } from "@/lib/money";
import { addJobPartSchema } from "@/lib/parts/validation";
import { prisma } from "@/lib/prisma";

function revalidateJobCostPaths(jobOrderId: string) {
  revalidatePath(`/dashboard/jobs/${jobOrderId}`);
  revalidatePath("/dashboard/jobs");
  revalidatePath("/dashboard/parts");
}

async function recalculateJobCosts(jobOrderId: string) {
  const job = await prisma.jobOrder.findUnique({
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

  if (!job) {
    throw new Error("Job order not found");
  }

  const partsTotal = calculatePartsTotal(job.parts);
  const serviceFee = Number(job.serviceFee);
  const total = partsTotal + serviceFee;

  await prisma.jobOrder.update({
    where: {
      id: jobOrderId,
    },
    data: {
      estimatedCost: total,
      totalCost: total,
    },
  });

  return { partsTotal, serviceFee, total };
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

    const updatedPart = await tx.part.update({
      where: {
        id: part.id,
      },
      data: {
        stockQty: part.stockQty - parsed.quantity,
      },
      select: {
        name: true,
        stockQty: true,
      },
    });

    const job = await tx.jobOrder.findUnique({
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

    if (!job) {
      throw new Error("Job order not found");
    }

    const partsTotal = calculatePartsTotal(job.parts);
    const total = partsTotal + Number(job.serviceFee);

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
      },
    });

    if (!jobPart) {
      throw new Error("Job part not found");
    }

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

  await prisma.jobOrder.update({
    where: {
      id: jobOrderId,
    },
    data: {
      serviceFee,
    },
  });
  await recalculateJobCosts(jobOrderId);
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
