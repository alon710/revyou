import { adminAuth } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, type Locale, isValidLocale } from "@/i18n/config";

const SESSION_COOKIE_NAME = "session";
const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

export async function getAuthenticatedUserId(): Promise<{ userId: string }> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie) {
      throw new Error("Session cookie not found");
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie.value, true);

    return { userId: decodedClaims.uid };
  } catch (error) {
    console.error("Failed to authenticate user:", error);
    throw new Error("Failed to authenticate user");
  }
}

export function getLocaleFromRequest(request: NextRequest): Locale {
  const localeCookie = request.cookies.get(LOCALE_COOKIE_NAME);
  const locale = localeCookie?.value;

  if (locale && isValidLocale(locale)) {
    return locale;
  }

  return defaultLocale;
}

export function createLocaleAwareRedirect(
  request: NextRequest,
  path: string,
  searchParams?: Record<string, string>
): NextResponse {
  const locale = getLocaleFromRequest(request);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  const localePath = `/${locale}${path}`;

  let url = `${baseUrl}${localePath}`;
  if (searchParams && Object.keys(searchParams).length > 0) {
    const params = new URLSearchParams(searchParams);
    url = `${url}?${params.toString()}`;
  }

  return NextResponse.redirect(url);
}
