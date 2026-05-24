"use client";

import { DownloadIcon, PrinterIcon, Undo2Icon } from "lucide-react";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type InvoiceActionsBarProps = {
  invoiceId: string;
  jobOrderId: string;
};

export function InvoiceActionsBar({ invoiceId, jobOrderId }: InvoiceActionsBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2 rounded-xl border border-white/10 bg-card/80 p-3 backdrop-blur-xl print:hidden">
      <a
        href={`/api/invoices/${invoiceId}/pdf`}
        className={cn(buttonVariants({ variant: "outline" }))}
      >
        <DownloadIcon data-icon="inline-start" />
        Download PDF
      </a>
      <Button type="button" variant="outline" onClick={() => window.print()}>
        <PrinterIcon data-icon="inline-start" />
        Print
      </Button>
      <Link
        href={`/dashboard/jobs/${jobOrderId}`}
        className={cn(buttonVariants({ variant: "outline" }))}
      >
        <Undo2Icon data-icon="inline-start" />
        Back to Job
      </Link>
    </div>
  );
}
