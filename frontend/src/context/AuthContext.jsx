// Authentication context: holds the Firebase user and exposes login/logout
// plus a getToken() helper used by the API client to attach the Bearer token.
import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { ProfileAPI } from "../lib/endpoints";

// Instantiate the React context wrapper
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchProfile = async (currentUser) => {
    if (!currentUser) {
      setProfile(null);
      return;
    }
    setProfileLoading(true);
    try {
      const data = await ProfileAPI.get();
      setProfile(data);
    } catch (err) {
      console.error("Failed to fetch profile in context:", err);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    // Subscribes to Firebase's auth state change broadcast feed on mount.
    // Automatically triggers when a user logs in, logs out, or refreshes token credentials.
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        await fetchProfile(u);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    // Unsubscribe listener when root components unmount.
    return unsub;
  }, []);

  // Launches Google Single Sign-On pop-up authentication window.
  const login = () => signInWithPopup(auth, googleProvider);

  // Bypasses Firebase OAuth popup by setting a mock client user in local dev.
  const devLogin = () => {
    const mockUser = {
      uid: "dev-user",
      email: "dev@civicsathi.local",
      displayName: "Development User",
      photoURL: null,
      getIdToken: async () => "mock-dev-token",
    };
    setUser(mockUser);
    setProfile({
      uid: "dev-user",
      email: "dev@civicsathi.local",
      displayName: "Development User",
    });
  };
  
  // Terminates the active Firebase session.
  const logout = () => signOut(auth);

  // Returns a fresh Firebase ID token (auto-refreshes behind the scenes) or null when signed out.
  const getToken = async () => {
    if (user && user.uid === "dev-user") return "mock-dev-token";
    if (!auth.currentUser) return null;
    return auth.currentUser.getIdToken();
  };

  const refreshProfile = () => fetchProfile(auth.currentUser);

  return (
    <AuthContext.Provider value={{ user, profile, loading, profileLoading, login, devLogin, logout, getToken, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  // Custom context accessor hook.
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
