"use client";

import { signOut } from "next-auth/react";
import { LogOutIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      <LogOutIcon data-icon="inline-start" />
      Sign out
    </Button>
  );
}
