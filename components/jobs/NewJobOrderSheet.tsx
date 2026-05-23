"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { createJobOrder } from "@/actions/jobs";
import {
  CarJobCombobox,
  type JobCarOption,
} from "@/components/jobs/CarJobCombobox";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  createJobOrderSchema,
  type CreateJobOrderInput,
} from "@/lib/jobs/validation";

type MasterOption = {
  id: string;
  name: string;
  specialization: string | null;
};

type NewJobOrderSheetProps = {
  cars: JobCarOption[];
  masters: MasterOption[];
};

export function NewJobOrderSheet({ cars, masters }: NewJobOrderSheetProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<CreateJobOrderInput>({
    resolver: zodResolver(createJobOrderSchema),
    defaultValues: {
      carId: "",
      problemDescription: "",
      masterId: null,
    },
  });

  async function onSubmit(values: CreateJobOrderInput) {
    setError(null);

    try {
      const job = await createJobOrder(values);
      toast.success("Job order created");
      setOpen(false);
      router.push(`/dashboard/jobs/${job.id}`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create job order.");
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button>
            <PlusIcon data-icon="inline-start" />
            New Job Order
          </Button>
        }
      />
      <SheetContent side="right" className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>New Job Order</SheetTitle>
          <SheetDescription>
            Record the customer complaint and assign intake responsibility.
          </SheetDescription>
        </SheetHeader>

        <form className="flex flex-1 flex-col" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex-1 px-4">
            <FieldGroup>
              <Controller
                control={form.control}
                name="carId"
                render={({ field, fieldState }) => (
                  <Field data-invalid={Boolean(fieldState.error)}>
                    <FieldLabel>Car</FieldLabel>
                    <CarJobCombobox
                      cars={cars}
                      value={field.value}
                      onChange={field.onChange}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Field data-invalid={Boolean(form.formState.errors.problemDescription)}>
                <FieldLabel htmlFor="problem-description">Problem Description</FieldLabel>
                <Textarea
                  id="problem-description"
                  rows={5}
                  aria-invalid={Boolean(form.formState.errors.problemDescription)}
                  {...form.register("problemDescription")}
                />
                <FieldError errors={[form.formState.errors.problemDescription]} />
              </Field>

              <Controller
                control={form.control}
                name="masterId"
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Master</FieldLabel>
                    <Select
                      items={[
                        { label: "Unassigned", value: "none" },
                        ...masters.map((master) => ({
                          label: master.name,
                          value: master.id,
                        })),
                      ]}
                      value={field.value ?? "none"}
                      onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select master" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="none">Unassigned</SelectItem>
                          {masters.map((master) => (
                            <SelectItem key={master.id} value={master.id}>
                              {master.name}
                              {master.specialization ? ` · ${master.specialization}` : ""}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />

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
              Create Job
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
