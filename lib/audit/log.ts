import type { Prisma } from "@prisma/client";

import type { AppSessionUser } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";

export type AuditAction =
  | "USER_CREATED"
  | "CUSTOMER_CREATED"
  | "CUSTOMER_UPDATED"
  | "CUSTOMER_DELETED"
  | "CAR_CREATED"
  | "CAR_UPDATED"
  | "CAR_DELETED"
  | "MASTER_CREATED"
  | "MASTER_UPDATED"
  | "MASTER_STATUS_TOGGLED"
  | "PART_CREATED"
  | "PART_UPDATED"
  | "PART_DELETED"
  | "PART_STOCK_ADJUSTED"
  | "JOB_CREATED"
  | "JOB_STATUS_UPDATED"
  | "JOB_DIAGNOSIS_SAVED"
  | "JOB_PHOTOS_ADDED"
  | "JOB_PHOTO_DELETED"
  | "JOB_PART_ADDED"
  | "JOB_PART_REMOVED"
  | "JOB_SERVICE_FEE_UPDATED"
  | "JOB_ESTIMATE_APPROVED"
  | "INVOICE_GENERATED"
  | "INVOICE_PAID";

type AuditEntity =
  | "User"
  | "Customer"
  | "Car"
  | "Master"
  | "Part"
  | "JobOrder"
  | "JobPhoto"
  | "JobPart"
  | "Invoice";

type AuditUser = Pick<AppSessionUser, "id" | "role"> | null;

export async function createAuditLog({
  user,
  action,
  entity,
  entityId,
  metadata,
}: {
  user: AuditUser;
  action: AuditAction;
  entity: AuditEntity;
  entityId: string;
  metadata?: Prisma.InputJsonValue;
}) {
  return prisma.$transaction(async (tx) => {
    const auditLog = await tx.auditLog.create({
      data: {
        userId: user?.id ?? null,
        action,
        entity,
        entityId,
        metadata: {
          ...(metadata && typeof metadata === "object" && !Array.isArray(metadata)
            ? metadata
            : metadata === undefined
              ? {}
              : { value: metadata }),
          actorRole: user?.role ?? null,
        },
      },
    });

    await tx.realtimeEvent.create({
      data: {
        topic: "dashboard",
      },
    });

    return auditLog;
  });
}
