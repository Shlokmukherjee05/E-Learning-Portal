import { useState, useEffect } from "react";
import { getMyResults } from "../api/index";

export default function ResultsPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyResults().then(setResults).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">My Results</div>
        <div className="page-sub">Your exam history</div>
      </div>
      {loading ? <div className="loading"><span className="spinner" /> Loading…</div> : results.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏆</div>
          <div className="empty-text">No results yet</div>
          <div className="empty-sub">Take an exam to see results here</div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="table-wrapper"><table className="table">
            <thead><tr><th>Exam</th><th>Course</th><th>Score</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {results.map(r => (
                <tr key={r._id}>
                  <td style={{ fontWeight: 500 }}>{r.exam?.title || "—"}</td>
                  <td style={{ color: "var(--muted)" }}>{r.exam?.course?.title || "—"}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="progress-bar" style={{ width: 60 }}>
                        <div className="progress-fill" style={{ width: `${r.totalQuestions ? r.score / r.totalQuestions * 100 : 0}%` }} />
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 13, color: "var(--accent)" }}>{r.score}/{r.totalQuestions}</span>
                    </div>
                  </td>
                  <td><span className={`badge ${r.passed ? "badge-pass" : "badge-fail"}`}>{r.passed ? "✓ Pass" : "✗ Fail"}</span></td>
                  <td style={{ color: "var(--muted)", fontSize: 12 }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}
    </div>
  );
}
