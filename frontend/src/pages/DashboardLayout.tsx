import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FileText, LayoutGrid, LogOut, MessageSquare } from "lucide-react";
import Logo from "../components/Logo";
import { useAuth } from "../lib/useAuth";

const NAV = [
  { to: "/dashboard", label: "Home", icon: LayoutGrid, end: true },
  { to: "/dashboard/documents", label: "Documents", icon: FileText },
  { to: "/dashboard/assistant", label: "Assistant", icon: MessageSquare },
];

export default function DashboardLayout() {
  const { user, organization, logout } = useAuth();
  const navigate = useNavigate();
  const initials = (user?.name ?? "?").split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar__brand"><Logo /></div>

        <div className="org-chip">
          <span className="org-chip__avatar">{organization?.name[0]?.toUpperCase()}</span>
          <span className="org-chip__text">
            <span className="org-chip__name">{organization?.name}</span>
            <span className="org-chip__meta">Workspace</span>
          </span>
        </div>

        <nav className="nav">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav__item ${isActive ? "is-active" : ""}`}>
              <Icon size={17} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__user">
          <span className="avatar">{initials}</span>
          <span className="sidebar__who">
            <span className="sidebar__name">{user?.name}</span>
            <span className="sidebar__email">{user?.email}</span>
          </span>
          <button className="icon-btn" title="Sign out" aria-label="Sign out" onClick={async () => { await logout(); navigate("/login", { replace: true }); }}>
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
