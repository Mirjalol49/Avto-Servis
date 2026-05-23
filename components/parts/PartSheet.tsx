"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createPart, updatePart } from "@/actions/parts";
import { Button } from "@/components/ui/button";
import {
  Field,
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
import {
  partSchema,
  type PartFormInput,
  type PartInput,
} from "@/lib/parts/validation";

type EditablePart = {
  id: string;
  name: string;
  stockQty: number;
  unitPrice: number;
};

type PartSheetProps = {
  part?: EditablePart;
  trigger?: React.ReactElement;
};

export function PartSheet({ part, trigger }: PartSheetProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<PartFormInput, unknown, PartInput>({
    resolver: zodResolver(partSchema),
    defaultValues: {
      name: part?.name ?? "",
      stockQty: part?.stockQty ?? 0,
      unitPrice: part?.unitPrice ?? 0,
    },
  });

  async function onSubmit(values: PartInput) {
    setError(null);

    try {
      if (part) {
        await updatePart(part.id, values);
      } else {
        await createPart(values);
      }

      toast.success("Part saved successfully");
      form.reset({
        name: part?.name ?? "",
        stockQty: part?.stockQty ?? 0,
        unitPrice: part?.unitPrice ?? 0,
      });
      setOpen(false);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save part.");
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          trigger ?? (
            <Button>
              <PlusIcon data-icon="inline-start" />
              Add Part
            </Button>
          )
        }
      />
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{part ? "Edit Part" : "Add Part"}</SheetTitle>
          <SheetDescription>
            Save inventory quantity and current unit price.
          </SheetDescription>
        </SheetHeader>

        <form className="flex flex-1 flex-col" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <div className="flex-1 px-4">
            <FieldGroup>
              <Field data-invalid={Boolean(form.formState.errors.name)}>
                <FieldLabel htmlFor="part-name">Part Name</FieldLabel>
                <Input
                  id="part-name"
                  autoComplete="off"
                  aria-invalid={Boolean(form.formState.errors.name)}
                  {...form.register("name")}
                />
                <FieldError errors={[form.formState.errors.name]} />
              </Field>

              <Field data-invalid={Boolean(form.formState.errors.stockQty)}>
                <FieldLabel htmlFor="stock-qty">Stock Quantity</FieldLabel>
                <Input
                  id="stock-qty"
                  type="number"
                  min={0}
                  step={1}
                  aria-invalid={Boolean(form.formState.errors.stockQty)}
                  {...form.register("stockQty")}
                />
                <FieldError errors={[form.formState.errors.stockQty]} />
              </Field>

              <Field data-invalid={Boolean(form.formState.errors.unitPrice)}>
                <FieldLabel htmlFor="unit-price">Unit Price</FieldLabel>
                <Input
                  id="unit-price"
                  type="number"
                  min={0}
                  step="0.01"
                  aria-invalid={Boolean(form.formState.errors.unitPrice)}
                  {...form.register("unitPrice")}
                />
                <FieldError errors={[form.formState.errors.unitPrice]} />
              </Field>

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
              Save
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
