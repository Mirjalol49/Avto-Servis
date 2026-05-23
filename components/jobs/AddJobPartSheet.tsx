"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, PlusIcon, SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { addPartToJob } from "@/actions/jobParts";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatCurrency } from "@/lib/money";
import {
  addJobPartSchema,
  type AddJobPartFormInput,
  type AddJobPartInput,
} from "@/lib/parts/validation";
import { cn } from "@/lib/utils";

export type AvailablePartOption = {
  id: string;
  name: string;
  stockQty: number;
  unitPrice: number;
};

type AddJobPartSheetProps = {
  jobId: string;
  parts: AvailablePartOption[];
  currency: string;
};

export function AddJobPartSheet({ jobId, parts, currency }: AddJobPartSheetProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const form = useForm<AddJobPartFormInput, unknown, AddJobPartInput>({
    resolver: zodResolver(addJobPartSchema),
    defaultValues: {
      partId: "",
      quantity: 1,
    },
  });
  const selectedPart = parts.find((part) => part.id === form.watch("partId"));
  const quantity = Number(form.watch("quantity") || 0);
  const lineTotal = selectedPart ? selectedPart.unitPrice * quantity : 0;
  const filteredParts = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return parts;
    }

    return parts.filter((part) => part.name.toLowerCase().includes(term));
  }, [parts, search]);

  async function onSubmit(values: AddJobPartInput) {
    setError(null);

    try {
      const result = await addPartToJob(jobId, values);

      toast.success("Part added to job");
      if (result.depletedPartName) {
        toast.warning(`⚠ This was the last unit of ${result.depletedPartName}`);
      }

      form.reset({ partId: "", quantity: 1 });
      setOpen(false);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not add part.");
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button type="button" variant="outline">
            <PlusIcon data-icon="inline-start" />
            Add Part
          </Button>
        }
      />
      <SheetContent side="right" className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Add Part</SheetTitle>
          <SheetDescription>
            Select inventory and snapshot the current unit price for this job.
          </SheetDescription>
        </SheetHeader>

        <form className="flex flex-1 flex-col" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <div className="flex-1 overflow-y-auto px-4">
            <FieldGroup>
              <Controller
                control={form.control}
                name="partId"
                render={({ field, fieldState }) => (
                  <Field data-invalid={Boolean(fieldState.error)}>
                    <FieldLabel>Part</FieldLabel>
                    <div className="relative">
                      <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        className="pl-8"
                        placeholder="Search parts"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                      />
                    </div>
                    <div className="max-h-64 overflow-y-auto rounded-lg border">
                      {filteredParts.map((part) => {
                        const disabled = part.stockQty === 0;
                        const selected = field.value === part.id;

                        return (
                          <button
                            key={part.id}
                            type="button"
                            disabled={disabled}
                            className={cn(
                              "flex w-full items-center justify-between gap-3 border-b px-3 py-2 text-left text-sm last:border-b-0 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50",
                              selected && "bg-muted"
                            )}
                            onClick={() => {
                              field.onChange(part.id);
                              form.setValue("quantity", 1, { shouldValidate: true });
                            }}
                          >
                            <span>
                              <span className="block font-medium">
                                {part.name} {disabled ? "(Out of Stock)" : ""}
                              </span>
                              <span className="block text-xs text-muted-foreground">
                                Stock {part.stockQty} · {formatCurrency(part.unitPrice, currency)}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                      {filteredParts.length === 0 ? (
                        <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                          No parts match the search.
                        </div>
                      ) : null}
                    </div>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Field data-invalid={Boolean(form.formState.errors.quantity)}>
                <FieldLabel htmlFor="job-part-quantity">Quantity</FieldLabel>
                <Input
                  id="job-part-quantity"
                  type="number"
                  min={1}
                  max={selectedPart?.stockQty}
                  step={1}
                  aria-invalid={Boolean(form.formState.errors.quantity)}
                  {...form.register("quantity")}
                />
                <FieldDescription>
                  {selectedPart
                    ? `Available stock: ${selectedPart.stockQty}`
                    : "Select a part first."}
                </FieldDescription>
                <FieldError errors={[form.formState.errors.quantity]} />
              </Field>

              <div className="rounded-lg border p-3">
                <div className="text-sm text-muted-foreground">Line total</div>
                <div className="text-lg font-semibold">
                  {formatCurrency(lineTotal, currency)}
                </div>
              </div>

              {error ? (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              ) : null}
            </FieldGroup>
          </div>

          <SheetFooter>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <Loader2Icon data-icon="inline-start" className="animate-spin" />
              ) : null}
              Add Part
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
