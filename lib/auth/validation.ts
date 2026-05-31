import { z } from "zod";

import { normalizeAuthPhone } from "@/lib/auth/phone";

export const userRoleSchema = z.enum(["ADMIN", "RECEPTIONIST", "MASTER"]);

export const loginSchema = z.object({
  phone: z
    .string()
    .trim()
    .transform((value, context) => {
      const normalized = normalizeAuthPhone(value);

      if (!normalized) {
        context.addIssue({
          code: "custom",
          message: "Enter a valid Uzbek phone number",
        });
        return z.NEVER;
      }

      return normalized;
    }),
  password: z.string().min(1, "Password is required"),
});

export const createUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .transform((value, context) => {
      const normalized = normalizeAuthPhone(value);

      if (!normalized) {
        context.addIssue({
          code: "custom",
          message: "Enter a valid Uzbek phone number",
        });
        return z.NEVER;
      }

      return normalized;
    }),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: userRoleSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type AppUserRole = z.infer<typeof userRoleSchema>;

export function assertAdminRole(role: AppUserRole | null | undefined) {
  if (role !== "ADMIN") {
    throw new Error("Admin access required");
  }
}
