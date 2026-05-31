/* eslint-disable @next/next/no-img-element */

import { format } from "date-fns";
import {
  CalendarDaysIcon,
  ClipboardListIcon,
  DownloadIcon,
  FileTextIcon,
  PlusIcon,
  UserIcon,
  WrenchIcon,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getCarById } from "@/actions/cars";
import { JobStatusBadge } from "@/components/jobs/JobStatusBadge";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { formatUzbekPhone } from "@/lib/customers/validation";
import { shortJobId } from "@/lib/jobs/status";
import { formatCurrency, getCurrency } from "@/lib/money";
import { cn } from "@/lib/utils";

type CarDetailPageProps = {
  params: {
    id: string;
  };
};

export const dynamic = "force-dynamic";

function formatMoney(value: unknown, currency: string) {
  if (value === null || value === undefined) {
    return "-";
  }

  return formatCurrency(Number(value), currency);
}

function fileNameFromUrl(url: string) {
  const parsedUrl = new URL(url);
  const segments = parsedUrl.pathname.split("/");

  return decodeURIComponent(segments[segments.length - 1] ?? "document");
}

export default async function CarDetailPage({ params }: CarDetailPageProps) {
  const car = await getCarById(params.id);

  if (!car) {
    notFound();
  }

  const currency = getCurrency();
  const lastJob = car.jobOrders[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <a
            href={car.carImageUrl ?? car.plateImageUrl}
            target="_blank"
            rel="noreferrer"
            className="relative block min-h-72 overflow-hidden bg-muted"
          >
            <img
              src={car.carImageUrl ?? car.plateImageUrl}
              alt={`${car.name ?? car.plateNumber} vehicle`}
              className="size-full object-cover"
            />
            <div className="absolute left-4 top-4 rounded-lg border border-white/20 bg-black/60 px-3 py-1.5 font-mono text-sm font-semibold text-white backdrop-blur">
              {car.plateNumber}
            </div>
          </a>

          <div className="flex flex-col justify-between gap-6 p-5 sm:p-6">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">Vehicle profile</Badge>
                {lastJob ? <JobStatusBadge status={lastJob.status} /> : null}
              </div>
              <h1 className="font-heading text-3xl font-semibold">
                {car.name ?? "Vehicle profile"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Service history, documents, owner, and repair activity for this vehicle.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-muted/35 p-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <UserIcon className="size-4" />
                  Owner
                </div>
                <div className="mt-1 font-medium">{car.customer.name}</div>
                <div className="text-sm text-muted-foreground">
                  {formatUzbekPhone(car.customer.phone)}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-muted/35 p-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ClipboardListIcon className="size-4" />
                  Jobs
                </div>
                <div className="mt-1 font-heading text-2xl font-semibold">
                  {car.jobOrders.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  {lastJob ? `Last visit ${format(lastJob.createdAt, "dd MMM yyyy")}` : "No visits yet"}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={`/dashboard/jobs/new?carId=${car.id}`}
                className={cn(buttonVariants())}
              >
                <PlusIcon data-icon="inline-start" />
                New Job Order
              </Link>
              <Link
                href={`/dashboard/customers/${car.customer.id}`}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Owner profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.9fr)]">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Attachment</CardTitle>
              <CardDescription>Car document or inspection report</CardDescription>
            </CardHeader>
            <CardContent>
              {car.attachmentUrl ? (
                car.attachmentType === "pdf" ? (
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-muted/30 p-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <FileTextIcon className="text-muted-foreground" />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {fileNameFromUrl(car.attachmentUrl)}
                        </div>
                        <div className="text-xs text-muted-foreground">PDF document</div>
                      </div>
                    </div>
                    <a
                      href={car.attachmentUrl}
                      download
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                    >
                      <DownloadIcon data-icon="inline-start" />
                      Download
                    </a>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <a href={car.attachmentUrl} target="_blank" rel="noreferrer">
                      <img
                        src={car.attachmentUrl}
                        alt={`${car.plateNumber} attachment`}
                        className="aspect-video w-full rounded-xl object-cover"
                      />
                    </a>
                    <a
                      href={car.attachmentUrl}
                      download
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-fit")}
                    >
                      <DownloadIcon data-icon="inline-start" />
                      Download
                    </a>
                  </div>
                )
              ) : (
                <p className="text-sm text-muted-foreground">No document attached</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
              <CardDescription>Owner information</CardDescription>
              <CardAction>
                <Link
                  href={`/dashboard/customers/${car.customer.id}`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  View profile
                </Link>
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-1">
                <div className="font-medium">{car.customer.name}</div>
                <div className="text-sm text-muted-foreground">
                  {formatUzbekPhone(car.customer.phone)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-lg font-semibold">Service History</h2>
              <p className="text-sm text-muted-foreground">
                Dated repair records linked to this car. Open any record for the full job page.
              </p>
            </div>
            <Link
              href={`/dashboard/jobs/new?carId=${car.id}`}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              <PlusIcon data-icon="inline-start" />
              New Job Order
            </Link>
          </div>

          {car.jobOrders.length > 0 ? (
            <div className="flex flex-col gap-3">
              {car.jobOrders.map((jobOrder) => (
                <Link
                  key={jobOrder.id}
                  href={`/dashboard/jobs/${jobOrder.id}`}
                  className="block rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/45"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground">
                            {shortJobId(jobOrder.id)}
                          </span>
                          <JobStatusBadge status={jobOrder.status} />
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                          <CalendarDaysIcon className="size-4" />
                          {format(jobOrder.createdAt, "dd MMM yyyy, HH:mm")}
                        </div>
                      </div>
                      <div className="text-right text-sm font-semibold">
                        {formatMoney(jobOrder.totalCost ?? jobOrder.estimatedCost, currency)}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium">What happened</div>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {jobOrder.problemDescription}
                      </p>
                      {jobOrder.diagnosisNotes ? (
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          Diagnosis: {jobOrder.diagnosisNotes}
                        </p>
                      ) : null}
                    </div>

                    <div className="grid gap-2 text-sm sm:grid-cols-3">
                      <div className="rounded-lg border border-border bg-muted/35 p-2.5">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <WrenchIcon className="size-4" />
                          Master
                        </div>
                        <div className="mt-1 font-medium">
                          {jobOrder.master?.name ?? "Unassigned"}
                        </div>
                        {jobOrder.master?.specialization ? (
                          <div className="text-xs text-muted-foreground">
                            {jobOrder.master.specialization}
                          </div>
                        ) : null}
                      </div>
                      <div className="rounded-lg border border-border bg-muted/35 p-2.5">
                        <div className="text-muted-foreground">Parts used</div>
                        <div className="mt-1 font-medium">{jobOrder._count.parts}</div>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/35 p-2.5">
                        <div className="text-muted-foreground">Photos</div>
                        <div className="mt-1 font-medium">{jobOrder._count.photos}</div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ClipboardListIcon />
                </EmptyMedia>
                <EmptyTitle>No job orders</EmptyTitle>
                <EmptyDescription>
                  Create a job order when this car arrives for service.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </section>
      </div>
    </div>
  );
}
