import type { Prisma } from "@prisma/client";

import { formatInvoiceNumber } from "@/lib/invoices/formatting";
import { prisma } from "@/lib/prisma";

const invoiceSelect = {
  id: true,
  jobOrderId: true,
  partsTotal: true,
  serviceFee: true,
  totalAmount: true,
  isPaid: true,
  paymentMethod: true,
  paidAt: true,
  createdAt: true,
  jobOrder: {
    select: {
      id: true,
      status: true,
      createdAt: true,
      problemDescription: true,
      car: {
        select: {
          id: true,
          plateNumber: true,
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
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
      parts: {
        orderBy: {
          id: "asc",
        },
        select: {
          id: true,
          quantity: true,
          unitPrice: true,
          part: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.InvoiceSelect;

export type InvoiceRecord = Prisma.InvoiceGetPayload<{
  select: typeof invoiceSelect;
}>;

export type InvoiceWithNumber = InvoiceRecord & {
  invoiceNumber: string;
  sequence: number;
};

export type SerializableInvoice = {
  id: string;
  invoiceNumber: string;
  sequence: number;
  jobOrderId: string;
  partsTotal: number;
  serviceFee: number;
  totalAmount: number;
  isPaid: boolean;
  paymentMethod: string | null;
  paidAt: string | null;
  createdAt: string;
  jobOrder: {
    id: string;
    status: string;
    createdAt: string;
    problemDescription: string;
    car: {
      id: string;
      plateNumber: string;
      customer: {
        id: string;
        name: string;
        phone: string;
      };
    };
    master: {
      id: string;
      name: string;
      specialization: string | null;
    } | null;
    parts: Array<{
      id: string;
      quantity: number;
      unitPrice: number;
      part: {
        id: string;
        name: string;
      };
    }>;
  };
};

export function toSerializableInvoice(invoice: InvoiceWithNumber): SerializableInvoice {
  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    sequence: invoice.sequence,
    jobOrderId: invoice.jobOrderId,
    partsTotal: Number(invoice.partsTotal),
    serviceFee: Number(invoice.serviceFee),
    totalAmount: Number(invoice.totalAmount),
    isPaid: invoice.isPaid,
    paymentMethod: invoice.paymentMethod,
    paidAt: invoice.paidAt?.toISOString() ?? null,
    createdAt: invoice.createdAt.toISOString(),
    jobOrder: {
      id: invoice.jobOrder.id,
      status: invoice.jobOrder.status,
      createdAt: invoice.jobOrder.createdAt.toISOString(),
      problemDescription: invoice.jobOrder.problemDescription,
      car: invoice.jobOrder.car,
      master: invoice.jobOrder.master,
      parts: invoice.jobOrder.parts.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        part: item.part,
      })),
    },
  };
}

async function getInvoiceSequence(invoice: { id: string; createdAt: Date }) {
  return prisma.invoice.count({
    where: {
      OR: [
        {
          createdAt: {
            lt: invoice.createdAt,
          },
        },
        {
          createdAt: invoice.createdAt,
          id: {
            lte: invoice.id,
          },
        },
      ],
    },
  });
}

async function withInvoiceNumber(invoice: InvoiceRecord | null) {
  if (!invoice) {
    return null;
  }

  const sequence = await getInvoiceSequence(invoice);

  return {
    ...invoice,
    sequence,
    invoiceNumber: formatInvoiceNumber(sequence),
  };
}

export async function getInvoiceRecordById(id: string) {
  const invoice = await prisma.invoice.findUnique({
    where: {
      id,
    },
    select: invoiceSelect,
  });

  return withInvoiceNumber(invoice);
}

export async function getInvoiceRecordByJobId(jobOrderId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: {
      jobOrderId,
    },
    select: invoiceSelect,
  });

  return withInvoiceNumber(invoice);
}
