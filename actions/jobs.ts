"use server";

import type { JobPhotoType, JobStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { createAuditLog } from "@/lib/audit/log";
import {
  requireReception,
  requireWorkshopAccess,
} from "@/lib/auth/permissions";
import { validateUploadFile } from "@/lib/cars/validation";
import {
  createJobOrderSchema,
  diagnosisSchema,
  serviceFeeSchema,
  type CreateJobOrderInput,
  type DiagnosisInput,
} from "@/lib/jobs/validation";
import {
  assertCanSaveDiagnosis,
  assertCanTransitionJobStatus,
  jobStatusFlow,
} from "@/lib/jobs/status";
import { prisma } from "@/lib/prisma";
import { deleteFile, uploadFile } from "@/lib/upload";

const jobFilesBucket = "car-service-files";

type JobFilters = {
  status?: JobStatus;
  search?: string;
};

function revalidateJobPaths(jobId?: string) {
  revalidatePath("/dashboard/jobs");

  if (jobId) {
    revalidatePath(`/dashboard/jobs/${jobId}`);
  }
}

function parseNullableMasterId(masterId?: string | null) {
  return masterId && masterId.length > 0 ? masterId : null;
}

async function assertAssignableMaster(masterId: string | null) {
  if (!masterId) {
    return;
  }

  const master = await prisma.master.findUnique({
    where: {
      id: masterId,
    },
    select: {
      isActive: true,
    },
  });

  if (!master?.isActive) {
    throw new Error("Inactive masters cannot be assigned to new jobs");
  }
}

export async function getJobFormData() {
  const [cars, masters] = await Promise.all([
    prisma.car.findMany({
      orderBy: {
        plateNumber: "asc",
      },
      select: {
        id: true,
        plateNumber: true,
        customer: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.master.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        specialization: true,
      },
    }),
  ]);

  return { cars, masters };
}

export async function createJobOrder(data: CreateJobOrderInput) {
  const actor = await requireReception();

  const parsed = createJobOrderSchema.parse(data);
  const masterId = parseNullableMasterId(parsed.masterId);

  await assertAssignableMaster(masterId);

  const job = await prisma.jobOrder.create({
    data: {
      carId: parsed.carId,
      masterId,
      status: "WAITING",
      problemDescription: parsed.problemDescription,
    },
    select: {
      id: true,
    },
  });

  revalidateJobPaths(job.id);
  await createAuditLog({
    user: actor,
    action: "JOB_CREATED",
    entity: "JobOrder",
    entityId: job.id,
    metadata: {
      carId: parsed.carId,
      masterId,
    },
  });

  return job;
}

export async function getJobOrders(filters?: JobFilters) {
  const search = filters?.search?.trim();
  const plateSearch = search?.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  return prisma.jobOrder.findMany({
    where: {
      ...(filters?.status ? { status: filters.status } : {}),
      ...(search
        ? {
            OR: [
              {
                id: {
                  contains: search.replace(/^#?JO-?/i, ""),
                  mode: "insensitive",
                },
              },
              {
                car: {
                  plateNumber: {
                    contains: plateSearch,
                    mode: "insensitive",
                  },
                },
              },
            ],
          }
        : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
      car: {
        select: {
          plateNumber: true,
          customer: {
            select: {
              name: true,
            },
          },
        },
      },
      master: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          parts: true,
        },
      },
    },
  });
}

export async function getJobStatusCounts() {
  const grouped = await prisma.jobOrder.groupBy({
    by: ["status"],
    _count: {
      status: true,
    },
  });
  const counts = Object.fromEntries(
    jobStatusFlow.map((status) => [status, 0])
  ) as Record<JobStatus, number>;

  for (const item of grouped) {
    counts[item.status] = item._count.status;
  }

  return counts;
}

export async function getJobOrderById(id: string) {
  return prisma.jobOrder.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      status: true,
      problemDescription: true,
      diagnosisNotes: true,
      estimatedCost: true,
      serviceFee: true,
      totalCost: true,
      approvedByCustomer: true,
      createdAt: true,
      updatedAt: true,
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
      master: {
        select: {
          id: true,
          name: true,
          specialization: true,
        },
      },
      photos: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          url: true,
          type: true,
          createdAt: true,
        },
      },
      parts: {
        select: {
          id: true,
          quantity: true,
          unitPrice: true,
          part: {
            select: {
              id: true,
              name: true,
              unitPrice: true,
            },
          },
        },
      },
      invoice: true,
    },
  });
}

export async function updateJobStatus(id: string, status: JobStatus) {
  const actor = await requireWorkshopAccess();

  const job = await prisma.jobOrder.findUnique({
    where: {
      id,
    },
    select: {
      status: true,
      diagnosisNotes: true,
      approvedByCustomer: true,
      photos: {
        where: {
          type: "AFTER",
        },
        select: {
          id: true,
        },
      },
      invoice: {
        select: {
          id: true,
          isPaid: true,
        },
      },
    },
  });

  if (!job) {
    throw new Error("Job order not found");
  }

  assertCanTransitionJobStatus(job.status, status, {
    hasDiagnosis: Boolean(job.diagnosisNotes),
    approvedByCustomer: job.approvedByCustomer,
    hasAfterPhoto: job.photos.length > 0,
    hasPaidInvoice: Boolean(job.invoice?.isPaid),
  });

  const updatedJob = await prisma.jobOrder.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });

  revalidateJobPaths(id);
  await createAuditLog({
    user: actor,
    action: "JOB_STATUS_UPDATED",
    entity: "JobOrder",
    entityId: id,
    metadata: {
      from: job.status,
      to: status,
    },
  });

  return updatedJob;
}

export async function addDiagnosis(id: string, data: DiagnosisInput) {
  const actor = await requireWorkshopAccess();

  const parsed = diagnosisSchema.parse(data);

  await assertAssignableMaster(parsed.masterId);

  const existingJob = await prisma.jobOrder.findUnique({
    where: {
      id,
    },
    select: {
      status: true,
    },
  });

  if (!existingJob) {
    throw new Error("Job order not found");
  }

  assertCanSaveDiagnosis(existingJob.status);

  const job = await prisma.jobOrder.update({
    where: {
      id,
    },
    data: {
      diagnosisNotes: parsed.diagnosisNotes,
      masterId: parsed.masterId,
      status: "DIAGNOSED",
    },
  });

  revalidateJobPaths(id);
  await createAuditLog({
    user: actor,
    action: "JOB_DIAGNOSIS_SAVED",
    entity: "JobOrder",
    entityId: id,
    metadata: {
      masterId: parsed.masterId,
    },
  });

  return job;
}

export async function addPhotos(id: string, type: JobPhotoType, files: File[]) {
  const actor = await requireWorkshopAccess();

  if (files.length === 0) {
    throw new Error("Select at least one photo");
  }

  if (files.length > 10) {
    throw new Error("A maximum of 10 photos can be uploaded at once");
  }

  const currentCount = await prisma.jobPhoto.count({
    where: {
      jobOrderId: id,
      type,
    },
  });

  if (currentCount + files.length > 10) {
    throw new Error("A job can have a maximum of 10 photos per section");
  }

  for (const file of files) {
    validateUploadFile(file, { imageOnly: true });
  }

  const uploadedUrls: string[] = [];

  try {
    for (const file of files) {
      const url = await uploadFile(file, jobFilesBucket, `jobs/${id}/${type}`);
      uploadedUrls.push(url);
    }

    await prisma.jobPhoto.createMany({
      data: uploadedUrls.map((url) => ({
        jobOrderId: id,
        url,
        type,
      })),
    });

    revalidateJobPaths(id);
    await createAuditLog({
      user: actor,
      action: "JOB_PHOTOS_ADDED",
      entity: "JobOrder",
      entityId: id,
      metadata: {
        type,
        count: uploadedUrls.length,
      },
    });

    return uploadedUrls;
  } catch (error) {
    await Promise.all(
      uploadedUrls.map((url) => deleteFile(url, jobFilesBucket).catch(() => undefined))
    );
    throw error;
  }
}

export async function deletePhoto(photoId: string) {
  const actor = await requireWorkshopAccess();

  const photo = await prisma.jobPhoto.findUnique({
    where: {
      id: photoId,
    },
    select: {
      id: true,
      url: true,
      jobOrderId: true,
    },
  });

  if (!photo) {
    throw new Error("Photo not found");
  }

  await prisma.jobPhoto.delete({
    where: {
      id: photoId,
    },
  });
  await deleteFile(photo.url, jobFilesBucket);
  revalidateJobPaths(photo.jobOrderId);
  await createAuditLog({
    user: actor,
    action: "JOB_PHOTO_DELETED",
    entity: "JobPhoto",
    entityId: photo.id,
    metadata: {
      jobOrderId: photo.jobOrderId,
    },
  });
}

export async function updateServiceFee(id: string, value: number) {
  const actor = await requireReception();

  const parsed = serviceFeeSchema.parse({ serviceFee: value });
  const job = await prisma.jobOrder.findUnique({
    where: {
      id,
    },
    select: {
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

  const partsTotal = job.parts.reduce((total, part) => {
    return total + Number(part.unitPrice) * part.quantity;
  }, 0);
  const totalCost = partsTotal + parsed.serviceFee;

  await prisma.jobOrder.update({
    where: {
      id,
    },
    data: {
      serviceFee: parsed.serviceFee,
      totalCost,
    },
  });

  revalidateJobPaths(id);
  await createAuditLog({
    user: actor,
    action: "JOB_SERVICE_FEE_UPDATED",
    entity: "JobOrder",
    entityId: id,
    metadata: {
      serviceFee: parsed.serviceFee,
      totalCost,
    },
  });
}
