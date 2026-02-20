import { useState, useEffect } from "react";
import { getMyExams } from "../api/index";

export default function MyExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    getMyExams().then(setExams).catch(console.error).finally(() => setLoading(false));
  }, []);

  function copyId(id) {
    navigator.clipboard.writeText(id);
    setCopied(id); setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">My Exams</div>
        <div className="page-sub">All exams you have published</div>
      </div>
      {loading ? <div className="loading"><span className="spinner" /> Loading…</div> : exams.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <div className="empty-text">No exams yet</div>
          <div className="empty-sub">Go to Create Exam to publish your first exam</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {exams.map(exam => (
            <div key={exam._id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px 24px", display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0, background: "linear-gradient(135deg,#7c6af7,#e879f9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📝</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{exam.title}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>{exam.course?.title} • {exam.questions?.length} questions</div>
                <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 14px", display: "flex", alignItems: "center", gap: 12, maxWidth: 480 }}>
                  <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, flexShrink: 0 }}>EXAM ID</span>
                  <code style={{ flex: 1, fontSize: 12, color: "var(--accent)", wordBreak: "break-all" }}>{exam._id}</code>
                  <button className={`btn btn-sm ${copied === exam._id ? "btn-success" : "btn-outline"}`} onClick={() => copyId(exam._id)}>
                    {copied === exam._id ? "✓ Copied!" : "Copy"}
                  </button>
                </div>
              </div>
              <div style={{ textAlign: "center", flexShrink: 0, background: "var(--surface2)", borderRadius: 10, padding: "10px 16px", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>Questions</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "var(--accent)" }}>{exam.questions?.length}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
