import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { UsersController } from "@/lib/controllers/users.controller";
import type { UserConfigUpdate } from "@/lib/types/user.types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const controller = new UsersController();
    const config = await controller.getUserConfig(user.id);

    return NextResponse.json({
      locale: config.configs.LOCALE,
      emailOnNewReview: config.configs.EMAIL_ON_NEW_REVIEW,
    });
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const updates: UserConfigUpdate = {};

    if (body.locale !== undefined) {
      if (!["en", "he"].includes(body.locale)) {
        return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
      }
      updates.LOCALE = body.locale;
    }

    if (body.emailOnNewReview !== undefined) {
      if (typeof body.emailOnNewReview !== "boolean") {
        return NextResponse.json({ error: "Invalid emailOnNewReview value" }, { status: 400 });
      }
      updates.EMAIL_ON_NEW_REVIEW = body.emailOnNewReview;
    }

    const controller = new UsersController();
    const updatedConfig = await controller.updateUserConfig(user.id, updates);

    const response = NextResponse.json({
      locale: updatedConfig.configs.LOCALE,
      emailOnNewReview: updatedConfig.configs.EMAIL_ON_NEW_REVIEW,
    });

    if (body.locale !== undefined && updatedConfig.configs.LOCALE) {
      response.cookies.set("NEXT_LOCALE", updatedConfig.configs.LOCALE, {
        maxAge: 365 * 24 * 60 * 60,
        path: "/",
        sameSite: "lax",
      });
    }

    return response;
  } catch (error) {
    console.error("Error updating user settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
