// Authenticated layout: fixed Sidebar + main content area.
// Pages render only their inner content into the <Outlet/>.
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="bg-background text-on-background min-h-screen flex antialiased">
      <Sidebar />
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
