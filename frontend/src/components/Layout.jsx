// Authenticated layout: fixed Sidebar + main content area.
// Pages render only their inner content into the <Outlet/>.
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="bg-background text-on-background min-h-screen flex antialiased">
      {/* Sidebar is fixed on desktop left; uses md:ml-64 spacing below to offset main content */}
      <Sidebar />
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Child route components are rendered here dynamically */}
        <Outlet />
      </main>
    </div>
  );
}
