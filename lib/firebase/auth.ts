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
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        createdAt: serverTimestamp(),
      });
    }

    // Create session cookie for server-side authentication
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
      // Continue even if session creation fails - client-side auth still works
    }

    return { user, error: null };
  } catch (error) {
    console.error("Error signing in with Google:", error);
    return { user: null, error: "אירעה שגיאה בהתחברות עם גוגל" };
  }
}

export async function signOut() {
  if (!auth) {
    return { error: "Firebase לא מוגדר" };
  }

  try {
    // Delete session cookie first
    try {
      await fetch("/api/auth/session", {
        method: "DELETE",
      });
    } catch (sessionError) {
      console.error("Error deleting session cookie:", sessionError);
      // Continue with sign out even if session deletion fails
    }

    await firebaseSignOut(auth);
    return { error: null };
  } catch (error) {
    console.error("Error signing out:", error);
    return { error: "אירעה שגיאה בהתנתקות" };
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
