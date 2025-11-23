"use server";

import { getAuthenticatedUserId } from "@/lib/api/auth";
import { UsersController } from "@/lib/controllers/users.controller";
import type { UserConfigUpdate } from "@/lib/types/user.types";
import { isValidLocale, type Locale } from "@/lib/locale";
import { cookies } from "next/headers";

interface UserSettings {
  locale: Locale;
  emailOnNewReview: boolean;
}

export async function getUserSettings(): Promise<UserSettings> {
  const { userId } = await getAuthenticatedUserId();

  const controller = new UsersController();
  const config = await controller.getUserConfig(userId);

  return {
    locale: config.configs.LOCALE as Locale,
    emailOnNewReview: config.configs.EMAIL_ON_NEW_REVIEW,
  };
}

export async function updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
  const { userId } = await getAuthenticatedUserId();

  const updates: UserConfigUpdate = {};

  if (settings.locale !== undefined) {
    if (!isValidLocale(settings.locale)) {
      throw new Error("Invalid locale");
    }
    updates.LOCALE = settings.locale;
  }

  if (settings.emailOnNewReview !== undefined) {
    if (typeof settings.emailOnNewReview !== "boolean") {
      throw new Error("Invalid emailOnNewReview value");
    }
    updates.EMAIL_ON_NEW_REVIEW = settings.emailOnNewReview;
  }

  const controller = new UsersController();
  const updatedConfig = await controller.updateUserConfig(userId, updates);

  if (settings.locale !== undefined && updatedConfig.configs.LOCALE) {
    const cookieStore = await cookies();
    cookieStore.set("NEXT_LOCALE", updatedConfig.configs.LOCALE, {
      maxAge: 365 * 24 * 60 * 60,
      path: "/",
      sameSite: "lax",
    });
  }

  return {
    locale: updatedConfig.configs.LOCALE as Locale,
    emailOnNewReview: updatedConfig.configs.EMAIL_ON_NEW_REVIEW,
  };
}
