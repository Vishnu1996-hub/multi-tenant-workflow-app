import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { TenantSelector } from "./TenantSelector";

export function AppShell() {
  const { user, currentTenant, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
console.log('Current tenant in AppShell:', currentTenant);
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Multi Tenant Workflow</h2>
          <small>{user?.fullName}</small>
        </div>
        <div className="tenant-selector">
          <TenantSelector />
        </div>
        {currentTenant && (
          <nav className="sidebar-nav">
            <NavLink
              to="/items"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Items
            </NavLink>
            <NavLink
              to="/requests"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Approvals
            </NavLink>
            <NavLink
              to="/workflows"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Workflows
            </NavLink>
            <NavLink
              to="/audit"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Audit Log
            </NavLink>
            {currentTenant.role === "admin" && (
              <NavLink
                to="/members"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Members
              </NavLink>
            )}
          </nav>
        )}
        <div className="sidebar-footer">
          <button onClick={handleLogout}>Sign Out</button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
