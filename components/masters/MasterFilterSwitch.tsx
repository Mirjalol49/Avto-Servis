"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { Switch } from "@/components/ui/switch";

export function MasterFilterSwitch({ includeInactive }: { includeInactive: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  function setIncludeInactive(checked: boolean) {
    const params = new URLSearchParams(searchParams.toString());

    if (checked) {
      params.set("show", "all");
    } else {
      params.delete("show");
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <label className="flex items-center gap-3 rounded-lg border px-3 py-2 text-sm">
      <span className="font-medium">{includeInactive ? "Show All" : "Active Only"}</span>
      <Switch checked={includeInactive} onCheckedChange={setIncludeInactive} />
    </label>
  );
}
