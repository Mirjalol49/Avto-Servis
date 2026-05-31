/* eslint-disable @next/next/no-img-element */

import { format } from "date-fns";
import { CalendarDaysIcon, CarIcon, ClipboardListIcon, FileCheckIcon, UserIcon } from "lucide-react";
import Link from "next/link";

import { getCarFormCustomers, getCars } from "@/actions/cars";
import { CarActions } from "@/components/cars/CarActions";
import { CarSearch } from "@/components/cars/CarSearch";
import { CarSheet } from "@/components/cars/CarSheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

type CarsPageProps = {
  searchParams?: {
    search?: string;
  };
};

export const dynamic = "force-dynamic";

export default async function CarsPage({ searchParams }: CarsPageProps) {
  const search = searchParams?.search ?? "";
  const [cars, customers] = await Promise.all([
    getCars(search),
    getCarFormCustomers(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Cars</h1>
          <p className="text-sm text-muted-foreground">
            Manage registered vehicles, plate photos, and documents.
          </p>
        </div>
        <CarSheet customers={customers} />
      </div>

      <CarSearch defaultValue={search} />

      {cars.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cars.map((car) => (
            <Card key={car.id} className="overflow-hidden p-0">
              <Link href={`/dashboard/cars/${car.id}`} className="block">
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  <img
                    src={car.carImageUrl ?? car.plateImageUrl}
                    alt={`${car.name ?? car.plateNumber} vehicle`}
                    className="size-full object-cover transition-transform duration-200 hover:scale-[1.02]"
                  />
                  <div className="absolute left-3 top-3 rounded-lg border border-white/20 bg-black/55 px-3 py-1.5 font-mono text-sm font-semibold text-white backdrop-blur">
                    {car.plateNumber}
                  </div>
                  {car.attachmentUrl ? (
                    <Badge className="absolute right-3 top-3 border-white/20 bg-white/90 text-slate-900">
                      <FileCheckIcon className="mr-1 size-3" />
                      Document
                    </Badge>
                  ) : null}
                </div>
              </Link>

              <CardContent className="flex flex-col gap-4 p-4">
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/dashboard/cars/${car.id}`} className="min-w-0">
                    <h2 className="truncate font-heading text-xl font-semibold">
                      {car.name ?? "Vehicle profile"}
                    </h2>
                    <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <UserIcon className="size-4" />
                      <span className="truncate">{car.customer.name}</span>
                    </div>
                  </Link>
                  <CarActions
                    customers={customers}
                    car={{
                      id: car.id,
                      name: car.name,
                      carImageUrl: car.carImageUrl,
                      plateNumber: car.plateNumber,
                      plateImageUrl: car.plateImageUrl,
                      attachmentUrl: car.attachmentUrl,
                      attachmentType: car.attachmentType,
                      customerId: car.customer.id,
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg border border-border bg-muted/35 p-3">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <ClipboardListIcon className="size-4" />
                      Jobs
                    </div>
                    <div className="mt-1 font-heading text-xl font-semibold">
                      {car._count.jobOrders}
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/35 p-3">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <CalendarDaysIcon className="size-4" />
                      Added
                    </div>
                    <div className="mt-1 font-medium">
                      {format(car.createdAt, "dd MMM yyyy")}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Empty className="min-h-80 border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CarIcon />
            </EmptyMedia>
            <EmptyTitle>No cars found</EmptyTitle>
            <EmptyDescription>
              Add a car or adjust the plate/customer search.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}
