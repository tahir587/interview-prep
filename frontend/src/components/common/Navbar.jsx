import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMobileOpen(false);
  };

  const links = [
    { path: "/dashboard", label: "Dashboard",    icon: "🏠" },
    { path: "/dsa",       label: "DSA Practice", icon: "💻" },
    { path: "/interview", label: "Mock Interview",icon: "🤖" },
    { path: "/subjects",  label: "CS Subjects",  icon: "📚" },
    { path: "/progress",  label: "Progress",     icon: "📊" },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <Link to="/" style={{ textDecoration: "none" }}>
        <div className="sidebar-logo">
          <span style={{
            width: 32, height: 32, borderRadius: 9, flexShrink: 0,
            background: "linear-gradient(135deg,#6366f1,#8b5cf6,#06b6d4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1rem", boxShadow: "0 0 16px rgba(99,102,241,0.45)",
          }}>🎯</span>
          <span>Interview<span style={{ color: "#818cf8" }}>Prep</span></span>
        </div>
      </Link>

      {/* Nav section label */}
      <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--c-dim)", padding: "4px 10px 8px", marginTop: 4 }}>
        Navigation
      </div>

      {/* Nav links */}
      <nav className="sidebar-nav">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            onClick={() => setMobileOpen(false)}
            className={`nav-item ${isActive(link.path) ? "active" : ""}`}
          >
            <span className="nav-icon">{link.icon}</span>
            <span>{link.label}</span>
            {isActive(link.path) && (
              <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "#818cf8", flexShrink: 0 }} />
            )}
          </Link>
        ))}

        {user?.role === "admin" && (
          <>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--c-dim)", padding: "12px 10px 6px", marginTop: 4 }}>
              Admin
            </div>
            <Link
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className={`nav-item ${isActive("/admin") ? "active" : ""}`}
            >
              <span className="nav-icon">⚙️</span>
              <span>Admin Panel</span>
            </Link>
          </>
        )}
      </nav>

      {/* User section */}
      <div className="sidebar-user">
        <Link to="/profile" className="sidebar-user-card" onClick={() => setMobileOpen(false)}>
          <div className="avatar">{user?.name?.charAt(0)?.toUpperCase() || "?"}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--c-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.name}
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--c-muted)", textTransform: "capitalize" }}>
              {user?.role || "user"} · View Profile
            </div>
          </div>
        </Link>

        <button onClick={handleLogout} className="logout-btn">
          ← Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar hidden lg:flex flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Top Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4"
        style={{
          height: 58,
          background: "rgba(7,8,15,0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(99,102,241,0.15)",
        }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <span style={{
            width: 28, height: 28, borderRadius: 8,
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.85rem",
          }}>🎯</span>
          <span style={{ fontWeight: 800, fontSize: "1rem", color: "#e8edf5", fontFamily: "Outfit,sans-serif" }}>
            Interview<span style={{ color: "#818cf8" }}>Prep</span>
          </span>
        </Link>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            width: 38, height: 38, borderRadius: 8, border: "1px solid rgba(99,102,241,0.2)",
            background: "var(--c-bg3)", color: "var(--c-muted)", cursor: "pointer",
            display: "flex", flexDirection: "column", gap: 4,
            alignItems: "center", justifyContent: "center",
          }}
        >
          {[0,1,2].map(i => (
            <span key={i} style={{
              display: "block", width: 18, height: 2,
              background: mobileOpen ? (i === 1 ? "transparent" : "#818cf8") : "#7e90ad",
              borderRadius: 1,
              transform: mobileOpen ? (i === 0 ? "rotate(45deg) translate(4px,4px)" : i === 2 ? "rotate(-45deg) translate(4px,-4px)" : "") : "",
              transition: "all 0.3s",
            }} />
          ))}
        </button>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setMobileOpen(false)}
        >
          <aside
            onClick={e => e.stopPropagation()}
            style={{
              position: "absolute", top: 58, left: 0, bottom: 0,
              width: 260,
              background: "var(--c-bg2)",
              borderRight: "1px solid var(--c-border)",
              display: "flex", flexDirection: "column",
              padding: "16px 12px",
              overflowY: "auto",
            }}
          >
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Mobile top offset */}
      <div className="lg:hidden h-14.5" />
    </>
  );
};

export default Navbar;