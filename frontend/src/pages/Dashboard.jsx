// Dashboard — counts + recent items. GET /api/dashboard/summary
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { DashboardAPI } from "../lib/endpoints";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import ErrorBanner from "../components/ErrorBanner";

function formatWhen(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const QUICK_ACTIONS = [
  {
    to: "/assistant",
    icon: "smart_toy",
    title: "AI Assistant",
    subtitle: "General queries",
    iconWrap: "bg-primary-container/50",
    iconColor: "text-primary",
  },
  {
    to: "/schemes",
    icon: "search_check",
    title: "Scheme Finder",
    subtitle: "Check eligibility",
    iconWrap: "bg-tertiary-container/20",
    iconColor: "text-tertiary",
  },
  {
    to: "/checklist",
    icon: "checklist",
    title: "Doc Checklist",
    subtitle: "Prepare files",
    iconWrap: "bg-secondary-container/30",
    iconColor: "text-secondary",
  },
  {
    to: "/complaint",
    icon: "campaign",
    title: "Complaint Gen",
    subtitle: "Draft letters",
    iconWrap: "bg-error-container/50",
    iconColor: "text-error",
  },
  {
    to: "/simplify",
    icon: "summarize",
    title: "Notification Simp",
    subtitle: "Decode notices",
    iconWrap: "bg-surface-variant",
    iconColor: "text-on-surface",
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, loading, error, run } = useApi(DashboardAPI.summary);
  const [query, setQuery] = useState("");

  useEffect(() => {
    run();
  }, [run]);

  const counts = data?.counts || {};
  const recentChats = data?.recentChats || [];
  const recentComplaints = data?.recentComplaints || [];

  const handleSearch = (e) => {
    e.preventDefault();
    navigate("/assistant");
  };

  const greetingName = user?.displayName ? `, ${user.displayName}` : "";

  return (
    <>
      {/* TopNavBar / greeting header */}
      <header className="bg-surface/80 dark:bg-surface-container/80 backdrop-blur-xl shadow-sm sticky top-0 w-full z-30 flex justify-between items-center px-6 py-3 w-full max-w-7xl mx-auto border-b border-outline-variant/20 md:border-none">
        <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md">
          <span className="material-symbols-outlined">wb_sunny</span>
          <span>Good morning{greetingName}</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-on-surface-variant dark:text-outline-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container-high">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="text-on-surface-variant dark:text-outline-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container-high">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-secondary-container overflow-hidden border border-outline-variant/30 flex items-center justify-center text-on-secondary-container font-semibold">
            {user?.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
          </div>
        </div>
      </header>

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col gap-xl">
        {/* AI Search / Greeting Hero */}
        <section className="flex flex-col items-center justify-center text-center mt-lg mb-4">
          <h2 className="font-display-lg text-display-lg text-on-background mb-4">
            How can I assist you today?
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-8 max-w-2xl">
            Ask me anything about government schemes, required documents, or drafting an official complaint.
          </p>
          <div className="w-full max-w-3xl relative">
            <form
              onSubmit={handleSearch}
              className="glass-panel ambient-shadow rounded-full flex items-center p-2 pl-6 pr-3 focus-within:ring-2 ring-primary transition-all"
            >
              <span className="material-symbols-outlined text-outline mr-3">magic_button</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md text-on-background placeholder:text-outline-variant py-3 outline-none"
                placeholder="e.g. 'Am I eligible for PM-KISAN?' or 'Draft a letter to the municipal corporation...'"
                type="text"
              />
              <button
                type="submit"
                className="bg-primary text-on-primary rounded-full w-10 h-10 flex items-center justify-center hover:bg-primary/90 transition-colors flex-shrink-0"
              >
                <span className="material-symbols-outlined text-sm">arrow_upward</span>
              </button>
            </form>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="font-label-sm text-label-sm text-on-surface-variant py-1 px-3 rounded-full bg-surface-container-high hover:bg-surface-container-highest cursor-pointer transition-colors border border-outline-variant/20">
                Find housing schemes
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant py-1 px-3 rounded-full bg-surface-container-high hover:bg-surface-container-highest cursor-pointer transition-colors border border-outline-variant/20">
                Aadhar update checklist
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant py-1 px-3 rounded-full bg-surface-container-high hover:bg-surface-container-highest cursor-pointer transition-colors border border-outline-variant/20">
                Write water grievance
              </span>
            </div>
          </div>
        </section>

        {loading && (
          <div className="flex justify-center">
            <Loader label="Loading dashboard…" />
          </div>
        )}
        {error && <ErrorBanner message={error} />}

        {/* Quick Actions Grid */}
        <section>
          <h3 className="font-headline-md text-headline-md text-on-background mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="glass-panel rounded-xl p-5 hover-scale flex flex-col gap-4 border border-outline-variant/30"
              >
                <div
                  className={`w-12 h-12 rounded-full ${action.iconWrap} flex items-center justify-center ${action.iconColor}`}
                >
                  <span className="material-symbols-outlined text-[24px]">{action.icon}</span>
                </div>
                <div>
                  <h4 className="font-label-md text-label-md font-semibold mb-1">{action.title}</h4>
                  <p className="font-label-sm text-label-sm text-on-surface-variant font-normal">
                    {action.subtitle}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Bottom Row: Stats & History (Bento layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-lg">
          {/* Stats Bento */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="glass-panel rounded-xl p-6 ambient-shadow border border-outline-variant/30 h-full flex flex-col">
              <h3 className="font-label-md text-label-md text-on-surface-variant mb-6 uppercase tracking-wider font-semibold">
                Your Activity
              </h3>
              <div className="grid grid-cols-2 gap-4 flex-1">
                <div className="bg-surface-container-lowest rounded-lg p-4 border border-outline-variant/20 flex flex-col justify-center">
                  <span className="font-display-lg text-display-lg text-primary mb-1">
                    {counts.chats ?? 0}
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Total Chats</span>
                </div>
                <div className="bg-surface-container-lowest rounded-lg p-4 border border-outline-variant/20 flex flex-col justify-center">
                  <span className="font-display-lg text-display-lg text-tertiary mb-1">
                    {counts.savedSchemes ?? 0}
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Saved Schemes</span>
                </div>
                <div className="bg-surface-container-lowest rounded-lg p-4 border border-outline-variant/20 flex flex-col justify-center">
                  <span className="font-display-lg text-display-lg text-secondary mb-1">
                    {counts.savedChecklists ?? 0}
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Checklists</span>
                </div>
                <div className="bg-surface-container-lowest rounded-lg p-4 border border-outline-variant/20 flex flex-col justify-center">
                  <span className="font-display-lg text-display-lg text-error mb-1">
                    {counts.complaints ?? 0}
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Complaints</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent History Bento */}
          <div className="lg:col-span-2 glass-panel rounded-xl p-0 ambient-shadow border border-outline-variant/30 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-lowest/50">
              <h3 className="font-headline-md text-headline-md text-on-background">Recent Activity</h3>
              <Link to="/assistant" className="text-primary font-label-md text-label-md hover:underline">
                View All
              </Link>
            </div>
            <div className="flex flex-col flex-1 divide-y divide-outline-variant/20">
              {recentChats.length === 0 && recentComplaints.length === 0 ? (
                <div className="p-6 font-body-md text-body-md text-on-surface-variant">Nothing yet.</div>
              ) : (
                <>
                  {recentChats.map((chat) => (
                    <Link
                      key={chat.chatId}
                      to="/assistant"
                      className="p-4 px-6 hover:bg-surface-container-lowest/80 transition-colors flex items-start gap-4 cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary-container/30 flex items-center justify-center text-primary shrink-0 mt-1">
                        <span className="material-symbols-outlined text-[20px]">chat</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-body-md text-body-md font-medium text-on-background mb-1 line-clamp-1">
                          {chat.title || "Untitled chat"}
                        </h4>
                        <p className="font-body-md text-body-md text-on-surface-variant text-sm line-clamp-1">
                          AI conversation
                        </p>
                      </div>
                      <span className="font-label-sm text-label-sm text-outline whitespace-nowrap">
                        {formatWhen(chat.updatedAt)}
                      </span>
                    </Link>
                  ))}
                  {recentComplaints.map((complaint) => (
                    <Link
                      key={complaint.id}
                      to="/complaint"
                      className="p-4 px-6 hover:bg-surface-container-lowest/80 transition-colors flex items-start gap-4 cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-error-container/30 flex items-center justify-center text-error shrink-0 mt-1">
                        <span className="material-symbols-outlined text-[20px]">edit_document</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-body-md text-body-md font-medium text-on-background mb-1 line-clamp-1">
                          {complaint.title || "Untitled complaint"}
                        </h4>
                        <p className="font-body-md text-body-md text-on-surface-variant text-sm line-clamp-1">
                          {complaint.status || "Draft"}
                        </p>
                      </div>
                      <span className="font-label-sm text-label-sm text-outline whitespace-nowrap">
                        {formatWhen(complaint.createdAt)}
                      </span>
                    </Link>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
