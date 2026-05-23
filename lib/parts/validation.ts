import { z } from "zod";

export const partSchema = z.object({
  name: z.string().trim().min(1, "Part name is required"),
  stockQty: z.coerce.number().int().min(0, "Stock quantity cannot be negative"),
  unitPrice: z.coerce.number().min(0, "Unit price cannot be negative"),
});

export const updatePartSchema = partSchema.partial().refine(
  (data) =>
    data.name !== undefined ||
    data.stockQty !== undefined ||
    data.unitPrice !== undefined,
  {
    message: "At least one field is required",
  }
);

export const stockAdjustmentSchema = z.object({
  delta: z.coerce.number().int(),
});

export const addJobPartSchema = z.object({
  partId: z.string().min(1, "Part is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
});

export type PartInput = z.infer<typeof partSchema>;
export type PartFormInput = z.input<typeof partSchema>;
export type UpdatePartInput = z.infer<typeof updatePartSchema>;
export type AddJobPartInput = z.infer<typeof addJobPartSchema>;
export type AddJobPartFormInput = z.input<typeof addJobPartSchema>;
