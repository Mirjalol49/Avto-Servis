"use server";

import { revalidatePath } from "next/cache";

import { createAuditLog } from "@/lib/audit/log";
import { requireAdmin, requireReception } from "@/lib/auth/permissions";
import {
  carFormSchema,
  getAttachmentType,
  getFileFromFormData,
  validateUploadFile,
} from "@/lib/cars/validation";
import { prisma } from "@/lib/prisma";
import { deleteFile, uploadFile } from "@/lib/upload";

const carFilesBucket = "car-service-files";

function revalidateCarPaths(carId?: string) {
  revalidatePath("/dashboard/cars");

  if (carId) {
    revalidatePath(`/dashboard/cars/${carId}`);
  }
}

async function deleteFiles(urls: string[]) {
  await Promise.all(
    urls.map((url) => deleteFile(url, carFilesBucket).catch(() => undefined))
  );
}

function parseCarFormData(formData: FormData) {
  return carFormSchema.parse({
    plateNumber: String(formData.get("plateNumber") ?? ""),
    customerId: String(formData.get("customerId") ?? ""),
  });
}

export async function getCarFormCustomers() {
  return prisma.customer.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      phone: true,
    },
  });
}

export async function getCars(search?: string) {
  const trimmedSearch = search?.trim();

  return prisma.car.findMany({
    where: trimmedSearch
      ? {
          OR: [
            {
              plateNumber: {
                contains: trimmedSearch.replace(/[^a-zA-Z0-9]/g, "").toUpperCase(),
                mode: "insensitive",
              },
            },
            {
              customer: {
                name: {
                  contains: trimmedSearch,
                  mode: "insensitive",
                },
              },
            },
          ],
        }
      : undefined,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      plateNumber: true,
      plateImageUrl: true,
      attachmentUrl: true,
      attachmentType: true,
      createdAt: true,
      customer: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          jobOrders: true,
        },
      },
    },
  });
}

export async function getCarById(id: string) {
  return prisma.car.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      plateNumber: true,
      plateImageUrl: true,
      attachmentUrl: true,
      attachmentType: true,
      createdAt: true,
      customer: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
      jobOrders: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
          problemDescription: true,
          totalCost: true,
        },
      },
    },
  });
}

export async function createCar(formData: FormData) {
  const actor = await requireReception();

  const parsed = parseCarFormData(formData);
  const plateImage = getFileFromFormData(formData, "plateImage");
  const attachment = getFileFromFormData(formData, "attachment");

  if (!plateImage) {
    throw new Error("Plate image is required");
  }

  validateUploadFile(plateImage, { imageOnly: true });

  if (attachment) {
    validateUploadFile(attachment);
  }

  const existingCar = await prisma.car.findUnique({
    where: {
      plateNumber: parsed.plateNumber,
    },
    select: {
      id: true,
    },
  });

  if (existingCar) {
    throw new Error("A car with this plate number already exists");
  }

  const uploadedUrls: string[] = [];

  try {
    const plateImageUrl = await uploadFile(
      plateImage,
      carFilesBucket,
      "plate-images"
    );
    uploadedUrls.push(plateImageUrl);

    const attachmentUrl = attachment
      ? await uploadFile(attachment, carFilesBucket, "attachments")
      : null;

    if (attachmentUrl) {
      uploadedUrls.push(attachmentUrl);
    }

    const car = await prisma.car.create({
      data: {
        plateNumber: parsed.plateNumber,
        plateImageUrl,
        attachmentUrl,
        attachmentType: attachment ? getAttachmentType(attachment.type) : null,
        customerId: parsed.customerId,
      },
    });

    revalidateCarPaths(car.id);
    await createAuditLog({
      user: actor,
      action: "CAR_CREATED",
      entity: "Car",
      entityId: car.id,
      metadata: {
        plateNumber: car.plateNumber,
      },
    });

    return car;
  } catch (error) {
    await deleteFiles(uploadedUrls);
    throw error;
  }
}

export async function updateCar(id: string, formData: FormData) {
  const actor = await requireReception();

  const parsed = parseCarFormData(formData);
  const plateImage = getFileFromFormData(formData, "plateImage");
  const attachment = getFileFromFormData(formData, "attachment");

  if (plateImage) {
    validateUploadFile(plateImage, { imageOnly: true });
  }

  if (attachment) {
    validateUploadFile(attachment);
  }

  const existingCar = await prisma.car.findUnique({
    where: {
      id,
    },
  });

  if (!existingCar) {
    throw new Error("Car not found");
  }

  const duplicateCar = await prisma.car.findFirst({
    where: {
      plateNumber: parsed.plateNumber,
      NOT: {
        id,
      },
    },
    select: {
      id: true,
    },
  });

  if (duplicateCar) {
    throw new Error("A car with this plate number already exists");
  }

  const uploadedUrls: string[] = [];

  try {
    const plateImageUrl = plateImage
      ? await uploadFile(plateImage, carFilesBucket, "plate-images")
      : existingCar.plateImageUrl;

    if (plateImage && plateImageUrl) {
      uploadedUrls.push(plateImageUrl);
    }

    const attachmentUrl = attachment
      ? await uploadFile(attachment, carFilesBucket, "attachments")
      : existingCar.attachmentUrl;

    if (attachment && attachmentUrl) {
      uploadedUrls.push(attachmentUrl);
    }

    const car = await prisma.car.update({
      where: {
        id,
      },
      data: {
        plateNumber: parsed.plateNumber,
        customerId: parsed.customerId,
        plateImageUrl,
        attachmentUrl,
        attachmentType: attachment
          ? getAttachmentType(attachment.type)
          : existingCar.attachmentType,
      },
    });

    const replacedUrls = [
      plateImage ? existingCar.plateImageUrl : null,
      attachment ? existingCar.attachmentUrl : null,
    ].filter((url): url is string => Boolean(url));

    await deleteFiles(replacedUrls);
    revalidateCarPaths(id);
    await createAuditLog({
      user: actor,
      action: "CAR_UPDATED",
      entity: "Car",
      entityId: id,
      metadata: {
        plateNumber: car.plateNumber,
      },
    });

    return car;
  } catch (error) {
    await deleteFiles(uploadedUrls);
    throw error;
  }
}

export async function deleteCar(id: string) {
  const actor = await requireAdmin();

  const car = await prisma.car.findUnique({
    where: {
      id,
    },
    select: {
      plateImageUrl: true,
      attachmentUrl: true,
    },
  });

  if (!car) {
    throw new Error("Car not found");
  }

  await prisma.car.delete({
    where: {
      id,
    },
  });

  await deleteFiles(
    [car.plateImageUrl, car.attachmentUrl].filter((url): url is string =>
      Boolean(url)
    )
  );
  revalidateCarPaths(id);
  await createAuditLog({
    user: actor,
    action: "CAR_DELETED",
    entity: "Car",
    entityId: id,
  });
}
