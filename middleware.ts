import createMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";
import { updateSession } from "./lib/supabase/middleware";
import type { NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)", "/"],
};
