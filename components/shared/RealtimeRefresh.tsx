"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { getSupabasePublicClient } from "@/lib/supabase";

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");

  return window.atob(padded);
}

function canUseRealtimePublicKey() {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!key) {
    return false;
  }

  if (key.startsWith("sb_publishable_")) {
    return true;
  }

  const [, payload] = key.split(".");

  if (!payload) {
    return false;
  }

  try {
    const parsed = JSON.parse(decodeBase64Url(payload)) as {
      iss?: unknown;
      role?: unknown;
    };

    return parsed.iss === "supabase" && parsed.role === "anon";
  } catch {
    return false;
  }
}

export function RealtimeRefresh() {
  const router = useRouter();
  const refreshTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!canUseRealtimePublicKey()) {
      return undefined;
    }

    const supabase = getSupabasePublicClient();

    const scheduleRefresh = () => {
      if (refreshTimer.current !== null) {
        window.clearTimeout(refreshTimer.current);
      }

      refreshTimer.current = window.setTimeout(() => {
        router.refresh();
        refreshTimer.current = null;
      }, 300);
    };

    const channel = supabase
      .channel("dashboard-refresh")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "RealtimeEvent",
          filter: "topic=eq.dashboard",
        },
        scheduleRefresh
      )
      .subscribe();

    return () => {
      if (refreshTimer.current !== null) {
        window.clearTimeout(refreshTimer.current);
      }

      void supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
