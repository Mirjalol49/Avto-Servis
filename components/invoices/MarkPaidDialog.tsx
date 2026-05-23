"use client";

import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { markAsPaid } from "@/actions/invoices";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { paymentMethodSchema, type PaymentMethod } from "@/lib/invoices/validation";

const paymentMethods: Array<{ value: PaymentMethod; label: string }> = [
  { value: "CASH", label: "Cash" },
  { value: "CARD", label: "Card" },
  { value: "TRANSFER", label: "Bank Transfer" },
];

export function MarkPaidDialog({ invoiceId }: { invoiceId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      try {
        const parsed = paymentMethodSchema.parse(paymentMethod);

        await markAsPaid(invoiceId, parsed);
        toast.success("Invoice marked as paid");
        setOpen(false);
        router.refresh();
      } catch (caught) {
        toast.error(caught instanceof Error ? caught.message : "Could not mark invoice as paid");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" />}>Mark as Paid</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark invoice as paid</DialogTitle>
          <DialogDescription>
            Select the payment method used by the customer.
          </DialogDescription>
        </DialogHeader>
        <div className="px-4">
          <Select
            items={paymentMethods.map((method) => ({
              label: method.label,
              value: method.value,
            }))}
            value={paymentMethod}
            onValueChange={(value) => {
              const parsed = paymentMethodSchema.safeParse(value);

              if (parsed.success) {
                setPaymentMethod(parsed.data);
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button type="button" disabled={isPending} onClick={handleConfirm}>
            {isPending ? (
              <Loader2Icon data-icon="inline-start" className="animate-spin" />
            ) : null}
            Confirm Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
