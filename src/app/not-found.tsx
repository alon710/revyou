import { getTranslations } from "next-intl/server";
import { cookies, headers } from "next/headers";
import Link from "next/link";
import { defaultLocale, getLocaleDir, isValidLocale, locales, type Locale } from "@/i18n/config";
import acceptLanguage from "accept-language";
import "./globals.css";

acceptLanguage.languages(locales as unknown as string[]);

async function detectLocale(): Promise<Locale> {
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

export default async function NotFound() {
  const locale = await detectLocale();
  const t = await getTranslations({ locale, namespace: "errors.notFoundPage" });
  const dir = getLocaleDir(locale as Locale);

  return (
    <div
      dir={dir}
      className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 text-6xl font-bold tracking-tight text-foreground sm:text-7xl">{t("title")}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{t("description")}</p>
        <div className="mt-6">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {t("homeButton")}
          </Link>
        </div>
      </div>
    </div>
  );
}
