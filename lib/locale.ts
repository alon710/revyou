import acceptLanguage from "accept-language";

export type Locale = "en" | "he";

export const locales: Locale[] = ["en", "he"] as const;
export const defaultLocale: Locale = "en";

export const localeConfig = {
  en: {
    label: "English",
    dir: "ltr" as const,
  },
  he: {
    label: "עברית",
    dir: "rtl" as const,
  },
} as const;

export function getLocaleDir(locale: Locale): "ltr" | "rtl" {
  return localeConfig[locale].dir;
}

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

acceptLanguage.languages(locales as unknown as string[]);
