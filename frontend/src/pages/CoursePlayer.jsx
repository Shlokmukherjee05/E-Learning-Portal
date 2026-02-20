import { useState, useEffect, useRef } from "react";
import { getLessons } from "../api/index";

const BACKEND = "http://localhost:5000";

export default function CoursePlayer({ course, onBack, onGoExam }) {
  const [lessons, setLessons] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(new Set());
  const videoRef = useRef();

  useEffect(() => {
    if (!course?._id) return;
    getLessons(course._id).then(data => { setLessons(data); if (data.length > 0) setActive(data[0]); }).catch(console.error).finally(() => setLoading(false));
  }, [course?._id]);

  useEffect(() => { if (videoRef.current) videoRef.current.load(); }, [active]);

  const progress = lessons.length ? Math.round(done.size / lessons.length * 100) : 0;

  if (loading) return <div className="loading"><span className="spinner" /> Loading course…</div>;

  return (
    <div className="fade-in">
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <button className="btn btn-outline btn-sm" onClick={onBack}>← Back</button>
        <div>
          <div className="page-title" style={{ marginBottom: 2 }}>{course?.title}</div>
          <div className="page-sub">{course?.category} • by {course?.instructor?.name || "Instructor"}</div>
        </div>
      </div>

      {lessons.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎬</div>
          <div className="empty-text">No lessons yet</div>
          <div className="empty-sub">Your instructor hasn't uploaded lessons yet. Check back soon!</div>
        </div>
      ) : (
        <div className="player-grid" style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, alignItems: "start" }}>
          <div>
            <div style={{ background: "#000", borderRadius: "var(--radius)", overflow: "hidden", aspectRatio: "16/9", marginBottom: 16 }}>
              {active?.videoUrl
                ? <video ref={videoRef} controls style={{ width: "100%", height: "100%" }} onEnded={() => setDone(p => new Set([...p, active._id]))}><source src={`${BACKEND}${active.videoUrl}`} /></video>
                : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 48 }}>🎬</div>}
            </div>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{active?.title}</div>
                <button className={`btn btn-sm ${done.has(active?._id) ? "btn-success" : "btn-outline"}`} onClick={() => setDone(p => new Set([...p, active._id]))}>
                  {done.has(active?._id) ? "✓ Done" : "Mark Complete"}
                </button>
              </div>
              {active?.content && <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7 }}>{active.content}</p>}
              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                {lessons.indexOf(active) < lessons.length - 1
                  ? <button className="btn btn-primary btn-sm" onClick={() => { setDone(p => new Set([...p, active._id])); setActive(lessons[lessons.indexOf(active) + 1]); }}>Next Lesson →</button>
                  : <button className="btn btn-primary btn-sm" onClick={() => onGoExam(course)}>🏁 Take Final Exam →</button>}
              </div>
            </div>
          </div>

          <div className="player-playlist" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", position: "sticky", top: 80 }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                <span style={{ fontWeight: 600 }}>Progress</span>
                <span style={{ color: "var(--accent)", fontWeight: 700 }}>{progress}%</span>
              </div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{done.size}/{lessons.length} completed</div>
            </div>
            <div style={{ maxHeight: 460, overflowY: "auto" }}>
              {lessons.map((l, i) => {
                const isActive = active?._id === l._id;
                const isDone = done.has(l._id);
                return (
                  <div key={l._id} onClick={() => setActive(l)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", cursor: "pointer", borderBottom: "1px solid var(--border)", borderLeft: `3px solid ${isActive ? "var(--accent)" : "transparent"}`, background: isActive ? "rgba(124,106,247,0.08)" : "transparent" }}>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, background: isDone ? "rgba(52,211,153,0.15)" : isActive ? "rgba(124,106,247,0.2)" : "var(--surface2)", color: isDone ? "var(--success)" : isActive ? "var(--accent)" : "var(--muted)" }}>
                      {isDone ? "✓" : i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? "var(--accent)" : "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.title}</div>
                      {l.videoUrl && <div style={{ fontSize: 11, color: "var(--muted)" }}>▶ Video</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
