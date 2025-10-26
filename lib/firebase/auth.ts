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
    await firebaseSignOut(auth);
    return { error: null };
  } catch (error) {
    console.error("Error signing out:", error);
    return { error: "אירעה שגיאה בהתנתקות" };
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      setError("Firebase לא מוגדר");
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
