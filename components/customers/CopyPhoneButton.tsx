"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function CopyPhoneButton({ phone }: { phone: string }) {
  const [copied, setCopied] = useState(false);

  async function copyPhone() {
    await navigator.clipboard.writeText(phone);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <Button type="button" variant="outline" size="icon-sm" onClick={copyPhone}>
      {copied ? <CheckIcon /> : <CopyIcon />}
      <span className="sr-only">Copy phone number</span>
    </Button>
  );
}
