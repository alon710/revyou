import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { type Locale, defaultLocale } from "@/lib/locale";

export default getRequestConfig(async ({ requestLocale }) => {
  const nextIntlLocale = await requestLocale;

  let locale: Locale;
  if (nextIntlLocale && routing.locales.includes(nextIntlLocale as Locale)) {
    locale = nextIntlLocale as Locale;
  } else {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
