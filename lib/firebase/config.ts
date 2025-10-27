import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo.appspot.com",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:000000000000:web:0000000000000000",
};

// Check if we have valid Firebase config
const hasValidConfig =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

// Only initialize Firebase if we have valid config and we're in the browser
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (typeof window !== "undefined" || hasValidConfig) {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  // Initialize services
  auth = getAuth(app);
  db = getFirestore(app);
}

// Export with non-null assertion for usage (will be null during SSR without config)
export { auth, db };
export default app;
