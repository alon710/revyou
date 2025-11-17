"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export async function signInWithGoogle() {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      return { user: null, error: error.message };
    }

    return { user: data, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "auth.errors.googleSignInFailed";
    return { user: null, error: errorMessage };
  }
}

export async function signOut() {
  const supabase = createClient();

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { error: error.message, sessionDeletionFailed: true };
    }

    return { error: null, sessionDeletionFailed: false };
  } catch (error) {
    console.error("Sign out error:", error);
    return { error: "auth.errors.signOutFailed", sessionDeletionFailed: true };
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Failed to get session:", error);
        setError("auth.errors.sessionCreationFailed");
        setUser(null);
      } else {
        setUser(session?.user ?? null);
        setError(null);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      setError(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading, error };
}
