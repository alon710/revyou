import { redirect } from "@/i18n/routing";
import { cookies } from "next/headers";
import { defaultLocale, isValidLocale, type Locale } from "@/i18n/config";

async function getLocaleFromCookies(): Promise<Locale> {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE");
  const locale = localeCookie?.value;

  if (locale && isValidLocale(locale)) {
    return locale;
  }

  return defaultLocale;
}

export default async function RootPage() {
  const locale = await getLocaleFromCookies();
  redirect({ href: "/", locale });
}
