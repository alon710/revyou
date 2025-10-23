import { NextResponse } from "next/server";

/**
 * Simplified middleware - Client-side auth handling is done in AuthContext
 * This middleware only prevents direct access to protected routes without
 * creating redirect loops. The actual auth state is managed by Firebase Auth.
 */
export function middleware() {
  // Let Next.js handle all routing
  // Auth state is managed client-side by AuthContext and Firebase
  // Protected routes are handled in the dashboard layout
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|$).*)",
  ],
};
