"use client";

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const themeOptions = [
  {
    value: "light",
    label: "Light",
    description: "Paper-white workspace for daytime operations.",
    icon: SunIcon,
  },
  {
    value: "dark",
    label: "Dark",
    description: "Deep indigo workspace for low-light environments.",
    icon: MoonIcon,
  },
  {
    value: "system",
    label: "System",
    description: "Follow this device automatically.",
    icon: MonitorIcon,
  },
] as const;

export function ThemeSettings() {
  const { resolvedTheme, setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = mounted ? theme ?? "system" : "system";
  const resolvedLabel = mounted && resolvedTheme === "dark" ? "Dark" : "Light";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Choose how AutoServis looks on this device.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-3 lg:grid-cols-3">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isActive = activeTheme === option.value;

            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={isActive}
                onClick={() => setTheme(option.value)}
                className={cn(
                  "flex min-h-32 flex-col items-start gap-3 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-accent",
                  isActive && "border-primary bg-primary/10 text-foreground"
                )}
              >
                <span className="flex size-9 items-center justify-center rounded-md border border-border bg-background text-primary">
                  <Icon />
                </span>
                <span>
                  <span className="block font-heading text-base font-semibold">
                    {option.label}
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {option.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/45 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-medium">Current resolved mode</div>
            <div className="text-sm text-muted-foreground">
              System preference currently renders as {resolvedLabel}.
            </div>
          </div>
          <Button type="button" variant="outline" onClick={() => setTheme("system")}>
            <MonitorIcon data-icon="inline-start" />
            Use system
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
