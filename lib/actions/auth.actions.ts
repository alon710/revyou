"use server";

import { adminAuth } from "@/lib/firebase/admin";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "session";
const SESSION_DURATION = 60 * 60 * 24 * 5 * 1000; // 5 days

export async function createSession(idToken: string): Promise<{ success: boolean; userId: string }> {
  if (!idToken) {
    throw new Error("ID token is required");
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

  return {
    success: true,
    userId: decodedToken.uid,
  };
}

export async function deleteSession(): Promise<{ success: boolean }> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);

  return { success: true };
}
