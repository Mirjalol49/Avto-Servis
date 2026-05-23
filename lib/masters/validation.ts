import { z } from "zod";

import { normalizeUzbekPhone } from "@/lib/customers/validation";

export const specializationSuggestions = [
  "Engine",
  "Transmission",
  "Electrician",
  "Body & Paint",
  "Tires",
  "Diagnostics",
] as const;

export const masterSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .trim()
    .transform((value, context) => {
      const normalized = normalizeUzbekPhone(value);

      if (!normalized) {
        context.addIssue({
          code: "custom",
          message: "Phone must match +998XXXXXXXXX",
        });
        return z.NEVER;
      }

      return normalized;
    }),
  specialization: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((value) => (value ? value : null)),
});

export const updateMasterSchema = masterSchema.partial().refine(
  (data) =>
    data.name !== undefined ||
    data.phone !== undefined ||
    data.specialization !== undefined,
  {
    message: "At least one field is required",
  }
);

export type MasterInput = z.input<typeof masterSchema>;
export type MasterData = z.output<typeof masterSchema>;
export type UpdateMasterInput = z.input<typeof updateMasterSchema>;
