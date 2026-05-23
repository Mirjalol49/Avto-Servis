import { readFileSync } from "node:fs";

import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

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
    // Missing env files are allowed; CI can provide real environment variables.
  }
}

const requiredEnvNames = [
  "DATABASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
];

for (const name of requiredEnvNames) {
  if (!process.env[name]) {
    throw new Error(`Missing environment variable: ${name}`);
  }
}

function requiredFirstEnv(names) {
  for (const name of names) {
    const value = process.env[name];

    if (value) {
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
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

const bucket = "car-service-files";
const supabase = createClient(
  supabaseUrl,
  secretKey.value,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const bucketResult = await supabase.storage.getBucket(bucket);

if (bucketResult.error) {
  throw new Error(`Storage bucket check failed: ${bucketResult.error.message}`);
}

const objectPath = `healthcheck/${Date.now()}-verify.png`;
const transparentPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
  "base64"
);

const uploadResult = await supabase.storage.from(bucket).upload(objectPath, transparentPng, {
  cacheControl: "60",
  contentType: "image/png",
  upsert: false,
});

if (uploadResult.error) {
  throw new Error(`Storage upload failed: ${uploadResult.error.message}`);
}

const deleteResult = await supabase.storage.from(bucket).remove([objectPath]);

if (deleteResult.error) {
  throw new Error(`Storage cleanup failed: ${deleteResult.error.message}`);
}

const prisma = new PrismaClient();

try {
  const publicationTables = await prisma.$queryRaw`
    SELECT tablename
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
    ORDER BY tablename
  `;
  const tableNames = publicationTables.map((row) => row.tablename);

  if (!tableNames.includes("RealtimeEvent")) {
    throw new Error("RealtimeEvent is not enabled in the supabase_realtime publication");
  }

  console.log(
    JSON.stringify(
      {
        supabaseProject: projectRef,
        publicKey: publicKeyInfo.type,
        secretKey: secretKeyInfo.type,
        storage: {
          bucket,
          public: bucketResult.data.public,
          upload: "ok",
          delete: "ok",
        },
        realtimePublicationTables: tableNames,
      },
      null,
      2
    )
  );
} finally {
  await prisma.$disconnect();
}
