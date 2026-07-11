// Router. Public: /, /landing, /login. Protected pages share <Layout/> (Sidebar).
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Assistant from "./pages/Assistant";
import SchemeFinder from "./pages/SchemeFinder";
import Checklist from "./pages/Checklist";
import Simplifier from "./pages/Simplifier";
import Complaint from "./pages/Complaint";
import Profile from "./pages/Profile";
import ProfileSetup from "./pages/ProfileSetup";
import CivicPath from "./pages/CivicPath";
import MissionDashboard from "./pages/MissionDashboard";

export default function App() {
  // App serves as the main shell, setting up context providers for language configurations,
  // Firebase authentication states, browser routers, and route-level protection middleware.
  return (
    <LanguageProvider>
      <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes — Accessible to anyone without a login token */}
          <Route path="/" element={<Landing />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes — Wires the <ProtectedRoute> gate to intercept calls.
              Shares the <Layout /> wrapper which renders the main sidebar navigation menu. */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/civicpath" element={<CivicPath />} />
            <Route path="/civicpath/mission/:id" element={<MissionDashboard />} />
            <Route path="/assistant" element={<Assistant />} />
            <Route path="/schemes" element={<SchemeFinder />} />
            <Route path="/checklist" element={<Checklist />} />
            <Route path="/simplify" element={<Simplifier />} />
            <Route path="/complaint" element={<Complaint />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Onboarding Wizard — Protected but without Sidebar Layout */}
          <Route
            path="/profile/setup"
            element={
              <ProtectedRoute>
                <ProfileSetup />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </LanguageProvider>
  );
}
