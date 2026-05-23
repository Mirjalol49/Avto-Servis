"use client";

import { EditIcon, EyeIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { deleteCustomer } from "@/actions/customers";
import { CustomerSheet } from "@/components/customers/CustomerSheet";
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
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type CustomerActionsProps = {
  customer: {
    id: string;
    name: string;
    phone: string;
  };
};

function IconTooltip({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex" />}>{children}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function CustomerActions({ customer }: CustomerActionsProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);

    try {
      await deleteCustomer(customer.id);
      toast.success("Customer deleted successfully");
      setDeleteOpen(false);
      router.refresh();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not delete customer");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <IconTooltip label="View">
        <Link
          href={`/dashboard/customers/${customer.id}`}
          className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
        >
          <EyeIcon />
          <span className="sr-only">View customer</span>
        </Link>
      </IconTooltip>

      <IconTooltip label="Edit">
        <CustomerSheet
          customer={customer}
          trigger={
            <button
              type="button"
              className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
            >
              <EditIcon />
              <span className="sr-only">Edit customer</span>
            </button>
          }
        />
      </IconTooltip>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <IconTooltip label="Delete">
          <AlertDialogTrigger
            render={
              <button
                type="button"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon-sm" }),
                  "text-destructive"
                )}
              />
            }
          >
            <Trash2Icon />
            <span className="sr-only">Delete customer</span>
          </AlertDialogTrigger>
        </IconTooltip>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete customer?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes {customer.name}. Customers with job orders cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
