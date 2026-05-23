"use server";

import { revalidatePath } from "next/cache";

import { createAuditLog } from "@/lib/audit/log";
import { requireAdmin, requireReception } from "@/lib/auth/permissions";
import { calculatePartsTotal } from "@/lib/money";
import {
  partSchema,
  stockAdjustmentSchema,
  updatePartSchema,
  type PartInput,
  type UpdatePartInput,
} from "@/lib/parts/validation";
import { prisma } from "@/lib/prisma";

function revalidatePartPaths() {
  revalidatePath("/dashboard/parts");
  revalidatePath("/dashboard/jobs");
}

export async function getParts(search?: string) {
  const trimmedSearch = search?.trim();

  const parts = await prisma.part.findMany({
    where: trimmedSearch
      ? {
          name: {
            contains: trimmedSearch,
            mode: "insensitive",
          },
        }
      : undefined,
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      stockQty: true,
      unitPrice: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          jobParts: true,
        },
      },
    },
  });

  return parts.map((part) => ({
    ...part,
    stockStatus:
      part.stockQty < 5
        ? "LOW_STOCK"
        : part.stockQty < 10
          ? "LIMITED_STOCK"
          : "IN_STOCK",
  }));
}

export async function getPartsSummary() {
  const parts = await prisma.part.findMany({
    select: {
      stockQty: true,
      unitPrice: true,
    },
  });

  return {
    totalParts: parts.length,
    lowStock: parts.filter((part) => part.stockQty < 5).length,
    totalInventoryValue: calculatePartsTotal(
      parts.map((part) => ({
        quantity: part.stockQty,
        unitPrice: part.unitPrice,
      }))
    ),
  };
}

export async function createPart(data: PartInput) {
  const actor = await requireReception();

  const parsed = partSchema.parse(data);
  const part = await prisma.part.create({
    data: parsed,
  });

  revalidatePartPaths();
  await createAuditLog({
    user: actor,
    action: "PART_CREATED",
    entity: "Part",
    entityId: part.id,
    metadata: {
      name: part.name,
      stockQty: part.stockQty,
    },
  });

  return part;
}

export async function updatePart(id: string, data: UpdatePartInput) {
  const actor = await requireReception();

  const parsed = updatePartSchema.parse(data);
  const part = await prisma.part.update({
    where: {
      id,
    },
    data: parsed,
  });

  revalidatePartPaths();
  await createAuditLog({
    user: actor,
    action: "PART_UPDATED",
    entity: "Part",
    entityId: id,
  });

  return part;
}

export async function deletePart(id: string) {
  const actor = await requireAdmin();

  const usageCount = await prisma.jobPart.count({
    where: {
      partId: id,
    },
  });

  if (usageCount > 0) {
    throw new Error("Part cannot be deleted while used in job orders");
  }

  await prisma.part.delete({
    where: {
      id,
    },
  });

  revalidatePartPaths();
  await createAuditLog({
    user: actor,
    action: "PART_DELETED",
    entity: "Part",
    entityId: id,
  });
}

export async function adjustStock(id: string, delta: number) {
  const actor = await requireReception();

  const parsed = stockAdjustmentSchema.parse({ delta });
  const part = await prisma.part.findUnique({
    where: {
      id,
    },
    select: {
      stockQty: true,
    },
  });

  if (!part) {
    throw new Error("Part not found");
  }

  const nextStockQty = part.stockQty + parsed.delta;

  if (nextStockQty < 0) {
    throw new Error("Stock quantity cannot be negative");
  }

  const updatedPart = await prisma.part.update({
    where: {
      id,
    },
    data: {
      stockQty: nextStockQty,
    },
  });

  revalidatePartPaths();
  await createAuditLog({
    user: actor,
    action: "PART_STOCK_ADJUSTED",
    entity: "Part",
    entityId: id,
    metadata: {
      delta: parsed.delta,
      nextStockQty: updatedPart.stockQty,
    },
  });

  return updatedPart;
}
