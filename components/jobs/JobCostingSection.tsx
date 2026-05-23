"use client";

import { FileTextIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { generateInvoice } from "@/actions/invoices";
import { approveEstimate, removePartFromJob } from "@/actions/jobParts";
import {
  AddJobPartSheet,
  type AvailablePartOption,
} from "@/components/jobs/AddJobPartSheet";
import { ServiceFeeInput } from "@/components/jobs/ServiceFeeInput";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/money";
import { cn } from "@/lib/utils";

type JobPartRow = {
  id: string;
  partName: string;
  unitPrice: number;
  quantity: number;
};

type JobCostingSectionProps = {
  jobId: string;
  parts: JobPartRow[];
  availableParts: AvailablePartOption[];
  serviceFee: number;
  approvedByCustomer: boolean;
  status: string;
  invoiceId: string | null;
  currency: string;
};

export function JobCostingSection({
  jobId,
  parts,
  availableParts,
  serviceFee,
  approvedByCustomer,
  status,
  invoiceId,
  currency,
}: JobCostingSectionProps) {
  const router = useRouter();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [isApproving, startApproveTransition] = useTransition();
  const [isGeneratingInvoice, startInvoiceTransition] = useTransition();
  const partsTotal = parts.reduce((total, part) => {
    return total + part.unitPrice * part.quantity;
  }, 0);
  const total = partsTotal + serviceFee;

  async function handleRemove(jobPartId: string) {
    setRemovingId(jobPartId);

    try {
      await removePartFromJob(jobPartId);
      toast.success("Part removed from job");
      router.refresh();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not remove part");
    } finally {
      setRemovingId(null);
    }
  }

  function handleApprove() {
    startApproveTransition(async () => {
      try {
        await approveEstimate(jobId);
        toast.success("Estimate approved");
        setApproveOpen(false);
        router.refresh();
      } catch (caught) {
        toast.error(caught instanceof Error ? caught.message : "Could not approve estimate");
      }
    });
  }

  function handleGenerateInvoice() {
    startInvoiceTransition(async () => {
      try {
        await generateInvoice(jobId);
        toast.success("Invoice generated");
        router.push(`/dashboard/jobs/${jobId}/invoice`);
        router.refresh();
      } catch (caught) {
        toast.error(caught instanceof Error ? caught.message : "Could not generate invoice");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parts & Costs</CardTitle>
        <CardDescription>Inventory usage and customer estimate</CardDescription>
        <CardAction>
          <AddJobPartSheet
            jobId={jobId}
            parts={availableParts}
            currency={currency}
          />
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Part Name</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Line Total</TableHead>
                  <TableHead className="text-right">Remove</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parts.length > 0 ? (
                  parts.map((part) => (
                    <TableRow key={part.id}>
                      <TableCell className="font-medium">{part.partName}</TableCell>
                      <TableCell>{formatCurrency(part.unitPrice, currency)}</TableCell>
                      <TableCell>{part.quantity}</TableCell>
                      <TableCell>
                        {formatCurrency(part.unitPrice * part.quantity, currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive"
                          disabled={removingId === part.id}
                          onClick={() => handleRemove(part.id)}
                        >
                          <Trash2Icon />
                          <span className="sr-only">Remove part</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-28 text-center text-muted-foreground">
                      No parts added yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="h-fit rounded-lg border p-4 xl:sticky xl:top-20">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Parts Total</span>
              <span className="font-medium">{formatCurrency(partsTotal, currency)}</span>
            </div>
            <div className="mt-4">
              <label className="mb-2 block text-sm text-muted-foreground">
                Service Fee
              </label>
              <ServiceFeeInput jobId={jobId} defaultValue={serviceFee} />
            </div>
            <Separator className="my-4" />
            <div className="flex items-center justify-between">
              <span className="font-medium">TOTAL</span>
              <span className="text-2xl font-semibold">
                {formatCurrency(total, currency)}
              </span>
            </div>
            {invoiceId ? (
              <Link
                href={`/dashboard/jobs/${jobId}/invoice`}
                className={cn(buttonVariants(), "mt-4 w-full")}
              >
                <FileTextIcon data-icon="inline-start" />
                View Invoice
              </Link>
            ) : status === "COMPLETED" ? (
              <Button
                type="button"
                className="mt-4 w-full"
                disabled={isGeneratingInvoice}
                onClick={handleGenerateInvoice}
              >
                <FileTextIcon data-icon="inline-start" />
                {isGeneratingInvoice ? "Generating..." : "Generate Invoice"}
              </Button>
            ) : null}
            <AlertDialog open={approveOpen} onOpenChange={setApproveOpen}>
              <AlertDialogTrigger
                render={
                  <Button
                    type="button"
                    className="mt-4 w-full"
                    disabled={approvedByCustomer}
                  />
                }
              >
                {approvedByCustomer ? "Estimate Approved" : "Send Estimate to Customer"}
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Approve estimate?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This marks customer approval and moves the job order to Approved.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isApproving}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    type="button"
                    disabled={isApproving}
                    onClick={handleApprove}
                  >
                    {isApproving ? "Approving..." : "Confirm"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
