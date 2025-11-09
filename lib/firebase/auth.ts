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

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("https://www.googleapis.com/auth/userinfo.email");
googleProvider.addScope("https://www.googleapis.com/auth/userinfo.profile");

export async function signInWithGoogle() {
  if (!auth || !db) {
    return {
      user: null,
      error: "Firebase לא מוגדר. אנא בדוק את הגדרות הפרויקט.",
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

      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Session creation failed: ${errorData.error || response.statusText}`);
      }

      await response.json();
    } catch (sessionError) {
      console.error("Session creation error:", sessionError);
      throw new Error("לא ניתן ליצור הרשאה. אנא נסה להתחבר שוב.");
    }

    return { user, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "אירעה שגיאה בהתחברות עם גוגל";
    return { user: null, error: errorMessage };
  }
}

export async function signOut() {
  if (!auth) {
    return { error: "Firebase לא מוגדר", sessionDeletionFailed: false };
  }

  let sessionDeletionFailed = false;

  try {
    try {
      const response = await fetch("/api/auth/session", {
        method: "DELETE",
      });

      if (!response.ok) {
        sessionDeletionFailed = true;
      }
    } catch (sessionError) {
      console.error("Session deletion error:", sessionError);
      sessionDeletionFailed = true;
    }

    await firebaseSignOut(auth);
    return { error: null, sessionDeletionFailed };
  } catch (error) {
    console.error("Sign out error:", error);
    return { error: "אירעה שגיאה בהתנתקות", sessionDeletionFailed };
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => !!auth);
  const [error, setError] = useState<string | null>(() => (!auth ? "Firebase לא מוגדר" : null));

  useEffect(() => {
    if (!auth) {
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error("Auth state change error:", error);
        setError("אירעה שגיאה בטעינת המשתמש");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { user, loading, error };
}
