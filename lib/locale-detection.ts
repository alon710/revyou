import { cookies, headers } from "next/headers";
import { unstable_noStore } from "next/cache";
import acceptLanguage from "accept-language";
import { UsersConfigsRepository } from "@/lib/db/repositories/users-configs.repository";
import { defaultLocale, isValidLocale, type Locale } from "./locale";
import type { UsersConfig } from "@/lib/db/schema/users-configs.schema";
import { getUserIdFromHeaders } from "@/lib/user-context";

let initialized = false;

export function initAcceptLanguage(locales: string[]): void {
  if (!initialized) {
    acceptLanguage.languages(locales);
    initialized = true;
  }
}

interface ResolveLocaleOptions {
  urlLocale?: string;
  userId?: string;
  userConfig?: UsersConfig;
}

export async function resolveLocale(options?: ResolveLocaleOptions): Promise<Locale> {
  const { urlLocale, userId, userConfig } = options || {};

  if (urlLocale && isValidLocale(urlLocale)) {
    return urlLocale;
  }

  if (userConfig) {
    if (userConfig.configs.LOCALE && isValidLocale(userConfig.configs.LOCALE)) {
      return userConfig.configs.LOCALE as Locale;
    }
    return defaultLocale;
  }

  unstable_noStore();

  try {
    let targetUserId: string | undefined;

    if (userId) {
      targetUserId = userId;
    } else {
      targetUserId = await getUserIdFromHeaders();
    }

    if (targetUserId) {
      const repo = new UsersConfigsRepository();
      const config = await repo.get(targetUserId);
      if (config?.configs.LOCALE && isValidLocale(config.configs.LOCALE)) {
        return config.configs.LOCALE as Locale;
      }
    }
  } catch (error) {
    console.error("Error fetching user locale from database:", error);
  }

  try {
    const cookieStore = await cookies();
    const localeCookie = cookieStore.get("NEXT_LOCALE");
    if (localeCookie?.value && isValidLocale(localeCookie.value)) {
      return localeCookie.value;
    }
  } catch (error) {
    console.debug("Error reading locale cookie:", error);
  }

  try {
    const headersList = await headers();
    const acceptLanguageHeader = headersList.get("accept-language");
    if (acceptLanguageHeader) {
      const detectedLocale = acceptLanguage.get(acceptLanguageHeader);
      if (detectedLocale && isValidLocale(detectedLocale)) {
        return detectedLocale;
      }
    }
  } catch (error) {
    console.warn("Error reading Accept-Language header:", error);
  }

  return defaultLocale;
}
