import { WrenchIcon } from "lucide-react";

import { getMasters } from "@/actions/masters";
import { MasterActions } from "@/components/masters/MasterActions";
import { MasterAvatar } from "@/components/masters/MasterAvatar";
import { MasterFilterSwitch } from "@/components/masters/MasterFilterSwitch";
import { MasterSheet } from "@/components/masters/MasterSheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { formatUzbekPhone } from "@/lib/customers/validation";
import { cn } from "@/lib/utils";

type MastersPageProps = {
  searchParams?: {
    show?: string;
  };
};

export const dynamic = "force-dynamic";

export default async function MastersPage({ searchParams }: MastersPageProps) {
  const includeInactive = searchParams?.show === "all";
  const masters = await getMasters(includeInactive);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Masters</h1>
          <p className="text-sm text-muted-foreground">
            Manage mechanics, specializations, and assignment availability.
          </p>
        </div>
        <MasterSheet />
      </div>

      <div className="flex justify-start">
        <MasterFilterSwitch includeInactive={includeInactive} />
      </div>

      {masters.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {masters.map((master) => (
            <Card key={master.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <MasterAvatar id={master.id} name={master.name} />
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{master.name}</div>
                    <div className="truncate text-sm text-muted-foreground">
                      {master.specialization ?? "No specialization"}
                    </div>
                  </div>
                </div>
                <MasterActions
                  master={{
                    id: master.id,
                    name: master.name,
                    phone: master.phone,
                    specialization: master.specialization,
                    isActive: master.isActive,
                    activeJobsCount: master.activeJobsCount,
                  }}
                />
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="text-sm text-muted-foreground">
                    {formatUzbekPhone(master.phone)}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground">Active jobs</div>
                      <div className="text-lg font-semibold">{master.activeJobsCount}</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground">Completed</div>
                      <div className="text-lg font-semibold">{master.completedJobsCount}</div>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "w-fit",
                      master.isActive
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-red-200 bg-red-50 text-red-700"
                    )}
                  >
                    {master.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Empty className="min-h-80 border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <WrenchIcon />
            </EmptyMedia>
            <EmptyTitle>No masters found</EmptyTitle>
            <EmptyDescription>
              Add the first master or show inactive records.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}
