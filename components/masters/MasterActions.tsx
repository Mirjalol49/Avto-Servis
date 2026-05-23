"use client";

import { EditIcon, MoreHorizontalIcon, PowerIcon, UserRoundIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { toggleMasterActive } from "@/actions/masters";
import { MasterSheet } from "@/components/masters/MasterSheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type MasterActionsProps = {
  master: {
    id: string;
    name: string;
    phone: string;
    specialization: string | null;
    isActive: boolean;
    activeJobsCount: number;
  };
};

export function MasterActions({ master }: MasterActionsProps) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      try {
        await toggleMasterActive(master.id);
        toast.success(master.isActive ? "Master deactivated" : "Master activated");
        setConfirmOpen(false);
        router.refresh();
      } catch (caught) {
        toast.error(caught instanceof Error ? caught.message : "Could not update master");
      }
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
            />
          }
        >
          <MoreHorizontalIcon />
          <span className="sr-only">Open master actions</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuGroup>
            <DropdownMenuItem
              render={<Link href={`/dashboard/masters/${master.id}`} />}
            >
              <UserRoundIcon />
              View Profile
            </DropdownMenuItem>
            <MasterSheet
              master={master}
              trigger={
                <DropdownMenuItem
                  onClick={(event) => {
                    event.preventDefault();
                  }}
                >
                  <EditIcon />
                  Edit
                </DropdownMenuItem>
              }
            />
            <DropdownMenuItem
              variant={master.isActive ? "destructive" : "default"}
              onClick={() => setConfirmOpen(true)}
            >
              <PowerIcon />
              {master.isActive ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {master.isActive ? "Deactivate master?" : "Activate master?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {master.isActive && master.activeJobsCount > 0
                ? `This master has ${master.activeJobsCount} active jobs. Deactivating will not unassign them.`
                : master.isActive
                  ? "Inactive masters cannot be assigned to new jobs."
                  : "This master will become available for new job assignments."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction type="button" disabled={isPending} onClick={handleToggle}>
              {isPending ? "Saving..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
