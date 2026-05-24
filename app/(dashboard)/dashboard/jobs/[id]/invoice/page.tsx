import { format } from "date-fns";
import { notFound } from "next/navigation";

import { getInvoiceByJobId } from "@/actions/invoices";
import { InvoiceActionsBar } from "@/components/invoices/InvoiceActionsBar";
import { MarkPaidDialog } from "@/components/invoices/MarkPaidDialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatUzbekPhone } from "@/lib/customers/validation";
import { shortJobId } from "@/lib/jobs/status";
import { formatCurrency } from "@/lib/money";
import { cn } from "@/lib/utils";

type InvoicePageProps = {
  params: {
    id: string;
  };
};

export const dynamic = "force-dynamic";

function paymentMethodLabel(value: string | null) {
  if (value === "CASH") return "Cash";
  if (value === "CARD") return "Card";
  if (value === "TRANSFER") return "Bank Transfer";

  return "Unknown";
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const invoice = await getInvoiceByJobId(params.id);

  if (!invoice) {
    notFound();
  }

  const customer = invoice.jobOrder.car.customer;
  const car = invoice.jobOrder.car;
  const parts = invoice.jobOrder.parts;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <div className="rounded-xl border border-white/10 bg-card/80 p-6 backdrop-blur-xl print:border-0">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-lg font-bold text-slate-200 shadow-[0_8px_20px_rgba(0,0,0,0.16)]">
              AS
            </div>
            <div>
              <div className="font-heading text-xl font-semibold">AutoServis</div>
              <div className="text-sm text-muted-foreground">Car service management</div>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <h1 className="font-heading text-4xl font-semibold tracking-normal">INVOICE</h1>
            <div className="mt-1 font-mono text-sm">{invoice.invoiceNumber}</div>
            <div className="text-sm text-muted-foreground">
              {format(invoice.createdAt, "dd MMM yyyy")}
            </div>
          </div>
        </header>

        <section className="grid gap-4 py-6 md:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-muted/30 p-4">
            <div className="mb-3 text-sm font-medium text-muted-foreground">Customer</div>
            <div className="font-semibold">{customer.name}</div>
            <div className="text-sm text-muted-foreground">
              {formatUzbekPhone(customer.phone)}
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-muted/30 p-4">
            <div className="mb-3 text-sm font-medium text-muted-foreground">Car</div>
            <div className="font-semibold">{car.plateNumber}</div>
            <div className="text-sm text-muted-foreground">
              Job {shortJobId(invoice.jobOrder.id)}
            </div>
            <div className="text-sm text-muted-foreground">
              Master: {invoice.jobOrder.master?.name ?? "Unassigned"}
            </div>
          </div>
        </section>

        <div className="overflow-hidden rounded-lg border border-white/10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Part Name</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parts.length > 0 ? (
                parts.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{item.part.name}</TableCell>
                    <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(item.unitPrice) * item.quantity)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell>1</TableCell>
                  <TableCell className="font-medium">Service only</TableCell>
                  <TableCell>{formatCurrency(invoice.serviceFee)}</TableCell>
                  <TableCell>1</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(invoice.serviceFee)}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <section className="ml-auto mt-6 flex w-full max-w-sm flex-col gap-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Parts Total</span>
            <span>{formatCurrency(invoice.partsTotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Service Fee</span>
            <span>{formatCurrency(invoice.serviceFee)}</span>
          </div>
          <div className="border-t-2 pt-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold">TOTAL</span>
              <span className="text-2xl font-semibold">
                {formatCurrency(invoice.totalAmount)}
              </span>
            </div>
          </div>
        </section>

        <section className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <Badge
              variant="outline"
              className={cn(
                "w-fit px-4 py-1 text-base",
                invoice.isPaid
                  ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200"
                  : "border-amber-400/25 bg-amber-400/10 text-amber-200"
              )}
            >
              {invoice.isPaid ? "PAID" : "UNPAID"}
            </Badge>
            {invoice.isPaid ? (
              <div className="text-sm text-muted-foreground">
                {paymentMethodLabel(invoice.paymentMethod)} ·{" "}
                {invoice.paidAt ? format(invoice.paidAt, "dd MMM yyyy, HH:mm") : ""}
              </div>
            ) : null}
          </div>
          {!invoice.isPaid ? <MarkPaidDialog invoiceId={invoice.id} /> : null}
        </section>
      </div>

      <InvoiceActionsBar invoiceId={invoice.id} jobOrderId={invoice.jobOrder.id} />
    </div>
  );
}
