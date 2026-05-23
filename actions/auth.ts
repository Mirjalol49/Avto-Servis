"use server";

import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";

import { createAuditLog } from "@/lib/audit/log";
import { requireAdmin } from "@/lib/auth/permissions";
import {
  createUserSchema,
  type CreateUserInput,
} from "@/lib/auth/validation";
import { prisma } from "@/lib/prisma";

export type CreateUserResult =
  | {
      ok: true;
      user: {
        id: string;
        name: string;
        email: string;
        role: CreateUserInput["role"];
      };
    }
  | {
      ok: false;
      message: string;
    };

export async function createUser(
  data: CreateUserInput
): Promise<CreateUserResult> {
  const actor = await requireAdmin();

  const parsed = createUserSchema.safeParse(data);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the user details and try again.",
    };
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      email: parsed.data.email,
    },
  });

  if (existingUser) {
    return {
      ok: false,
      message: "A user with this email already exists.",
    };
  }

  const password = await hash(parsed.data.password, 12);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password,
      role: parsed.data.role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  revalidatePath("/dashboard/settings/users");
  await createAuditLog({
    user: actor,
    action: "USER_CREATED",
    entity: "User",
    entityId: user.id,
    metadata: {
      email: user.email,
      role: user.role,
    },
  });

  return {
    ok: true,
    user,
  };
}
