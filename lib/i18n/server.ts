import { cookies } from "next/headers";

import { defaultLocale, isLocale, localeCookieName } from "@/lib/i18n/config";
import { dictionaries } from "@/lib/i18n/dictionaries";

export function getLocale() {
  const cookieLocale = cookies().get(localeCookieName)?.value;

  return isLocale(cookieLocale) ? cookieLocale : defaultLocale;
}

export function getDictionary() {
  return dictionaries[getLocale()];
}
