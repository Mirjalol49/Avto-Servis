/* eslint-disable @next/next/no-img-element */

import { format } from "date-fns";
import { ClipboardListIcon, DownloadIcon, FileTextIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getCarById } from "@/actions/cars";
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
import { cn } from "@/lib/utils";

type CarDetailPageProps = {
  params: {
    id: string;
  };
};

export const dynamic = "force-dynamic";

function formatMoney(value: unknown) {
  if (value === null || value === undefined) {
    return "-";
  }

  return `${Number(value).toLocaleString("en-US")} UZS`;
}

function fileNameFromUrl(url: string) {
  const parsedUrl = new URL(url);
  const segments = parsedUrl.pathname.split("/");

  return decodeURIComponent(segments[segments.length - 1] ?? "document");
}

function statusVariant(status: string) {
  if (status === "COMPLETED" || status === "DELIVERED") {
    return "default" as const;
  }

  if (status === "IN_PROGRESS" || status === "APPROVED") {
    return "secondary" as const;
  }

  return "outline" as const;
}

export default async function CarDetailPage({ params }: CarDetailPageProps) {
  const car = await getCarById(params.id);

  if (!car) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">{car.plateNumber}</h1>
        <p className="text-sm text-muted-foreground">
          Vehicle profile, documents, and job orders.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.9fr)]">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Plate image</CardTitle>
              <CardDescription>Photo of the physical plate</CardDescription>
            </CardHeader>
            <CardContent>
              <a href={car.plateImageUrl} target="_blank" rel="noreferrer">
                <img
                  src={car.plateImageUrl}
                  alt={`${car.plateNumber} plate`}
                  className="aspect-video w-full rounded-xl object-cover"
                />
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attachment</CardTitle>
              <CardDescription>Car document or inspection report</CardDescription>
            </CardHeader>
            <CardContent>
              {car.attachmentUrl ? (
                car.attachmentType === "pdf" ? (
                  <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
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
              <h2 className="font-heading text-lg font-semibold">Job Orders</h2>
              <p className="text-sm text-muted-foreground">
                Service work linked to this car.
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
                <Card key={jobOrder.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Badge variant={statusVariant(jobOrder.status)}>
                        {jobOrder.status.replace(/_/g, " ")}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {format(jobOrder.createdAt, "dd MMM yyyy")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      <p className="text-sm">{jobOrder.problemDescription}</p>
                      <div className="text-sm font-medium">
                        {formatMoney(jobOrder.totalCost)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
