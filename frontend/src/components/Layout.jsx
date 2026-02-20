import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function Layout({ page, setPage, children }) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const studentNav = [
    { id: "dashboard", label: "Dashboard", icon: "⚡" },
    { id: "catalog", label: "Course Catalog", icon: "🌐" },
    { id: "mycourses", label: "My Courses", icon: "📚" },
    { id: "results", label: "My Results", icon: "🏆" },
  ];

  const instructorNav = [
    { id: "dashboard", label: "Dashboard", icon: "⚡" },
    { id: "catalog", label: "All Courses", icon: "🌐" },
    { id: "create-course", label: "Create Course", icon: "➕" },
    { id: "manage-lessons", label: "Manage Lessons", icon: "🎬" },
    { id: "create-exam", label: "Create Exam", icon: "📝" },
    { id: "my-exams", label: "My Exams", icon: "🗂️" },
  ];

  const nav = user?.role === "instructor" ? instructorNav : studentNav;

  // Close sidebar on page change (mobile)
  useEffect(() => { setSidebarOpen(false); }, [page]);

  // Prevent body scroll when sidebar open on mobile
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  return (
    <div className="app">
      <header className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            className={"hamburger" + (sidebarOpen ? " open" : "")}
            onClick={() => setSidebarOpen(function(o){ return !o; })}
            aria-label="Toggle navigation"
          >
            <span /><span /><span />
          </button>
          <div className="logo">⚡E-Learning-portal</div>
        </div>
        <div className="topbar-right">
          <span className="role-badge">{user?.role}</span>
          <div className="avatar">{(user?.name || "U")[0].toUpperCase()}</div>
          <button className="btn btn-outline btn-sm" onClick={logout}>Sign out</button>
        </div>
      </header>

      <div
        className={"sidebar-overlay" + (sidebarOpen ? " visible" : "")}
        onClick={() => setSidebarOpen(false)}
      />

      <div className="main">
        <aside className={"sidebar" + (sidebarOpen ? " open" : "")}>
          <div className="nav-section">Navigation</div>
          {nav.map(function(n) { return (
            <div
              key={n.id}
              className={"nav-item" + (page === n.id ? " active" : "")}
              onClick={() => setPage(n.id)}
            >
              <span className="nav-icon">{n.icon}</span>{n.label}
            </div>
          ); })}
        </aside>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
