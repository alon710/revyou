import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if user has auth cookie (set by Firebase)
  const hasAuthCookie = request.cookies.has('__session');

  // Define protected routes (dashboard routes)
  const isProtectedRoute = pathname.startsWith('/dashboard') ||
                          pathname.startsWith('/businesses') ||
                          pathname.startsWith('/reviews') ||
                          pathname.startsWith('/settings') ||
                          pathname.startsWith('/billing');

  // Define auth routes
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !hasAuthCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from login/register to dashboard
  if (isAuthRoute && hasAuthCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

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
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|$).*)',
  ],
};
