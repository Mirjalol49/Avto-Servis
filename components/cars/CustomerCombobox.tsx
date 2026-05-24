"use client";

import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatUzbekPhone } from "@/lib/customers/validation";
import { cn } from "@/lib/utils";

export type CarCustomerOption = {
  id: string;
  name: string;
  phone: string;
};

type CustomerComboboxProps = {
  customers: CarCustomerOption[];
  value: string;
  onChange: (value: string) => void;
};

export function CustomerCombobox({
  customers,
  value,
  onChange,
}: CustomerComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selectedCustomer = customers.find((customer) => customer.id === value);
  const filteredCustomers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const digitSearch = search.replace(/\D/g, "");

    if (!normalizedSearch && !digitSearch) {
      return customers;
    }

    return customers.filter((customer) => {
      return (
        customer.name.toLowerCase().includes(normalizedSearch) ||
        customer.phone.includes(digitSearch)
      );
    });
  }, [customers, search]);

  return (
    <div className="relative">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="outline"
              className="w-full justify-between"
              onClick={() => setOpen((current) => !current)}
            />
          }
        >
          <span className="truncate">
            {selectedCustomer
              ? `${selectedCustomer.name} · ${formatUzbekPhone(selectedCustomer.phone)}`
              : "Select customer"}
          </span>
          <ChevronsUpDownIcon data-icon="inline-end" />
        </TooltipTrigger>
        <TooltipContent>Search by customer name or phone</TooltipContent>
      </Tooltip>

      {open ? (
        <div className="absolute z-40 mt-2 w-full rounded-xl border border-white/10 bg-popover/95 p-2 text-popover-foreground shadow-[0_24px_70px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <Input
            placeholder="Search customer"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className="mt-2 max-h-64 overflow-y-auto">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-accent",
                    value === customer.id && "bg-primary/10 text-primary"
                  )}
                  onClick={() => {
                    onChange(customer.id);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">
                      {customer.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {formatUzbekPhone(customer.phone)}
                    </span>
                  </span>
                  {value === customer.id ? <CheckIcon /> : null}
                </button>
              ))
            ) : (
              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                No customers found.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
