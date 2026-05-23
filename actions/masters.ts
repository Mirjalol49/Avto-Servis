"use server";

import type { JobStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { createAuditLog } from "@/lib/audit/log";
import { requireAdmin } from "@/lib/auth/permissions";
import {
  masterSchema,
  updateMasterSchema,
  type MasterData,
  type MasterInput,
  type UpdateMasterInput,
} from "@/lib/masters/validation";
import { prisma } from "@/lib/prisma";

const activeJobStatuses: JobStatus[] = ["WAITING", "IN_PROGRESS"];
const completedJobStatuses: JobStatus[] = ["COMPLETED", "DELIVERED"];

function revalidateMasterPaths(id?: string) {
  revalidatePath("/dashboard/masters");
  revalidatePath("/dashboard/jobs");

  if (id) {
    revalidatePath(`/dashboard/masters/${id}`);
  }
}

async function assertUniqueMasterPhone(phone: string, id?: string) {
  const existing = await prisma.master.findFirst({
    where: {
      phone,
      ...(id ? { NOT: { id } } : {}),
    },
    select: {
      id: true,
    },
  });

  if (existing) {
    throw new Error("A master with this phone already exists");
  }
}

function normalizeActionPhone<T extends { phone?: string }>(data: T) {
  if (!data.phone || !/^998\d{9}$/.test(data.phone)) {
    return data;
  }

  return {
    ...data,
    phone: `+${data.phone}`,
  };
}

export async function getMasters(includeInactive = false) {
  const masters = await prisma.master.findMany({
    where: includeInactive ? undefined : { isActive: true },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      phone: true,
      specialization: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: {
          jobOrders: true,
        },
      },
    },
  });
  const counts = await prisma.jobOrder.groupBy({
    by: ["masterId", "status"],
    where: {
      masterId: {
        in: masters.map((master) => master.id),
      },
    },
    _count: {
      status: true,
    },
  });

  return masters.map((master) => {
    const masterCounts = counts.filter((item) => item.masterId === master.id);

    return {
      ...master,
      activeJobsCount: masterCounts
        .filter((item) => activeJobStatuses.includes(item.status))
        .reduce((total, item) => total + item._count.status, 0),
      completedJobsCount: masterCounts
        .filter((item) => completedJobStatuses.includes(item.status))
        .reduce((total, item) => total + item._count.status, 0),
    };
  });
}

export async function getMasterById(id: string) {
  return prisma.master.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      phone: true,
      specialization: true,
      isActive: true,
      createdAt: true,
      jobOrders: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          status: true,
          problemDescription: true,
          createdAt: true,
          updatedAt: true,
          totalCost: true,
          car: {
            select: {
              id: true,
              plateNumber: true,
              customer: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function createMaster(data: MasterInput | MasterData) {
  const actor = await requireAdmin();

  const parsed = masterSchema.parse(normalizeActionPhone(data));
  await assertUniqueMasterPhone(parsed.phone);

  const master = await prisma.master.create({
    data: parsed,
  });

  revalidateMasterPaths(master.id);
  await createAuditLog({
    user: actor,
    action: "MASTER_CREATED",
    entity: "Master",
    entityId: master.id,
    metadata: {
      phone: master.phone,
      specialization: master.specialization,
    },
  });

  return master;
}

export async function updateMaster(id: string, data: UpdateMasterInput | Partial<MasterData>) {
  const actor = await requireAdmin();

  const parsed = updateMasterSchema.parse(normalizeActionPhone(data));

  if (parsed.phone) {
    await assertUniqueMasterPhone(parsed.phone, id);
  }

  const master = await prisma.master.update({
    where: {
      id,
    },
    data: parsed,
  });

  revalidateMasterPaths(id);
  await createAuditLog({
    user: actor,
    action: "MASTER_UPDATED",
    entity: "Master",
    entityId: id,
  });

  return master;
}

export async function toggleMasterActive(id: string) {
  const actor = await requireAdmin();

  const master = await prisma.master.findUnique({
    where: {
      id,
    },
    select: {
      isActive: true,
    },
  });

  if (!master) {
    throw new Error("Master not found");
  }

  const updatedMaster = await prisma.master.update({
    where: {
      id,
    },
    data: {
      isActive: !master.isActive,
    },
  });

  revalidateMasterPaths(id);
  await createAuditLog({
    user: actor,
    action: "MASTER_STATUS_TOGGLED",
    entity: "Master",
    entityId: id,
    metadata: {
      isActive: updatedMaster.isActive,
    },
  });

  return updatedMaster;
}

export async function getMasterStats(id: string) {
  const [totalJobs, activeJobs, completedJobs, deliveredJobs, finishedJobs] = await Promise.all([
    prisma.jobOrder.count({
      where: {
        masterId: id,
      },
    }),
    prisma.jobOrder.count({
      where: {
        masterId: id,
        status: {
          in: activeJobStatuses,
        },
      },
    }),
    prisma.jobOrder.count({
      where: {
        masterId: id,
        status: {
          in: completedJobStatuses,
        },
      },
    }),
    prisma.jobOrder.findMany({
      where: {
        masterId: id,
        status: "DELIVERED",
      },
      select: {
        totalCost: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.jobOrder.findMany({
      where: {
        masterId: id,
        status: {
          in: completedJobStatuses,
        },
      },
      select: {
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);
  const completedDurations = finishedJobs.map((job) => {
    return job.updatedAt.getTime() - job.createdAt.getTime();
  });
  const avgJobDuration =
    completedDurations.length > 0
      ? completedDurations.reduce((total, duration) => total + duration, 0) /
        completedDurations.length /
        86_400_000
      : 0;

  return {
    totalJobs,
    activeJobs,
    completedJobs,
    totalRevenue: deliveredJobs.reduce((total, job) => {
      return total + Number(job.totalCost ?? 0);
    }, 0),
    avgJobDuration,
  };
}
