import { enUS, ru, uz } from "date-fns/locale";

import type { Locale } from "@/lib/i18n/config";

export function getDateFnsLocale(locale: Locale) {
  if (locale === "ru") {
    return ru;
  }

  if (locale === "uz") {
    return uz;
  }

  return enUS;
}
