"use client";

import { EditIcon, PackagePlusIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { adjustStock, deletePart } from "@/actions/parts";
import { PartSheet } from "@/components/parts/PartSheet";
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
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type PartActionsProps = {
  part: {
    id: string;
    name: string;
    stockQty: number;
    unitPrice: number;
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

export function PartActions({ part }: PartActionsProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [delta, setDelta] = useState("1");

  async function handleDelete() {
    setIsDeleting(true);

    try {
      await deletePart(part.id);
      toast.success("Part deleted successfully");
      setDeleteOpen(false);
      router.refresh();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not delete part");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleAdjust() {
    const numericDelta = Number(delta);

    if (!Number.isInteger(numericDelta)) {
      toast.error("Stock adjustment must be a whole number");
      return;
    }

    setIsAdjusting(true);

    try {
      await adjustStock(part.id, numericDelta);
      toast.success("Stock adjusted successfully");
      setAdjustOpen(false);
      setDelta("1");
      router.refresh();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not adjust stock");
    } finally {
      setIsAdjusting(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <IconTooltip label="Edit">
        <PartSheet
          part={part}
          trigger={
            <button
              type="button"
              className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
            >
              <EditIcon />
              <span className="sr-only">Edit part</span>
            </button>
          }
        />
      </IconTooltip>

      <Popover open={adjustOpen} onOpenChange={setAdjustOpen}>
        <IconTooltip label="Adjust Stock">
          <PopoverTrigger
            render={
              <button
                type="button"
                className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
              />
            }
          >
            <PackagePlusIcon />
            <span className="sr-only">Adjust stock</span>
          </PopoverTrigger>
        </IconTooltip>
        <PopoverContent align="end" className="w-72">
          <PopoverHeader>
            <PopoverTitle>Adjust stock</PopoverTitle>
            <PopoverDescription>
              Enter a positive or negative quantity change.
            </PopoverDescription>
          </PopoverHeader>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              step={1}
              value={delta}
              onChange={(event) => setDelta(event.target.value)}
            />
            <Button type="button" disabled={isAdjusting} onClick={handleAdjust}>
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>

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
            <span className="sr-only">Delete part</span>
          </AlertDialogTrigger>
        </IconTooltip>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete part?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes {part.name}. Parts already used in job orders cannot be deleted.
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
