import { useState, useEffect } from "react";
import { getMyCourses } from "../api/index";

export default function MyCourses({ onWatchLessons, onGoExam }) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyCourses()
      .then(setEnrollments)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><span className="spinner" /> Loading your courses…</div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">My Courses</div>
        <div className="page-sub">Watch lessons or take exams for your enrolled courses</div>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      {enrollments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <div className="empty-text">No courses yet</div>
          <div className="empty-sub">Browse the catalog and enroll in a course</div>
        </div>
      ) : enrollments.map(e => {
        const course = e.course;
        if (!course?._id) return null;
        return (
          <div className="enrolled-card" key={e._id}>
            <div style={{ width: 52, height: 52, borderRadius: 12, flexShrink: 0, background: "linear-gradient(135deg,#7c6af7,#e879f9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📖</div>
            <div className="enrolled-info">
              <div className="enrolled-title">{course.title}</div>
              <div className="enrolled-cat">{course.category} • by {course.instructor?.name || "Instructor"}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="progress-bar" style={{ flex: 1 }}><div className="progress-fill" style={{ width: `${e.progress || 0}%` }} /></div>
                <span style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600, minWidth: 36 }}>{e.progress || 0}%</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
              <button className="btn btn-primary btn-sm" onClick={() => onWatchLessons(course)}>▶ Watch Lessons</button>
              <button className="btn btn-outline btn-sm" onClick={() => onGoExam(course)}>📝 Take Exam</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
