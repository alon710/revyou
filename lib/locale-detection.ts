import { cookies, headers } from "next/headers";
import { defaultLocale, isValidLocale, locales, type Locale } from "@/i18n/config";
import acceptLanguage from "accept-language";

acceptLanguage.languages(locales as unknown as string[]);

export async function detectLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE");

  if (localeCookie?.value && isValidLocale(localeCookie.value)) {
    return localeCookie.value;
  }

  const headersList = await headers();
  const acceptLanguageHeader = headersList.get("accept-language");

  if (acceptLanguageHeader) {
    const detectedLocale = acceptLanguage.get(acceptLanguageHeader);
    if (detectedLocale && isValidLocale(detectedLocale)) {
      return detectedLocale;
    }
  }

  return defaultLocale;
}
