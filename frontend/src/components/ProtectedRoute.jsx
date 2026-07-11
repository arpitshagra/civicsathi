// Guards routes that require authentication.
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";

export default function ProtectedRoute({ children }) {
  // Pulls the auth loading state and user session state from AuthContext
  const { user, loading, profile } = useAuth();

  // If Firebase is resolving session metadata from local storage, block screen renders
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader label="Loading…" />
      </div>
    );
  }

  // If no user is logged in, redirect them to the sign-in page, replacing history path
  if (!user) return <Navigate to="/login" replace />;

  // Redirect to onboarding if profileCompletion is null (not set in Firestore)
  if (profile && profile.profileCompletion === null) {
    if (window.location.pathname !== "/profile/setup") {
      return <Navigate to="/profile/setup" replace />;
    }
  }

  // Render children sub-routes if authorized
  return children;
}
