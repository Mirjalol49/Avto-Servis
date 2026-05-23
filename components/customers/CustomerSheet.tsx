"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createCustomer, updateCustomer } from "@/actions/customers";
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
  customerSchema,
  type CustomerInput,
} from "@/lib/customers/validation";

type EditableCustomer = {
  id: string;
  name: string;
  phone: string;
};

type CustomerSheetProps = {
  customer?: EditableCustomer;
  trigger?: React.ReactElement;
};

export function CustomerSheet({ customer, trigger }: CustomerSheetProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer?.name ?? "",
      phone: customer ? `+${customer.phone}` : "",
    },
  });
  const mode = customer ? "edit" : "add";

  async function onSubmit(values: CustomerInput) {
    setError(null);

    try {
      if (customer) {
        await updateCustomer(customer.id, values);
      } else {
        await createCustomer(values);
      }

      toast.success("Customer saved successfully");
      form.reset({
        name: customer?.name ?? "",
        phone: customer ? `+${customer.phone}` : "",
      });
      setOpen(false);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save customer.");
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          trigger ?? (
            <Button>
              <PlusIcon data-icon="inline-start" />
              Add Customer
            </Button>
          )
        }
      />
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{mode === "add" ? "Add Customer" : "Edit Customer"}</SheetTitle>
          <SheetDescription>
            Save customer contact details for service intake.
          </SheetDescription>
        </SheetHeader>

        <form className="flex flex-1 flex-col" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <div className="flex-1 px-4">
            <FieldGroup>
              <Field data-invalid={Boolean(form.formState.errors.name)}>
                <FieldLabel htmlFor="customer-name">Name</FieldLabel>
                <Input
                  id="customer-name"
                  autoComplete="name"
                  aria-invalid={Boolean(form.formState.errors.name)}
                  {...form.register("name")}
                />
                <FieldError errors={[form.formState.errors.name]} />
              </Field>

              <Field data-invalid={Boolean(form.formState.errors.phone)}>
                <FieldLabel htmlFor="customer-phone">Phone</FieldLabel>
                <Input
                  id="customer-phone"
                  placeholder="+998901234567"
                  autoComplete="tel"
                  aria-invalid={Boolean(form.formState.errors.phone)}
                  {...form.register("phone")}
                />
                <FieldError errors={[form.formState.errors.phone]} />
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
