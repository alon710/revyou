import { createActionClient } from "@/lib/supabase/action";
import { NextRequest } from "next/server";
import { createLocaleAwareRedirect } from "@/lib/api/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard/home";

  if (code) {
    const supabase = await createActionClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return createLocaleAwareRedirect(request, next);
    }
  }

  return createLocaleAwareRedirect(request, "/auth/auth-code-error");
}
