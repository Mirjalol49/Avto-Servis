export const locales = ["uz", "en", "ru"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "uz";
export const localeCookieName = "autoservis_locale";

export function isLocale(value: string | undefined): value is Locale {
  return Boolean(value && locales.includes(value as Locale));
}
