/* eslint-disable @next/next/no-img-element */

import { format } from "date-fns";
import { CarIcon } from "lucide-react";

import { getCarFormCustomers, getCars } from "@/actions/cars";
import { CarActions } from "@/components/cars/CarActions";
import { CarSearch } from "@/components/cars/CarSearch";
import { CarSheet } from "@/components/cars/CarSheet";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
        <div className="overflow-hidden rounded-xl border border-white/10 bg-card/80">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plate Number</TableHead>
                <TableHead>Plate Image</TableHead>
                <TableHead>Customer Name</TableHead>
                <TableHead>Jobs Count</TableHead>
                <TableHead>Has Document</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cars.map((car) => (
                <TableRow key={car.id}>
                  <TableCell className="font-medium">{car.plateNumber}</TableCell>
                  <TableCell>
                    <img
                      src={car.plateImageUrl}
                      alt={`${car.plateNumber} plate`}
                      className="size-10 rounded object-cover"
                    />
                  </TableCell>
                  <TableCell>{car.customer.name}</TableCell>
                  <TableCell>{car._count.jobOrders}</TableCell>
                  <TableCell>
                    <Badge variant={car.attachmentUrl ? "secondary" : "outline"}>
                      {car.attachmentUrl ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(car.createdAt, "dd MMM yyyy")}</TableCell>
                  <TableCell>
                    <CarActions
                      customers={customers}
                      car={{
                        id: car.id,
                        plateNumber: car.plateNumber,
                        plateImageUrl: car.plateImageUrl,
                        attachmentUrl: car.attachmentUrl,
                        attachmentType: car.attachmentType,
                        customerId: car.customer.id,
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
