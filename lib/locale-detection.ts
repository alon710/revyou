import { cookies, headers } from "next/headers";
import { defaultLocale, isValidLocale, locales, type Locale } from "@/i18n/config";
import acceptLanguage from "accept-language";
import { createClient } from "@/lib/supabase/server";
import { UsersConfigsRepository } from "@/lib/db/repositories/users-configs.repository";

acceptLanguage.languages(locales as unknown as string[]);

export async function detectLocale(): Promise<Locale> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const repo = new UsersConfigsRepository();
      const config = await repo.get(user.id);
      if (config && config.locale && isValidLocale(config.locale)) {
        return config.locale as Locale;
      }
    }
  } catch (error) {
    console.error("Error fetching user locale from database:", error);
  }

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
