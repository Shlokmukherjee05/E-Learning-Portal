import { useState, useEffect, useCallback, Component } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthPage      from "./pages/AuthPage";
import Dashboard     from "./pages/Dashboard";
import CourseCatalog from "./pages/CourseCatalog";
import MyCourses     from "./pages/MyCourses";
import CoursePlayer  from "./pages/CoursePlayer";
import ExamPage      from "./pages/ExamPage";
import ResultsPage   from "./pages/ResultsPage";
import CreateCourse  from "./pages/CreateCourse";
import CreateExam    from "./pages/CreateExam";
import MyExams       from "./pages/MyExams";
import ManageLessons from "./pages/ManageLessons";
import Layout        from "./components/Layout";
import "./styles/global.css";

// ── URL <-> page mapping ──────────────────────────────────────────
const PATH_TO_PAGE = {
  "/":               "dashboard",
  "/dashboard":      "dashboard",
  "/login":          "login",
  "/signup":         "signup",
  "/register":       "signup",
  "/catalog":        "catalog",
  "/my-courses":     "mycourses",
  "/results":        "results",
  "/create-course":  "create-course",
  "/manage-lessons": "manage-lessons",
  "/create-exam":    "create-exam",
  "/my-exams":       "my-exams",
  "/player":         "player",
  "/exam":           "exam",
};

const PAGE_TO_PATH = {
  "dashboard":      "/dashboard",
  "login":          "/login",
  "signup":         "/signup",
  "catalog":        "/catalog",
  "mycourses":      "/my-courses",
  "results":        "/results",
  "create-course":  "/create-course",
  "manage-lessons": "/manage-lessons",
  "create-exam":    "/create-exam",
  "my-exams":       "/my-exams",
  "player":         "/player",
  "exam":           "/exam",
};

function getPageFromPath() {
  const p = window.location.pathname;
  if (p in PATH_TO_PAGE) return PATH_TO_PAGE[p];
  return "404"; // unknown path → 404
}

// ── 404 Page ──────────────────────────────────────────────────────
function NotFoundPage({ onGoHome }) {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#f0f0f8", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 96, fontWeight: 900, background: "linear-gradient(135deg,#7c6af7,#e879f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>404</div>
        <div style={{ fontSize: 22, fontWeight: 700, margin: "16px 0 8px" }}>Page Not Found</div>
        <div style={{ color: "#6b7280", fontSize: 14, marginBottom: 32 }}>
          The page <code style={{ background: "#1c1c2a", padding: "2px 8px", borderRadius: 6, color: "#a78bfa" }}>{window.location.pathname}</code> doesn't exist.
        </div>
        <button
          onClick={onGoHome}
          style={{ background: "linear-gradient(135deg,#7c6af7,#e879f9)", color: "white", border: "none", borderRadius: 10, padding: "12px 28px", cursor: "pointer", fontSize: 14, fontWeight: 600 }}
        >
          ← Go to Dashboard
        </button>
      </div>
    </div>
  );
}

// ── Error Boundary ────────────────────────────────────────────────
class ErrorBoundary extends Component {
  state = { err: null };
  static getDerivedStateFromError(e) { return { err: e.message }; }
  render() {
    if (this.state.err) return (
      <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#f0f0f8", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
        <div style={{ background: "#13131a", border: "1px solid #f87171", borderRadius: 14, padding: 40, maxWidth: 480, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Something went wrong</div>
          <div style={{ fontSize: 12, color: "#f87171", marginBottom: 24, fontFamily: "monospace", wordBreak: "break-all" }}>{this.state.err}</div>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }} style={{ background: "linear-gradient(135deg,#7c6af7,#e879f9)", color: "white", border: "none", borderRadius: 10, padding: "10px 24px", cursor: "pointer", fontSize: 13 }}>
            Clear data &amp; reload
          </button>
        </div>
      </div>
    );
    return this.props.children;
  }
}

// ── Main App ──────────────────────────────────────────────────────
function AppInner() {
  const { user } = useAuth();
  const [page, setPageState] = useState(getPageFromPath);
  const [course, setCourse] = useState(null);

  // Sync URL → page on browser back/forward
  useEffect(() => {
    const onPop = () => setPageState(getPageFromPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Navigate: push to history + update state
  const go = useCallback((p, c = null) => {
    const path = PAGE_TO_PATH[p] || "/dashboard";
    window.history.pushState({ page: p }, "", path);
    setPageState(p);
    setCourse(c);
  }, []);

  // After login → go to dashboard
  useEffect(() => {
    if (user && (page === "login" || page === "signup" || window.location.pathname === "/")) {
      window.history.replaceState({}, "", "/dashboard");
      setPageState("dashboard");
    }
  }, [user]);

  // After logout → go to /login
  useEffect(() => {
    if (!user && page !== "login" && page !== "signup" && page !== "404") {
      window.history.replaceState({}, "", "/login");
      setPageState("login");
    }
  }, [user]);

  // 404 — shown for logged-in AND logged-out users
  if (page === "404") {
    return <NotFoundPage onGoHome={() => go(user ? "dashboard" : "login")} />;
  }

  // Auth pages — accessible at /login and /signup even if not logged in
  if (!user) {
    return <AuthPage initialMode={page === "signup" ? "register" : "login"} onNavigate={go} />;
  }

  const render = () => {
    switch (page) {
      case "dashboard":      return <Dashboard />;
      case "catalog":        return <CourseCatalog />;
      case "mycourses":      return <MyCourses onWatchLessons={c => go("player", c)} onGoExam={c => go("exam", c)} />;
      case "player":         return <CoursePlayer course={course} onBack={() => go("mycourses")} onGoExam={c => go("exam", c)} />;
      case "exam":           return <ExamPage course={course} onBack={() => go("mycourses")} />;
      case "results":        return <ResultsPage />;
      case "create-course":  return <CreateCourse />;
      case "create-exam":    return <CreateExam />;
      case "my-exams":       return <MyExams />;
      case "manage-lessons": return <ManageLessons />;
      default:               return <Dashboard />;
    }
  };

  return (
    <Layout page={page} setPage={p => go(p)}>
      {render()}
    </Layout>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </ErrorBoundary>
  );
}
