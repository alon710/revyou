import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "session";
const SESSION_DURATION = 60 * 60 * 24 * 5 * 1000;

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "ID token is required" },
        { status: 400 }
      );
    }

    const decodedToken = await adminAuth.verifyIdToken(idToken);

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION,
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
      maxAge: SESSION_DURATION / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({
      success: true,
      userId: decodedToken.uid,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to create session: ${errorMessage}` },
      { status: 401 }
    );
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete session:", error);
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    );
  }
}
