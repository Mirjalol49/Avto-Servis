import type { UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/options";
import { roleAllowed } from "@/lib/auth/role";

export type AppSessionUser = {
  id: string;
  role: UserRole;
  name?: string | null;
  email?: string | null;
};

export async function requireUser(): Promise<AppSessionUser> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("Authentication required");
  }

  return session.user;
}

export async function requireRole(roles: UserRole[]): Promise<AppSessionUser> {
  const user = await requireUser();

  if (!roleAllowed(user.role, roles)) {
    throw new Error("Permission denied");
  }

  return user;
}

export async function requireAdmin() {
  return requireRole(["ADMIN"]);
}

export async function requireReception() {
  return requireRole(["ADMIN", "RECEPTIONIST"]);
}

export async function requireWorkshopAccess() {
  return requireRole(["ADMIN", "RECEPTIONIST", "MASTER"]);
}
