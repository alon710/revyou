"use client";

import {
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";
import { useState, useEffect } from "react";

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("https://www.googleapis.com/auth/userinfo.email");
googleProvider.addScope("https://www.googleapis.com/auth/userinfo.profile");

/**
 * Sign in with Google OAuth
 * Creates user document in Firestore if it doesn't exist
 */
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

    // Check if user document exists in Firestore
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    // Create user document if it doesn't exist
    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
        subscriptionTier: "free",
        stripeCustomerId: null,
        googleRefreshToken: null,
      });
    }

    return { user, error: null };
  } catch (error) {
    console.error("Error signing in with Google:", error);

    // Hebrew error messages
    let message = "אירעה שגיאה בהתחברות";

    if (error && typeof error === "object" && "code" in error) {
      const errorCode = error.code;
      if (errorCode === "auth/popup-closed-by-user") {
        message = "חלון ההתחברות נסגר";
      } else if (errorCode === "auth/cancelled-popup-request") {
        message = "בקשת ההתחברות בוטלה";
      } else if (errorCode === "auth/network-request-failed") {
        message = "בעיית רשת - נסה שוב";
      }
    }

    return { user: null, error: message };
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  if (!auth) {
    return { error: "Firebase לא מוגדר" };
  }

  try {
    await firebaseSignOut(auth);
    return { error: null };
  } catch (error) {
    console.error("Error signing out:", error);
    return { error: "אירעה שגיאה בהתנתקות" };
  }
}

/**
 * Custom hook to get the current auth state
 * Returns the current user, loading state, and error
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if auth is available
    if (!auth) {
      setLoading(false);
      setError("Firebase לא מוגדר");
      return;
    }

    // Subscribe to auth state changes
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

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  return { user, loading, error };
}
