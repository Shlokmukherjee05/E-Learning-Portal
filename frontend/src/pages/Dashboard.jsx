import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyCourses, getMyResults } from "../api/index";

export default function Dashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "student") { setLoading(false); return; }
    Promise.all([getMyCourses(), getMyResults()])
      .then(([e, r]) => { setEnrollments(e); setResults(r); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.role]);

  const passRate = results.length ? Math.round(results.filter(r => r.passed).length / results.length * 100) : 0;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">Hello, {user?.name?.split(" ")[0]} 👋</div>
        <div className="page-sub">Welcome to your learning dashboard</div>
      </div>
      {loading ? <div className="loading"><span className="spinner" /> Loading…</div> : (
        <>
          <div className="stat-grid">
            {[
              { icon: "📚", label: "Enrolled", value: enrollments.length, color: "#7c6af7" },
              { icon: "✅", label: "Exams Taken", value: results.length, color: "#e879f9" },
              { icon: "🏆", label: "Pass Rate", value: `${passRate}%`, color: "#34d399" },
              { icon: "🎓", label: "Role", value: user?.role, color: "#fbbf24" },
            ].map(s => (
              <div className="stat-card" key={s.label}>
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
          <div className="dash-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Continue Learning</div>
              {enrollments.length === 0
                ? <div style={{ color: "var(--muted)", fontSize: 13 }}>No enrolled courses yet.</div>
                : enrollments.slice(0, 4).map(e => (
                  <div key={e._id} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                      <span style={{ fontWeight: 500 }}>{e.course?.title}</span>
                      <span style={{ color: "var(--accent)", fontWeight: 600 }}>{e.progress || 0}%</span>
                    </div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${e.progress || 0}%` }} /></div>
                  </div>
                ))}
            </div>
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Recent Results</div>
              {results.length === 0
                ? <div style={{ color: "var(--muted)", fontSize: 13 }}>No exam results yet.</div>
                : results.slice(0, 4).map(r => (
                  <div key={r._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{r.exam?.title || "Exam"}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>{r.exam?.course?.title || ""}</div>
                    </div>
                    <span className={`badge ${r.passed ? "badge-pass" : "badge-fail"}`}>
                      {r.score}/{r.totalQuestions} {r.passed ? "✓" : "✗"}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
