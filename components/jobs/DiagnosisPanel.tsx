"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { EditIcon, Loader2Icon, UserRoundIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { addDiagnosis } from "@/actions/jobs";
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
import { Textarea } from "@/components/ui/textarea";
import {
  diagnosisSchema,
  type DiagnosisInput,
} from "@/lib/jobs/validation";

type MasterOption = {
  id: string;
  name: string;
  specialization: string | null;
};

type DiagnosisPanelProps = {
  jobId: string;
  diagnosisNotes: string | null;
  master: MasterOption | null;
  masters: MasterOption[];
};

export function DiagnosisPanel({
  jobId,
  diagnosisNotes,
  master,
  masters,
}: DiagnosisPanelProps) {
  const [editing, setEditing] = useState(!diagnosisNotes);
  const form = useForm<DiagnosisInput>({
    resolver: zodResolver(diagnosisSchema),
    defaultValues: {
      diagnosisNotes: diagnosisNotes ?? "",
      masterId: master?.id ?? "",
    },
  });

  async function onSubmit(values: DiagnosisInput) {
    try {
      await addDiagnosis(jobId, values);
      toast.success("Diagnosis saved");
      setEditing(false);
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not save diagnosis");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {editing ? (
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field data-invalid={Boolean(form.formState.errors.diagnosisNotes)}>
              <FieldLabel htmlFor="diagnosis-notes">Diagnosis notes</FieldLabel>
              <Textarea
                id="diagnosis-notes"
                rows={5}
                aria-invalid={Boolean(form.formState.errors.diagnosisNotes)}
                {...form.register("diagnosisNotes")}
              />
              <FieldError errors={[form.formState.errors.diagnosisNotes]} />
            </Field>
            <Field data-invalid={Boolean(form.formState.errors.masterId)}>
              <FieldLabel>Master</FieldLabel>
              <Select
                items={masters.map((item) => ({ label: item.name, value: item.id }))}
                value={form.watch("masterId")}
                onValueChange={(value) => {
                  if (typeof value === "string") {
                    form.setValue("masterId", value);
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select master" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {masters.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                        {item.specialization ? ` · ${item.specialization}` : ""}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldError errors={[form.formState.errors.masterId]} />
            </Field>
            <div className="flex gap-2">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <Loader2Icon data-icon="inline-start" className="animate-spin" />
                ) : null}
                Save diagnosis
              </Button>
              {diagnosisNotes ? (
                <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </FieldGroup>
        </form>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="rounded-lg border border-white/10 bg-muted/30 p-3 text-sm leading-relaxed">
            {diagnosisNotes}
          </div>
          <Button type="button" variant="outline" className="w-fit" onClick={() => setEditing(true)}>
            <EditIcon data-icon="inline-start" />
            Edit
          </Button>
        </div>
      )}

      {master ? (
        <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-muted/30 p-3">
          <div className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/5 font-medium text-slate-200">
            {master.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium">{master.name}</div>
            <div className="text-sm text-muted-foreground">
              {master.specialization ?? "No specialization"}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <UserRoundIcon />
          Assigned master: Unassigned
        </div>
      )}
    </div>
  );
}
