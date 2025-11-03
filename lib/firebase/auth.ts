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
        photoURL: user.photoURL || "https://lh3.googleusercontent.com/a/default-user",
        subscriptionTier: "free" as const,
        createdAt: serverTimestamp(),
      };

      console.log("Creating new user document with data:", newUserData);

      try {
        await setDoc(userDocRef, newUserData);
        console.log("User document created successfully");
      } catch (createError) {
        console.error("Failed to create user document:", createError);
        throw createError;
      }
    }

    try {
      const idToken = await user.getIdToken();
      await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });
    } catch (sessionError) {
      console.error("Error creating session cookie:", sessionError);
    }

    return { user, error: null };
  } catch (error) {
    console.error("Error signing in with Google:", error);
    return { user: null, error: "אירעה שגיאה בהתחברות עם גוגל" };
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
        let responseBody;
        try {
          responseBody = await response.json();
        } catch {
          responseBody = await response.text();
        }
        console.error("Session deletion failed:", {
          status: response.status,
          statusText: response.statusText,
          body: responseBody,
        });
      }
    } catch (sessionError) {
      sessionDeletionFailed = true;
      console.error("Session deletion request failed:", {
        error: sessionError,
        message:
          sessionError instanceof Error
            ? sessionError.message
            : "Unknown error",
        stack: sessionError instanceof Error ? sessionError.stack : undefined,
      });
    }

    await firebaseSignOut(auth);
    return { error: null, sessionDeletionFailed };
  } catch (error) {
    console.error("Error signing out:", error);
    return { error: "אירעה שגיאה בהתנתקות", sessionDeletionFailed };
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => !!auth);
  const [error, setError] = useState<string | null>(() =>
    !auth ? "Firebase לא מוגדר" : null
  );

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
