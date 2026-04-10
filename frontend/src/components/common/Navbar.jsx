import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const links = [
    { path: "/dashboard", label: "🏠 Dashboard" },
    { path: "/dsa", label: "💻 DSA Practice" },
    { path: "/interview", label: "🤖 Mock Interview" },
    { path: "/subjects", label: "📚 CS Subjects" },
    { path: "/progress", label: "📊 Progress" },
  ];

  return (
    <aside className="h-screen w-64 bg-linear-to-b from-indigo-600 to-purple-700 text-white flex flex-col justify-between shadow-xl">

      {/* LOGO */}
      <div>
        <Link to="/home" className="block text-2xl font-bold text-center py-6 border-b border-white/20 hover:bg-white/10 transition">
          🎯 InterviewPrep
        </Link>

        {/* NAV LINKS */}
        <nav className="flex flex-col mt-6 px-4 space-y-2">
          {links.map((link) => {
            const active = location.pathname.startsWith(link.path);

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-3 rounded-lg transition-all duration-200 font-medium
                ${
                  active
                    ? "bg-white text-indigo-700 shadow"
                    : "hover:bg-white/20"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {/* ADMIN LINK */}
          {user?.role === "admin" && (
            <Link
              to="/admin"
              className={`px-4 py-3 rounded-lg transition-all duration-200 font-medium
              ${
                location.pathname.startsWith("/admin")
                  ? "bg-white text-indigo-700 shadow"
                  : "hover:bg-white/20"
              }`}
            >
              ⚙️ Admin
            </Link>
          )}
        </nav>
      </div>

      {/* USER SECTION */}
      <div className="p-4 border-t border-white/20">

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-indigo-700 font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>

          <div className="text-sm">
            <p className="font-semibold">{user?.name}</p>
            <p className="text-white/70 text-xs">{user?.role}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 transition px-4 py-2 rounded-lg font-semibold"
        >
          Logout
        </button>

      </div>

    </aside>
  );
};

export default Navbar;