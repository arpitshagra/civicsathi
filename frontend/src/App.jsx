// Router. Public: /landing, /login. Protected pages share <Layout/> (Sidebar).
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
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

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/landing" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* Protected (shared Sidebar layout) */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/assistant" element={<Assistant />} />
            <Route path="/schemes" element={<SchemeFinder />} />
            <Route path="/checklist" element={<Checklist />} />
            <Route path="/simplify" element={<Simplifier />} />
            <Route path="/complaint" element={<Complaint />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
