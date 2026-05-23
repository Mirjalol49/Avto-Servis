import type { UserRole } from "@prisma/client";

export function roleAllowed(role: UserRole | null | undefined, allowedRoles: UserRole[]) {
  return Boolean(role && allowedRoles.includes(role));
}
