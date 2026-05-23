import { readFileSync } from "node:fs";

const envFiles = [".env.local", ".env"];

for (const file of envFiles) {
  try {
    const content = readFileSync(file, "utf8");

    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");

      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed
        .slice(separatorIndex + 1)
        .trim()
        .replace(/^["']|["']$/g, "");

      process.env[key] ??= value;
    }
  } catch {
    // CI can provide environment variables without local env files.
  }
}

const requiredEnvNames = [
  "DATABASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "CURRENCY",
];

for (const name of requiredEnvNames) {
  const value = process.env[name];

  if (!value || value.includes("your-") || value.includes("PROJECT_REF")) {
    throw new Error(`Missing or placeholder environment variable: ${name}`);
  }
}

function requiredFirstEnv(names) {
  for (const name of names) {
    const value = process.env[name];

    if (value && !value.includes("your-") && !value.includes("PROJECT_REF")) {
      return {
        name,
        value,
      };
    }
  }

  throw new Error(`Missing environment variable: ${names.join(" or ")}`);
}

function decodeJwtPayload(token, name) {
  const [, payload] = token.split(".");

  if (!payload) {
    throw new Error(`${name} is not a JWT-style Supabase key`);
  }

  return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
}

function validateSupabaseKey(key, expected) {
  if (expected === "public" && key.value.startsWith("sb_publishable_")) {
    return {
      type: "publishable",
    };
  }

  if (expected === "secret" && key.value.startsWith("sb_secret_")) {
    return {
      type: "secret",
    };
  }

  const payload = decodeJwtPayload(key.value, key.name);
  const expectedRole = expected === "public" ? "anon" : "service_role";

  if (payload.role !== expectedRole) {
    throw new Error(`${key.name} must be a ${expectedRole} compatible Supabase key`);
  }

  return {
    type: payload.role,
    ref: payload.ref,
  };
}

const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
const projectRef = supabaseUrl.hostname.split(".")[0];
const publicKey = requiredFirstEnv([
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
]);
const secretKey = requiredFirstEnv(["SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY"]);
const publicKeyInfo = validateSupabaseKey(publicKey, "public");
const secretKeyInfo = validateSupabaseKey(secretKey, "secret");

if (
  publicKeyInfo.ref &&
  secretKeyInfo.ref &&
  (publicKeyInfo.ref !== projectRef || secretKeyInfo.ref !== projectRef)
) {
  throw new Error("Supabase URL, public key, and secret key must use the same project ref");
}

if (!process.env.DATABASE_URL.includes("pgbouncer=true")) {
  throw new Error("DATABASE_URL must include ?pgbouncer=true for this Supabase connection");
}

if (!["USD", "UZS"].includes(process.env.CURRENCY)) {
  throw new Error("CURRENCY must be USD or UZS");
}

if (process.env.NEXTAUTH_SECRET.length < 32) {
  throw new Error("NEXTAUTH_SECRET must be at least 32 characters");
}

console.log(
  JSON.stringify(
    {
      status: "ok",
      supabaseProject: projectRef,
      publicKey: publicKeyInfo.type,
      secretKey: secretKeyInfo.type,
      currency: process.env.CURRENCY,
      nextAuthUrl: process.env.NEXTAUTH_URL,
    },
    null,
    2
  )
);
