import { renderToBuffer } from "@react-pdf/renderer";
import { notFound } from "next/navigation";

import { InvoicePdfDocument } from "@/lib/generateInvoicePdf";
import { getInvoiceRecordById } from "@/lib/invoices/data";
import { invoicePdfFileName } from "@/lib/invoices/formatting";
import { getCurrency } from "@/lib/money";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type InvoicePdfRouteProps = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, { params }: InvoicePdfRouteProps) {
  const invoice = await getInvoiceRecordById(params.id);

  if (!invoice) {
    notFound();
  }

  const pdf = await renderToBuffer(
    InvoicePdfDocument({ invoice, currency: getCurrency() })
  );
  const fileName = invoicePdfFileName(invoice.id, invoice.jobOrder.car.plateNumber);

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
