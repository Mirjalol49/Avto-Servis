"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { createCar, updateCar } from "@/actions/cars";
import {
  CustomerCombobox,
  type CarCustomerOption,
} from "@/components/cars/CustomerCombobox";
import { FileUploadZone } from "@/components/cars/FileUploadZone";
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
import {
  carFormSchema,
  PLATE_NUMBER_HINT,
  type CarFormData,
} from "@/lib/cars/validation";

type EditableCar = {
  id: string;
  plateNumber: string;
  plateImageUrl: string;
  attachmentUrl: string | null;
  attachmentType: string | null;
  customerId: string;
};

type CarSheetProps = {
  customers: CarCustomerOption[];
  car?: EditableCar;
  trigger?: React.ReactElement;
};

type SubmitStage = "idle" | "uploading" | "saving";

export function CarSheet({ customers, car, trigger }: CarSheetProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(searchParams.get("customerId") !== null && !car);
  const [plateImage, setPlateImage] = useState<File | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<SubmitStage>("idle");
  const defaultCustomerId = searchParams.get("customerId") ?? "";
  const form = useForm<CarFormData>({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      plateNumber: car?.plateNumber ?? "",
      customerId: car?.customerId ?? defaultCustomerId,
    },
  });
  const isSubmitting = stage !== "idle";

  useEffect(() => {
    if (stage !== "uploading") {
      return undefined;
    }

    const timeout = window.setTimeout(() => setStage("saving"), 700);

    return () => window.clearTimeout(timeout);
  }, [stage]);

  async function onSubmit(values: CarFormData) {
    setError(null);

    if (!car && !plateImage) {
      setError("Plate image is required");
      return;
    }

    const formData = new FormData();
    formData.set("plateNumber", values.plateNumber);
    formData.set("customerId", values.customerId);

    if (plateImage) {
      formData.set("plateImage", plateImage);
    }

    if (attachment) {
      formData.set("attachment", attachment);
    }

    setStage("uploading");

    try {
      if (car) {
        await updateCar(car.id, formData);
      } else {
        await createCar(formData);
      }

      toast.success("Car saved successfully");
      setPlateImage(null);
      setAttachment(null);
      setOpen(false);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save car.");
    } finally {
      setStage("idle");
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          trigger ?? (
            <Button>
              <PlusIcon data-icon="inline-start" />
              Add Car
            </Button>
          )
        }
      />
      <SheetContent side="right" className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{car ? "Edit Car" : "Add Car"}</SheetTitle>
          <SheetDescription>
            Save plate, ownership, and document details.
          </SheetDescription>
        </SheetHeader>

        <form className="flex flex-1 flex-col" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex-1 overflow-y-auto px-4">
            <FieldGroup>
              <Controller
                control={form.control}
                name="customerId"
                render={({ field, fieldState }) => (
                  <Field data-invalid={Boolean(fieldState.error)}>
                    <FieldLabel>Customer</FieldLabel>
                    <CustomerCombobox
                      customers={customers}
                      value={field.value}
                      onChange={field.onChange}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Field data-invalid={Boolean(form.formState.errors.plateNumber)}>
                <FieldLabel htmlFor="plate-number">Plate Number</FieldLabel>
                <Input
                  id="plate-number"
                  autoComplete="off"
                  aria-invalid={Boolean(form.formState.errors.plateNumber)}
                  {...form.register("plateNumber")}
                  onChange={(event) => {
                    event.target.value = event.target.value.toUpperCase();
                    form.register("plateNumber").onChange(event);
                  }}
                />
                <FieldDescription>{PLATE_NUMBER_HINT}</FieldDescription>
                <FieldError errors={[form.formState.errors.plateNumber]} />
              </Field>

              <FileUploadZone
                label="Plate Image"
                accept="image/jpeg,image/png,image/webp"
                file={plateImage}
                currentUrl={car?.plateImageUrl}
                required={!car}
                onFileChange={setPlateImage}
              />

              <FileUploadZone
                label="Car Document / Inspection Report (optional)"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                file={attachment}
                currentUrl={car?.attachmentType === "image" ? car.attachmentUrl : null}
                onFileChange={setAttachment}
              />

              {error ? (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              ) : null}
            </FieldGroup>
          </div>

          <SheetFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2Icon data-icon="inline-start" className="animate-spin" />
              ) : null}
              {stage === "uploading"
                ? "Uploading..."
                : stage === "saving"
                  ? "Saving..."
                  : "Save"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
