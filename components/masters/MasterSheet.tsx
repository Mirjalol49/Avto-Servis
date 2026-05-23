"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createMaster, updateMaster } from "@/actions/masters";
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
  masterSchema,
  specializationSuggestions,
  type MasterData,
  type MasterInput,
} from "@/lib/masters/validation";

type EditableMaster = {
  id: string;
  name: string;
  phone: string;
  specialization: string | null;
};

type MasterSheetProps = {
  master?: EditableMaster;
  trigger?: React.ReactElement;
};

export function MasterSheet({ master, trigger }: MasterSheetProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<MasterInput, unknown, MasterData>({
    resolver: zodResolver(masterSchema),
    defaultValues: {
      name: master?.name ?? "",
      phone: master ? `+${master.phone}` : "",
      specialization: master?.specialization ?? "",
    },
  });

  async function onSubmit(values: MasterData) {
    setError(null);

    try {
      if (master) {
        await updateMaster(master.id, values);
      } else {
        await createMaster(values);
      }

      toast.success("Master saved successfully");
      form.reset({
        name: master?.name ?? "",
        phone: master ? `+${master.phone}` : "",
        specialization: master?.specialization ?? "",
      });
      setOpen(false);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save master.");
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          trigger ?? (
            <Button>
              <PlusIcon data-icon="inline-start" />
              Add Master
            </Button>
          )
        }
      />
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{master ? "Edit Master" : "Add Master"}</SheetTitle>
          <SheetDescription>
            Save mechanic contact and specialization details.
          </SheetDescription>
        </SheetHeader>

        <form className="flex flex-1 flex-col" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <div className="flex-1 px-4">
            <FieldGroup>
              <Field data-invalid={Boolean(form.formState.errors.name)}>
                <FieldLabel htmlFor="master-name">Name</FieldLabel>
                <Input
                  id="master-name"
                  autoComplete="name"
                  aria-invalid={Boolean(form.formState.errors.name)}
                  {...form.register("name")}
                />
                <FieldError errors={[form.formState.errors.name]} />
              </Field>

              <Field data-invalid={Boolean(form.formState.errors.phone)}>
                <FieldLabel htmlFor="master-phone">Phone</FieldLabel>
                <Input
                  id="master-phone"
                  placeholder="+998901234567"
                  autoComplete="tel"
                  aria-invalid={Boolean(form.formState.errors.phone)}
                  {...form.register("phone")}
                />
                <FieldError errors={[form.formState.errors.phone]} />
              </Field>

              <Field data-invalid={Boolean(form.formState.errors.specialization)}>
                <FieldLabel htmlFor="master-specialization">Specialization</FieldLabel>
                <Input
                  id="master-specialization"
                  list="master-specializations"
                  autoComplete="off"
                  aria-invalid={Boolean(form.formState.errors.specialization)}
                  {...form.register("specialization")}
                />
                <datalist id="master-specializations">
                  {specializationSuggestions.map((suggestion) => (
                    <option key={suggestion} value={suggestion} />
                  ))}
                </datalist>
                <FieldError errors={[form.formState.errors.specialization]} />
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
