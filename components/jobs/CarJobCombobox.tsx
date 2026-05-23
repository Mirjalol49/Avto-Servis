"use client";

import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type JobCarOption = {
  id: string;
  plateNumber: string;
  customer: {
    name: string;
  };
};

type CarJobComboboxProps = {
  cars: JobCarOption[];
  value: string;
  onChange: (value: string) => void;
};

export function CarJobCombobox({ cars, value, onChange }: CarJobComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selectedCar = cars.find((car) => car.id === value);
  const filteredCars = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const plateSearch = search.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

    if (!normalizedSearch && !plateSearch) {
      return cars;
    }

    return cars.filter((car) => {
      return (
        car.plateNumber.includes(plateSearch) ||
        car.customer.name.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [cars, search]);

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        className="w-full justify-between"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="min-w-0 text-left">
          {selectedCar ? (
            <>
              <span className="block truncate">{selectedCar.plateNumber}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {selectedCar.customer.name}
              </span>
            </>
          ) : (
            "Select car"
          )}
        </span>
        <ChevronsUpDownIcon data-icon="inline-end" />
      </Button>

      {open ? (
        <div className="absolute z-40 mt-2 w-full rounded-xl bg-popover p-2 text-popover-foreground shadow-lg ring-1 ring-foreground/10">
          <Input
            placeholder="Search car or customer"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className="mt-2 max-h-64 overflow-y-auto">
            {filteredCars.length > 0 ? (
              filteredCars.map((car) => (
                <button
                  key={car.id}
                  type="button"
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-muted",
                    value === car.id && "bg-muted"
                  )}
                  onClick={() => {
                    onChange(car.id);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{car.plateNumber}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {car.customer.name}
                    </span>
                  </span>
                  {value === car.id ? <CheckIcon /> : null}
                </button>
              ))
            ) : (
              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                No cars found.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
