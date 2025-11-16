import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const redirectUrl = new URL(next, origin);
      return NextResponse.redirect(redirectUrl);
    }

    console.error('Auth callback error:', error);
    return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent(error.message)}`);
  }

  return NextResponse.redirect(`${origin}/auth/error?message=No code provided`);
}
