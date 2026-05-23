import { z } from "zod";

export const createJobOrderSchema = z.object({
  carId: z.string().min(1, "Car is required"),
  problemDescription: z
    .string()
    .trim()
    .min(10, "Problem description must be at least 10 characters"),
  masterId: z.string().optional().nullable(),
});

export const diagnosisSchema = z.object({
  diagnosisNotes: z
    .string()
    .trim()
    .min(10, "Diagnosis notes must be at least 10 characters"),
  masterId: z.string().min(1, "Master is required"),
});

export const serviceFeeSchema = z.object({
  serviceFee: z.coerce.number().min(0, "Service fee cannot be negative"),
});

export type CreateJobOrderInput = z.infer<typeof createJobOrderSchema>;
export type DiagnosisInput = z.infer<typeof diagnosisSchema>;
