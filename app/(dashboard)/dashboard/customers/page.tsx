import { format } from "date-fns";
import { UsersIcon } from "lucide-react";

import { getCustomers } from "@/actions/customers";
import { CustomerActions } from "@/components/customers/CustomerActions";
import { CustomerSearch } from "@/components/customers/CustomerSearch";
import { CustomerSheet } from "@/components/customers/CustomerSheet";
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

type CustomersPageProps = {
  searchParams?: {
    search?: string;
  };
};

export const dynamic = "force-dynamic";

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const search = searchParams?.search ?? "";
  const customers = await getCustomers(search);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Customers</h1>
          <p className="text-sm text-muted-foreground">
            Manage customer profiles and linked vehicles.
          </p>
        </div>
        <CustomerSheet />
      </div>

      <div className="flex items-center justify-between gap-3">
        <CustomerSearch defaultValue={search} />
      </div>

      {customers.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-white/10 bg-card/80">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Cars count</TableHead>
                <TableHead>Created date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer, index) => (
                <TableRow key={customer.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{formatUzbekPhone(customer.phone)}</TableCell>
                  <TableCell>{customer._count.cars}</TableCell>
                  <TableCell>{format(customer.createdAt, "dd MMM yyyy")}</TableCell>
                  <TableCell>
                    <CustomerActions
                      customer={{
                        id: customer.id,
                        name: customer.name,
                        phone: customer.phone,
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
              <UsersIcon />
            </EmptyMedia>
            <EmptyTitle>No customers found</EmptyTitle>
            <EmptyDescription>
              Add the first customer or adjust the search term.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}
