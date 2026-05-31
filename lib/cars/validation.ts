import { z } from "zod";

export const PLATE_NUMBER_HINT = "Format: 01A234BC";
export const plateNumberRegex = /^[0-9]{2}[A-Z]{1}[0-9]{3}[A-Z]{2}$/;

export const imageMimeTypes = ["image/jpeg", "image/png", "image/webp"] as const;
export const pdfMimeType = "application/pdf";
export const maxImageSize = 5 * 1024 * 1024;
export const maxPdfSize = 10 * 1024 * 1024;

export type AttachmentType = "image" | "pdf";

export function normalizePlateNumber(value: string) {
  return value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

export const plateNumberSchema = z
  .string()
  .trim()
  .min(1, "Plate number is required")
  .transform(normalizePlateNumber)
  .refine((value) => plateNumberRegex.test(value), {
    message: "Plate number must match Uzbek format 01A234BC",
  });

export const carFormSchema = z.object({
  name: z
    .string()
    .trim()
    .max(80, "Car name must be 80 characters or fewer")
    .transform((value) => (value.length > 0 ? value : null)),
  plateNumber: plateNumberSchema,
  customerId: z.string().min(1, "Customer is required"),
});

export function getAttachmentType(mimeType: string): AttachmentType | null {
  if (imageMimeTypes.includes(mimeType as (typeof imageMimeTypes)[number])) {
    return "image";
  }

  if (mimeType === pdfMimeType) {
    return "pdf";
  }

  return null;
}

export function isAllowedImageType(mimeType: string) {
  return getAttachmentType(mimeType) === "image";
}

export function validateUploadFile(file: File, options?: { imageOnly?: boolean }) {
  const attachmentType = getAttachmentType(file.type);

  if (!attachmentType) {
    throw new Error("Only JPG, PNG, WEBP images and PDF files are allowed");
  }

  if (options?.imageOnly && attachmentType !== "image") {
    throw new Error("Plate image must be JPG, PNG, or WEBP");
  }

  if (attachmentType === "image" && file.size > maxImageSize) {
    throw new Error("Image files must be 5MB or smaller");
  }

  if (attachmentType === "pdf" && file.size > maxPdfSize) {
    throw new Error("PDF files must be 10MB or smaller");
  }

  return attachmentType;
}

export function getFileFromFormData(formData: FormData, key: string) {
  const value = formData.get(key);

  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  return value;
}

export type CarFormData = z.infer<typeof carFormSchema>;
export type CarFormInput = z.input<typeof carFormSchema>;
