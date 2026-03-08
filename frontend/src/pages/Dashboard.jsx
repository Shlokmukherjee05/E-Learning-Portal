import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyCourses, getMyResults, getInstructorEnrollmentStats, getInstructorExamStats } from "../api/index";

// ── Student Dashboard ─────────────────────────────────────────────
function StudentDashboard() {
  const [enrollments, setEnrollments] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyCourses(), getMyResults()])
      .then(([e, r]) => { setEnrollments(e); setResults(r); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const passRate = results.length ? Math.round(results.filter(r => r.passed).length / results.length * 100) : 0;

  if (loading) return <div className="loading"><span className="spinner" /> Loading…</div>;

  return (
    <>
      <div className="stat-grid">
        {[
          { icon: "📚", label: "Enrolled", value: enrollments.length, color: "#7c6af7" },
          { icon: "✅", label: "Exams Taken", value: results.length, color: "#e879f9" },
          { icon: "🏆", label: "Pass Rate", value: `${passRate}%`, color: "#34d399" },
          { icon: "🎓", label: "Role", value: "Student", color: "#fbbf24" },
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
  );
}

// ── Instructor Dashboard ──────────────────────────────────────────
function InstructorDashboard() {
  const [enrollStats, setEnrollStats] = useState(null);
  const [examStats, setExamStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("enrollments"); // "enrollments" | "exams"

  useEffect(() => {
    Promise.all([getInstructorEnrollmentStats(), getInstructorExamStats()])
      .then(([e, ex]) => { setEnrollStats(e); setExamStats(ex); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><span className="spinner" /> Loading dashboard…</div>;

  const passRate = examStats?.totalExamsTaken
    ? Math.round(examStats.results.filter(r => r.passed).length / examStats.totalExamsTaken * 100)
    : 0;

  return (
    <>
      {/* Stat cards */}
      <div className="stat-grid">
        {[
          { icon: "📚", label: "My Courses", value: enrollStats?.totalCourses ?? 0, color: "#7c6af7" },
          { icon: "👥", label: "Total Students", value: enrollStats?.totalEnrollments ?? 0, color: "#e879f9" },
          { icon: "📝", label: "Exams Taken", value: examStats?.totalExamsTaken ?? 0, color: "#34d399" },
          { icon: "🏆", label: "Pass Rate", value: `${passRate}%`, color: "#fbbf24" },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Per-course enrollment summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Students per Course</div>
          {enrollStats?.perCourse?.length === 0
            ? <div style={{ color: "var(--muted)", fontSize: 13 }}>No courses yet.</div>
            : enrollStats?.perCourse?.map(c => (
              <div key={c.courseId} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                  <span style={{ fontWeight: 500, flex: 1, marginRight: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</span>
                  <span style={{ color: "var(--accent)", fontWeight: 700, flexShrink: 0 }}>{c.count} student{c.count !== 1 ? "s" : ""}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: enrollStats.totalEnrollments > 0 ? `${c.count / enrollStats.totalEnrollments * 100}%` : "0%" }} />
                </div>
              </div>
            ))}
        </div>

        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Exam Submissions per Exam</div>
          {examStats?.perExam?.length === 0
            ? <div style={{ color: "var(--muted)", fontSize: 13 }}>No exams yet.</div>
            : examStats?.perExam?.map(ex => (
              <div key={ex.examId} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                  <span style={{ fontWeight: 500, flex: 1, marginRight: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ex.title}</span>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <span style={{ color: "#34d399", fontSize: 11, fontWeight: 600 }}>✓ {ex.passed}</span>
                    <span style={{ color: "#f87171", fontSize: 11, fontWeight: 600 }}>✗ {ex.failed}</span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: ex.count > 0 ? `${ex.passed / ex.count * 100}%` : "0%", background: "linear-gradient(90deg,#34d399,#059669)" }} />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Tabs: Student list / Exam submissions list */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", borderBottom: "1px solid var(--border)" }}>
          {[
            { key: "enrollments", label: `👥 Enrolled Students (${enrollStats?.totalEnrollments ?? 0})` },
            { key: "exams", label: `📝 Exam Submissions (${examStats?.totalExamsTaken ?? 0})` },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                flex: 1, padding: "14px 20px", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                background: activeTab === t.key ? "rgba(124,106,247,0.1)" : "transparent",
                color: activeTab === t.key ? "var(--accent)" : "var(--muted)",
                borderBottom: activeTab === t.key ? "2px solid var(--accent)" : "2px solid transparent",
                transition: "all 0.2s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "enrollments" && (
          <div className="table-wrapper">
            {enrollStats?.enrollments?.length === 0
              ? <div style={{ padding: 32, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>No students enrolled yet.</div>
              : <table className="table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Student</th>
                      <th>Email</th>
                      <th>Course</th>
                      <th>Enrolled On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollStats?.enrollments?.map((e, i) => (
                      <tr key={e._id}>
                        <td style={{ color: "var(--muted)", fontSize: 12 }}>{i + 1}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#7c6af7,#e879f9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white", flexShrink: 0 }}>
                              {(e.student?.name || "?")[0].toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 500 }}>{e.student?.name || "—"}</span>
                          </div>
                        </td>
                        <td style={{ color: "var(--muted)", fontSize: 12 }}>{e.student?.email || "—"}</td>
                        <td>
                          <span style={{ background: "rgba(124,106,247,0.1)", color: "var(--accent)", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500 }}>
                            {e.course?.title || "—"}
                          </span>
                        </td>
                        <td style={{ color: "var(--muted)", fontSize: 12 }}>
                          {e.enrolledAt ? new Date(e.enrolledAt).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            }
          </div>
        )}

        {activeTab === "exams" && (
          <div className="table-wrapper">
            {examStats?.results?.length === 0
              ? <div style={{ padding: 32, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>No exam submissions yet.</div>
              : <table className="table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Student</th>
                      <th>Email</th>
                      <th>Exam</th>
                      <th>Course</th>
                      <th>Score</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examStats?.results?.map((r, i) => (
                      <tr key={r._id}>
                        <td style={{ color: "var(--muted)", fontSize: 12 }}>{i + 1}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#e879f9,#7c6af7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white", flexShrink: 0 }}>
                              {(r.student?.name || "?")[0].toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 500 }}>{r.student?.name || "—"}</span>
                          </div>
                        </td>
                        <td style={{ color: "var(--muted)", fontSize: 12 }}>{r.student?.email || "—"}</td>
                        <td style={{ fontWeight: 500 }}>{r.exam?.title || "—"}</td>
                        <td style={{ color: "var(--muted)", fontSize: 12 }}>{r.exam?.course?.title || "—"}</td>
                        <td>
                          <span style={{ fontWeight: 700, color: "var(--accent)" }}>{r.score}/{r.totalQuestions}</span>
                          <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: 4 }}>({r.totalQuestions ? Math.round(r.score / r.totalQuestions * 100) : 0}%)</span>
                        </td>
                        <td>
                          <span className={`badge ${r.passed ? "badge-pass" : "badge-fail"}`}>
                            {r.passed ? "✓ Pass" : "✗ Fail"}
                          </span>
                        </td>
                        <td style={{ color: "var(--muted)", fontSize: 12 }}>
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            }
          </div>
        )}
      </div>
    </>
  );
}

// ── Root Dashboard ────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">Hello, {user?.name?.split(" ")[0]} 👋</div>
        <div className="page-sub">
          {user?.role === "instructor" ? "Here's how your courses are performing" : "Welcome to your learning dashboard"}
        </div>
      </div>
      {user?.role === "instructor" ? <InstructorDashboard /> : <StudentDashboard />}
    </div>
  );
}
