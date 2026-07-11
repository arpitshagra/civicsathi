// Shared fixed left navigation, styled with the Stitch design tokens.
// Reused by every authenticated page via <Layout/>.
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import logo from "../assets/civicsathi-logo.png";

// Sidebar navigation routes config list mapping paths, keys, and material icons
const NAV = [
  { to: "/dashboard", key: "dashboard", icon: "dashboard", end: true },
  { to: "/assistant", key: "assistant", icon: "smart_toy" },
  { to: "/schemes", key: "schemes", icon: "search_check" },
  { to: "/checklist", key: "checklist", icon: "checklist" },
  { to: "/simplify", key: "simplify", icon: "summarize" },
  { to: "/complaint", key: "complaint", icon: "account_balance" },
];

// Tailwind-equivalent CSS classes for navigation link selections
const baseLink =
  "flex items-center gap-3 rounded-lg px-4 py-3 font-label-md text-label-md transition-all";
const active = "bg-primary-container text-on-primary-container font-semibold";
const idle = "text-on-surface-variant hover:bg-surface-container-high";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { language, changeLanguage, t } = useLanguage();

  return (
    <nav className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-surface-container-low shadow-md z-40 border-r border-outline-variant/30 p-4">
      {/* Brand */}
      <div className="mb-8 flex items-center gap-3 px-2">
        <img src={logo} alt="CivicSathi AI logo" className="w-10 h-10 object-contain" />
        <div>
          <h1 className="font-headline-md text-headline-md font-bold text-primary">CivicSathi</h1>
          <p className="font-label-sm text-label-sm text-on-surface-variant">{t("administrativeAI")}</p>
        </div>
      </div>

      {/* Nav links mapping block */}
      <div className="flex-1 flex flex-col gap-2">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `${baseLink} ${isActive ? active : idle}`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {t(item.key)}
          </NavLink>
        ))}
      </div>

      {/* Footer: language toggle + profile + logout */}
      <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-outline-variant/30">
        {/* Language toggle — sets AI response language (English / Hindi) */}
        <div className="flex items-center gap-1 rounded-lg bg-surface-container-high p-1">
          {[
            { code: "en", label: "EN" },
            { code: "hi", label: "हिं" },
          ].map((opt) => (
            <button
              key={opt.code}
              onClick={() => changeLanguage(opt.code)}
              className={`flex-1 rounded-md px-2 py-1 font-label-md text-label-md transition-all ${
                language === opt.code
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container-highest"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <NavLink
          to="/profile"
          className={({ isActive }) => `${baseLink} ${isActive ? active : idle} py-2`}
        >
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full object-cover" />
          ) : (
            <span className="material-symbols-outlined">account_circle</span>
          )}
          <span className="truncate">{user?.displayName || t("profile")}</span>
        </NavLink>
        <button
          onClick={logout}
          className={`${baseLink} ${idle} py-2 w-full text-left`}
        >
          <span className="material-symbols-outlined">logout</span>
          {t("logout")}
        </button>
      </div>
    </nav>
  );
}
