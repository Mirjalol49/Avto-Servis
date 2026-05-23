"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { getSupabasePublicClient } from "@/lib/supabase";

export function RealtimeRefresh() {
  const router = useRouter();
  const refreshTimer = useRef<number | null>(null);

  useEffect(() => {
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
