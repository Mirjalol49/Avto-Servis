"use server";

import { revalidatePath } from "next/cache";

import { createAuditLog } from "@/lib/audit/log";
import { requireReception } from "@/lib/auth/permissions";
import {
  getInvoiceRecordById,
  getInvoiceRecordByJobId,
  toSerializableInvoice,
} from "@/lib/invoices/data";
import { paymentMethodSchema, type PaymentMethod } from "@/lib/invoices/validation";
import {
  assertCanGenerateInvoice,
  assertCanMarkInvoicePaid,
} from "@/lib/jobs/status";
import { calculatePartsTotal } from "@/lib/money";
import { prisma } from "@/lib/prisma";

function revalidateInvoicePaths(jobOrderId: string) {
  revalidatePath(`/dashboard/jobs/${jobOrderId}`);
  revalidatePath(`/dashboard/jobs/${jobOrderId}/invoice`);
  revalidatePath("/dashboard/jobs");
}

export async function generateInvoice(jobOrderId: string) {
  const actor = await requireReception();

  const existingInvoice = await getInvoiceRecordByJobId(jobOrderId);

  if (existingInvoice) {
    return toSerializableInvoice(existingInvoice);
  }

  const createdInvoice = await prisma.$transaction(async (tx) => {
    const job = await tx.jobOrder.findUnique({
      where: {
        id: jobOrderId,
      },
      select: {
        status: true,
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

    assertCanGenerateInvoice(job.status);

    const partsTotal = calculatePartsTotal(job.parts);
    const serviceFee = Number(job.serviceFee);
    const totalAmount = partsTotal + serviceFee;

    const invoice = await tx.invoice.create({
      data: {
        jobOrderId,
        partsTotal,
        serviceFee,
        totalAmount,
      },
      select: {
        id: true,
      },
    });

    await tx.jobOrder.update({
      where: {
        id: jobOrderId,
      },
      data: {
        totalCost: totalAmount,
      },
    });

    return invoice;
  });
  const invoice = await getInvoiceRecordById(createdInvoice.id);

  if (!invoice) {
    throw new Error("Invoice could not be loaded");
  }

  revalidateInvoicePaths(jobOrderId);
  await createAuditLog({
    user: actor,
    action: "INVOICE_GENERATED",
    entity: "Invoice",
    entityId: invoice.id,
    metadata: {
      jobOrderId,
      totalAmount: Number(invoice.totalAmount),
    },
  });

  return toSerializableInvoice(invoice);
}

export async function markAsPaid(invoiceId: string, paymentMethod: PaymentMethod) {
  const actor = await requireReception();

  const parsedPaymentMethod = paymentMethodSchema.parse(paymentMethod);
  const updatedInvoice = await prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findUnique({
      where: {
        id: invoiceId,
      },
      select: {
        isPaid: true,
        jobOrderId: true,
        jobOrder: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new Error("Invoice could not be loaded");
    }

    assertCanMarkInvoicePaid({
      isPaid: invoice.isPaid,
      jobStatus: invoice.jobOrder.status,
    });

    return tx.invoice.update({
      where: {
        id: invoiceId,
      },
      data: {
        isPaid: true,
        paymentMethod: parsedPaymentMethod,
        paidAt: new Date(),
        jobOrder: {
          update: {
            status: "DELIVERED",
          },
        },
      },
      select: {
        jobOrderId: true,
      },
    });
  });
  const invoice = await getInvoiceRecordById(invoiceId);

  if (!invoice) {
    throw new Error("Invoice could not be loaded");
  }

  revalidateInvoicePaths(updatedInvoice.jobOrderId);
  await createAuditLog({
    user: actor,
    action: "INVOICE_PAID",
    entity: "Invoice",
    entityId: invoiceId,
    metadata: {
      jobOrderId: updatedInvoice.jobOrderId,
      paymentMethod: parsedPaymentMethod,
    },
  });

  return toSerializableInvoice(invoice);
}

export async function getInvoiceByJobId(jobOrderId: string) {
  return getInvoiceRecordByJobId(jobOrderId);
}
