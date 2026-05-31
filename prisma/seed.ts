import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

import { normalizeAuthPhone } from "../lib/auth/phone";

function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) {
    return;
  }

  const lines = readFileSync(filePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^["']|["']$/g, "");

    process.env[key] ??= value;
  }
}

loadEnvFile(resolve(process.cwd(), ".env.local"));
loadEnvFile(resolve(process.cwd(), ".env"));

const prisma = new PrismaClient();

function requireEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required to seed the first admin user`);
  }

  return value;
}

async function main() {
  const email = requireEnv("ADMIN_EMAIL").toLowerCase();
  const password = requireEnv("ADMIN_PASSWORD");
  const name = process.env.ADMIN_NAME?.trim() || "Admin";
  const rawPhone = process.env.ADMIN_PHONE?.trim();
  const phone = rawPhone ? normalizeAuthPhone(rawPhone) : null;
  const resetPassword = process.env.ADMIN_RESET_PASSWORD === "true";

  if (rawPhone && !phone) {
    throw new Error("ADMIN_PHONE must be a valid Uzbek phone number");
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        {
          email,
        },
        ...(phone
          ? [
              {
                phone,
              },
            ]
          : []),
      ],
    },
    select: {
      id: true,
      role: true,
    },
  });

  if (existingUser) {
    await prisma.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        name,
        email,
        ...(phone ? { phone } : {}),
        role: "ADMIN",
        ...(resetPassword ? { password: await hash(password, 12) } : {}),
      },
    });

    console.log(
      resetPassword
        ? `Admin user updated and password reset: ${email}`
        : `Admin user already exists; role/name verified: ${email}`
    );
    return;
  }

  await prisma.user.create({
    data: {
      name,
      email,
      phone,
      password: await hash(password, 12),
      role: "ADMIN",
    },
  });

  console.log(`Admin user created: ${email}`);
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
