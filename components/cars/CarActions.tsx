"use client";

import { EditIcon, EyeIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { deleteCar } from "@/actions/cars";
import { CarSheet } from "@/components/cars/CarSheet";
import type { CarCustomerOption } from "@/components/cars/CustomerCombobox";
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

type CarActionsProps = {
  customers: CarCustomerOption[];
  car: {
    id: string;
    plateNumber: string;
    plateImageUrl: string;
    attachmentUrl: string | null;
    attachmentType: string | null;
    customerId: string;
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

export function CarActions({ customers, car }: CarActionsProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);

    try {
      await deleteCar(car.id);
      toast.success("Car deleted successfully");
      setDeleteOpen(false);
      router.refresh();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not delete car");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <IconTooltip label="View">
        <Link
          href={`/dashboard/cars/${car.id}`}
          className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
        >
          <EyeIcon />
          <span className="sr-only">View car</span>
        </Link>
      </IconTooltip>

      <IconTooltip label="Edit">
        <CarSheet
          customers={customers}
          car={car}
          trigger={
            <button
              type="button"
              className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
            >
              <EditIcon />
              <span className="sr-only">Edit car</span>
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
            <span className="sr-only">Delete car</span>
          </AlertDialogTrigger>
        </IconTooltip>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete car?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the car record and uploaded files. Existing job orders may block deletion.
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
