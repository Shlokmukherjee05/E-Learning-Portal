import { useState, Component } from "react";
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

function AppInner() {
  const { user } = useAuth();
  const [page, setPage] = useState("dashboard");
  const [course, setCourse] = useState(null);

  if (!user) return <AuthPage />;

  const go = (p, c = null) => { setPage(p); setCourse(c); };

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
