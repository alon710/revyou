import createMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // First, handle Supabase session refresh
  const { supabaseResponse } = await updateSession(request);

  // Then apply the i18n middleware
  const intlResponse = intlMiddleware(request);

  // Merge the responses, prioritizing Supabase cookies
  if (supabaseResponse.cookies.getAll().length > 0) {
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      intlResponse.cookies.set(cookie.name, cookie.value);
    });
  }

  return intlResponse;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)", "/"],
};
