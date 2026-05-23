import { z } from "zod";

const uzbekPhoneRegex = /^\+998\d{9}$/;
const rawUzbekPhoneRegex = /^998\d{9}$/;

export function normalizeUzbekPhone(value: string) {
  const compact = value.replace(/\s/g, "");

  if (!uzbekPhoneRegex.test(compact)) {
    return null;
  }

  return compact.replace(/\D/g, "");
}

export function formatUzbekPhone(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!rawUzbekPhoneRegex.test(digits)) {
    return value;
  }

  return `+998 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(
    8,
    10
  )} ${digits.slice(10, 12)}`;
}

export const customerSchema = z.object({
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
});

export const updateCustomerSchema = customerSchema.partial().refine(
  (data) => data.name !== undefined || data.phone !== undefined,
  {
    message: "At least one field is required",
  }
);

export type CustomerInput = z.input<typeof customerSchema>;
export type CustomerData = z.output<typeof customerSchema>;
export type UpdateCustomerInput = z.input<typeof updateCustomerSchema>;
