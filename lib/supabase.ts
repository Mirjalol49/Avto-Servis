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
    publicClient = createClient(
      requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
      requiredFirstEnv([
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      ])
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
