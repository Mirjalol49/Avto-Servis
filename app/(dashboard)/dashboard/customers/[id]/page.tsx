import { format } from "date-fns";
import { CarIcon, ClipboardListIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getCustomerById } from "@/actions/customers";
import { CopyPhoneButton } from "@/components/customers/CopyPhoneButton";
import { CustomerSheet } from "@/components/customers/CustomerSheet";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatUzbekPhone } from "@/lib/customers/validation";
import { cn } from "@/lib/utils";

type CustomerDetailPageProps = {
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

export default async function CustomerDetailPage({
  params,
}: CustomerDetailPageProps) {
  const customer = await getCustomerById(params.id);

  if (!customer) {
    notFound();
  }

  const jobOrders = customer.cars
    .flatMap((car) =>
      car.jobOrders.map((jobOrder) => ({
        ...jobOrder,
        carPlateNumber: car.plateNumber,
      }))
    )
    .sort((first, second) => second.createdAt.getTime() - first.createdAt.getTime());

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">{customer.name}</h1>
          <p className="text-sm text-muted-foreground">
            Customer profile and service history.
          </p>
        </div>
        <CustomerSheet
          customer={{
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
          }}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer info</CardTitle>
          <CardDescription>Primary contact details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-muted/30 p-3">
            <div>
              <div className="text-sm text-muted-foreground">Phone number</div>
              <div className="font-medium">{formatUzbekPhone(customer.phone)}</div>
            </div>
            <CopyPhoneButton phone={`+${customer.phone}`} />
          </div>
        </CardContent>
      </Card>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg font-semibold">Cars</h2>
            <p className="text-sm text-muted-foreground">
              Vehicles linked to this customer.
            </p>
          </div>
          <Link
            href={`/dashboard/cars?customerId=${customer.id}`}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            <PlusIcon data-icon="inline-start" />
            Add Car
          </Link>
        </div>

        {customer.cars.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {customer.cars.map((car) => (
              <Card key={car.id}>
                <CardHeader>
                  <CardTitle>{car.plateNumber}</CardTitle>
                  <CardDescription>Plate number</CardDescription>
                  <CardAction>
                    <Badge variant="secondary">
                      {car._count.jobOrders} job(s)
                    </Badge>
                  </CardAction>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CarIcon />
              </EmptyMedia>
              <EmptyTitle>No cars linked</EmptyTitle>
              <EmptyDescription>
                Add a car to start creating job orders for this customer.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="font-heading text-lg font-semibold">Job History</h2>
          <p className="text-sm text-muted-foreground">
            All job orders across this customer&apos;s cars.
          </p>
        </div>

        {jobOrders.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-white/10 bg-card/80">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job ID</TableHead>
                  <TableHead>Car plate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobOrders.map((jobOrder) => (
                  <TableRow key={jobOrder.id}>
                    <TableCell className="font-mono text-xs">
                      {jobOrder.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>{jobOrder.carPlateNumber}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {jobOrder.status.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(jobOrder.createdAt, "dd MMM yyyy")}</TableCell>
                    <TableCell>{formatMoney(jobOrder.totalCost)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ClipboardListIcon />
              </EmptyMedia>
              <EmptyTitle>No job history</EmptyTitle>
              <EmptyDescription>
                Job orders will appear here once service work is created.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </section>
    </div>
  );
}
