"use client";

import { CheckIcon, LanguagesIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { locales, localeCookieName, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

type LanguageSwitcherProps = {
  currentLocale: Locale;
  labels: Record<Locale, string>;
  title: string;
  compact?: boolean;
};

const maxAge = 60 * 60 * 24 * 365;

export function LanguageSwitcher({
  currentLocale,
  labels,
  title,
  compact = false,
}: LanguageSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function setLocale(locale: Locale) {
    document.cookie = `${localeCookieName}=${locale}; path=/; max-age=${maxAge}; SameSite=Lax`;

    startTransition(() => {
      router.refresh();
    });
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
        <LanguagesIcon className="size-4 text-muted-foreground" />
        {locales.map((locale) => (
          <button
            key={locale}
            type="button"
            disabled={isPending}
            aria-pressed={currentLocale === locale}
            onClick={() => setLocale(locale)}
            className={cn(
              "rounded-md px-2 py-1 font-mono text-[11px] uppercase text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50",
              currentLocale === locale && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
            )}
          >
            {locale}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm font-medium">{title}</div>
      <div className="grid gap-2 sm:grid-cols-3">
        {locales.map((locale) => {
          const active = currentLocale === locale;

          return (
            <button
              key={locale}
              type="button"
              disabled={isPending}
              aria-pressed={active}
              onClick={() => setLocale(locale)}
              className={cn(
                "flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-left transition-colors hover:border-primary/40 hover:bg-accent disabled:opacity-50",
                active && "border-primary bg-primary/10"
              )}
            >
              <span>
                <span className="block font-medium">{labels[locale]}</span>
                <span className="font-mono text-xs uppercase text-muted-foreground">
                  {locale}
                </span>
              </span>
              {active ? <CheckIcon className="text-primary" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
