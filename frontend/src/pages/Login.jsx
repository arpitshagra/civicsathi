// Login screen (Stitch design) — Google sign-in via Firebase.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const handleLogin = async () => {
    setError(null);
    try {
      await login();
    } catch (e) {
      setError(e.message || "Authentication failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-margin-mobile md:p-margin-desktop bg-background text-on-background relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary-fixed-dim/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] rounded-full bg-secondary-fixed/20 blur-[80px] pointer-events-none" />

      <main className="w-full max-w-[440px] z-10">
        <div className="glass-card rounded-xl p-md md:p-lg flex flex-col items-center text-center space-y-md">
          {/* Brand */}
          <div className="mb-sm">
            <div className="w-[80px] h-[80px] mx-auto rounded-2xl bg-primary-container flex items-center justify-center text-primary text-3xl font-bold drop-shadow-sm">
              CS
            </div>
          </div>

          <div className="space-y-base w-full">
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
              Welcome to CivicSathi
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Administrative Elegance meets Digital Simplicity.
            </p>
          </div>

          {error && (
            <div className="w-full p-base bg-error-container text-on-error-container border border-error/20 rounded-lg text-left font-label-md text-label-md flex items-start gap-2">
              <span className="material-symbols-outlined text-[20px] text-error shrink-0">error</span>
              <span>{error}</span>
            </div>
          )}

          <div className="w-full pt-sm space-y-4">
            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-3 bg-surface border border-outline-variant hover:bg-surface-container-low hover:border-primary active:scale-[0.98] transition-all duration-200 rounded-lg py-3 px-4 shadow-sm text-on-surface font-label-md text-label-md"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>
          </div>

          <div className="pt-md w-full border-t border-outline-variant/30 mt-sm">
            <p className="font-label-sm text-label-sm text-on-surface-variant text-center">
              By continuing, you agree to our{" "}
              <a className="text-primary hover:underline underline-offset-2" href="#">Terms of Service</a> and{" "}
              <a className="text-primary hover:underline underline-offset-2" href="#">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
