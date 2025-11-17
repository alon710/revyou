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
      locale: config.locale,
      emailOnNewReview: config.emailOnNewReview,
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
      updates.locale = body.locale;
    }

    if (body.emailOnNewReview !== undefined) {
      if (!["true", "false"].includes(body.emailOnNewReview)) {
        return NextResponse.json({ error: "Invalid emailOnNewReview value" }, { status: 400 });
      }
      updates.emailOnNewReview = body.emailOnNewReview;
    }

    const controller = new UsersController();
    const updatedConfig = await controller.updateUserConfig(user.id, updates);

    return NextResponse.json({
      locale: updatedConfig.locale,
      emailOnNewReview: updatedConfig.emailOnNewReview,
    });
  } catch (error) {
    console.error("Error updating user settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
