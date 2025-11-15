"use client";

import {
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { useState, useEffect } from "react";
import { createSession, deleteSession } from "@/lib/actions/auth.actions";

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("https://www.googleapis.com/auth/userinfo.email");
googleProvider.addScope("https://www.googleapis.com/auth/userinfo.profile");

export async function signInWithGoogle() {
  if (!auth || !db) {
    return {
      user: null,
      error: "auth.errors.firebaseNotConfigured",
    };
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      const newUserData = {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || "User",
        photoURL: user.photoURL || "",
        createdAt: serverTimestamp(),
      };

      try {
        await setDoc(userDocRef, newUserData);
      } catch (createError) {
        throw createError;
      }
    }

    try {
      const idToken = await user.getIdToken();
      await createSession(idToken);
    } catch (sessionError) {
      console.error("Session creation error:", sessionError);
      throw new Error("auth.errors.sessionCreationFailed");
    }

    return { user, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "auth.errors.googleSignInFailed";
    return { user: null, error: errorMessage };
  }
}

export async function signOut() {
  if (!auth) {
    return { error: "auth.errors.firebaseNotConfigured", sessionDeletionFailed: false };
  }

  let sessionDeletionFailed = false;

  try {
    try {
      await deleteSession();
    } catch (sessionError) {
      console.error("Session deletion error:", sessionError);
      sessionDeletionFailed = true;
    }

    await firebaseSignOut(auth);
    return { error: null, sessionDeletionFailed };
  } catch (error) {
    console.error("Sign out error:", error);
    return { error: "auth.errors.signOutFailed", sessionDeletionFailed };
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => !!auth);
  const [error, setError] = useState<string | null>(() => (!auth ? "auth.errors.firebaseNotConfigured" : null));

  useEffect(() => {
    if (!auth) {
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        try {
          if (user) {
            const idToken = await user.getIdToken();
            await createSession(idToken);
            setUser(user);
            setError(null);
          } else {
            setUser(null);
            setError(null);
          }
        } catch (error) {
          console.error("Failed to create session:", error);
          setError("auth.errors.sessionCreationFailed");
          setUser(null);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Auth state change error:", error);
        setError("auth.errors.authStateError");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { user, loading, error };
}
