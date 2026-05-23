"use server";

import { revalidatePath } from "next/cache";

import { createAuditLog } from "@/lib/audit/log";
import { requireAdmin, requireReception } from "@/lib/auth/permissions";
import {
  customerSchema,
  updateCustomerSchema,
  type CustomerInput,
  type UpdateCustomerInput,
} from "@/lib/customers/validation";
import { prisma } from "@/lib/prisma";

function revalidateCustomerPaths(customerId?: string) {
  revalidatePath("/dashboard/customers");

  if (customerId) {
    revalidatePath(`/dashboard/customers/${customerId}`);
  }
}

export async function getCustomers(search?: string) {
  const trimmedSearch = search?.trim();
  const phoneSearch = trimmedSearch?.replace(/\D/g, "");

  return prisma.customer.findMany({
    where: trimmedSearch
      ? {
          OR: [
            {
              name: {
                contains: trimmedSearch,
                mode: "insensitive",
              },
            },
            ...(phoneSearch
              ? [
                  {
                    phone: {
                      contains: phoneSearch,
                    },
                  },
                ]
              : []),
          ],
        }
      : undefined,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      phone: true,
      createdAt: true,
      _count: {
        select: {
          cars: true,
        },
      },
    },
  });
}

export async function getCustomerById(id: string) {
  return prisma.customer.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
      cars: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          plateNumber: true,
          _count: {
            select: {
              jobOrders: true,
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
              totalCost: true,
              car: {
                select: {
                  plateNumber: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function createCustomer(data: CustomerInput) {
  const actor = await requireReception();

  const parsed = customerSchema.parse(data);
  const existingCustomer = await prisma.customer.findUnique({
    where: {
      phone: parsed.phone,
    },
    select: {
      id: true,
    },
  });

  if (existingCustomer) {
    throw new Error("A customer with this phone number already exists");
  }

  const customer = await prisma.customer.create({
    data: parsed,
  });

  revalidateCustomerPaths(customer.id);
  await createAuditLog({
    user: actor,
    action: "CUSTOMER_CREATED",
    entity: "Customer",
    entityId: customer.id,
    metadata: {
      phone: customer.phone,
    },
  });

  return customer;
}

export async function updateCustomer(id: string, data: UpdateCustomerInput) {
  const actor = await requireReception();

  const parsed = updateCustomerSchema.parse(data);

  if (parsed.phone) {
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        phone: parsed.phone,
        NOT: {
          id,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingCustomer) {
      throw new Error("A customer with this phone number already exists");
    }
  }

  const customer = await prisma.customer.update({
    where: {
      id,
    },
    data: parsed,
  });

  revalidateCustomerPaths(id);
  await createAuditLog({
    user: actor,
    action: "CUSTOMER_UPDATED",
    entity: "Customer",
    entityId: id,
  });

  return customer;
}

export async function deleteCustomer(id: string) {
  const actor = await requireAdmin();

  const jobOrderCount = await prisma.jobOrder.count({
    where: {
      car: {
        customerId: id,
      },
    },
  });

  if (jobOrderCount > 0) {
    throw new Error("Customer cannot be deleted while job orders exist");
  }

  await prisma.customer.delete({
    where: {
      id,
    },
  });

  revalidateCustomerPaths(id);
  await createAuditLog({
    user: actor,
    action: "CUSTOMER_DELETED",
    entity: "Customer",
    entityId: id,
  });
}
