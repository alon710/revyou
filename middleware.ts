import createMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { supabaseResponse } = await updateSession(request);

  const intlResponse = intlMiddleware(request);

  if (supabaseResponse.cookies.getAll().length > 0) {
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      intlResponse.cookies.set(cookie.name, cookie.value);
    });
  }

  return intlResponse;
}

export const config = {
  matcher: ["/(.+)/dashboard/:path*", "/(.+)/onboarding/:path*", "/(.+)/checkout/:path*", "/(.+)/settings/:path*"],
};
