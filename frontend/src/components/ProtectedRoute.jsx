// Guards routes that require authentication.
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader label="Loading…" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
}
