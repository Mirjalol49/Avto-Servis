import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let publicClient: SupabaseClient | undefined;
let serviceRoleClient: SupabaseClient | undefined;

function requiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

function requiredFirstEnv(names: string[]) {
  for (const name of names) {
    const value = process.env[name];

    if (value) {
      return value;
    }
  }

  throw new Error(`Missing environment variable: ${names.join(" or ")}`);
}

export function getSupabasePublicClient() {
  if (!publicClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl) {
      throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
    }

    if (!supabaseKey) {
      throw new Error(
        "Missing environment variable: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY"
      );
    }

    publicClient = createClient(
      supabaseUrl,
      supabaseKey
    );
  }

  return publicClient;
}

export function getSupabaseServiceRoleClient() {
  if (typeof window !== "undefined") {
    throw new Error("Supabase service role client must only be used on the server.");
  }

  if (!serviceRoleClient) {
    serviceRoleClient = createClient(
      requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
      requiredFirstEnv(["SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY"]),
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }

  return serviceRoleClient;
}
