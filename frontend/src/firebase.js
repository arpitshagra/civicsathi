// Firebase client initialisation.
// Values come from VITE_FIREBASE_* env vars (loaded via Vite import.meta.env).
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Frontend Firebase configuration config object populated via build-time environments
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase client app instance
const app = initializeApp(firebaseConfig);

// Auth handle used for managing active user sessions
export const auth = getAuth(app);

// Provider instance used to execute Google Sign-In popups/redirects
export const googleProvider = new GoogleAuthProvider();
