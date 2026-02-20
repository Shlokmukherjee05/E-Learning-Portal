import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getAllCourses, enrollInCourse } from "../api/index";

const tagColor = c => ({ "Web Dev": "#6ee7b7", Backend: "#93c5fd", Design: "#f9a8d4", Data: "#fcd34d", DevOps: "#a5b4fc", "CS Fundamentals": "#86efac" }[c] || "#e5e7eb");

export default function CourseCatalog() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [enrolled, setEnrolled] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    getAllCourses().then(setCourses).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.category?.toLowerCase().includes(search.toLowerCase())
  );

  async function enroll(courseId) {
    if (enrolled.has(courseId)) return;
    setEnrollingId(courseId);
    try {
      await enrollInCourse(courseId);
      setEnrolled(p => new Set([...p, courseId]));
      setMsg("🎉 Enrolled!"); setTimeout(() => setMsg(""), 2500);
    } catch (err) {
      setMsg(err.message); setTimeout(() => setMsg(""), 3000);
    } finally { setEnrollingId(null); }
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">Course Catalog</div>
        <div className="page-sub">{courses.length} courses available</div>
      </div>
      {msg && <div className={`alert ${msg.startsWith("🎉") ? "alert-success" : "alert-error"}`}>{msg}</div>}
      <input className="form-input" style={{ maxWidth: 360, marginBottom: 24 }} placeholder="🔍 Search courses…" value={search} onChange={e => setSearch(e.target.value)} />
      {loading ? <div className="loading"><span className="spinner" /> Loading courses…</div> : (
        <div className="card-grid">
          {filtered.map(c => (
            <div className="course-card" key={c._id}>
              <div className="course-card-banner" />
              <div className="course-card-body">
                <div className="course-tag" style={{ background: tagColor(c.category) }}>{c.category}</div>
                <div className="course-title">{c.title}</div>
                <div className="course-desc">{c.description}</div>
                <div className="course-footer">
                  <div>
                    <div className={`course-price${c.price === 0 ? " free" : ""}`}>{c.price === 0 ? "Free" : `₹${c.price}`}</div>
                    <div className="course-instructor">by {c.instructor?.name || "Instructor"}</div>
                  </div>
                  {user?.role === "student" && (
                    <button
                      className={`btn btn-sm ${enrolled.has(c._id) ? "btn-success" : "btn-primary"}`}
                      onClick={() => enroll(c._id)}
                      disabled={enrollingId === c._id || enrolled.has(c._id)}
                    >
                      {enrollingId === c._id ? <span className="spinner" /> : enrolled.has(c._id) ? "✓ Enrolled" : "Enroll"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
