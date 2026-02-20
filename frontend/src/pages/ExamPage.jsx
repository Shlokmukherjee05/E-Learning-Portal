import { useState, useEffect } from "react";
import { getExamByCourse, submitExam } from "../api/index";

export default function ExamPage({ course, onBack }) {
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!course?._id) { setError("No course selected."); setLoading(false); return; }
    setLoading(true); setExam(null); setAnswers({}); setResult(null); setError("");
    getExamByCourse(course._id)
      .then(setExam)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [course?._id]);

  async function handleSubmit() {
    setSubmitting(true); setError("");
    try {
      const answersArray = exam.questions.map((_, i) => answers[i] !== undefined ? answers[i] : -1);
      const data = await submitExam(exam._id, answersArray);
      setResult(data);
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  }

  const answered = Object.keys(answers).length;
  const total = exam?.questions?.length || 0;

  if (loading) return <div className="loading"><span className="spinner" /> Loading exam…</div>;

  if (!exam) return (
    <div className="fade-in">
      <button className="btn btn-outline btn-sm" onClick={onBack} style={{ marginBottom: 20 }}>← Back</button>
      <div className="empty-state">
        <div className="empty-icon">📭</div>
        <div className="empty-text">No exam available yet</div>
        <div className="empty-sub">{error || `No exam published for "${course?.title}" yet.`}</div>
        <button className="btn btn-outline" style={{ marginTop: 16 }} onClick={onBack}>← Back to My Courses</button>
      </div>
    </div>
  );

  if (result) return (
    <div className="fade-in" style={{ maxWidth: 480, margin: "0 auto", textAlign: "center", paddingTop: 48 }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{result.passed ? "🎉" : "😔"}</div>
      <div className="page-title" style={{ marginBottom: 4 }}>Exam Complete!</div>
      <div className="page-sub" style={{ marginBottom: 32 }}>{exam.title}</div>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        <div className="score-ring" style={{ borderColor: result.passed ? "var(--success)" : "var(--danger)", color: result.passed ? "var(--success)" : "var(--danger)" }}>
          {result.score}/{result.totalQuestions}
        </div>
      </div>
      <span className={`badge ${result.passed ? "badge-pass" : "badge-fail"}`} style={{ fontSize: 14, padding: "6px 20px", display: "inline-block", marginBottom: 12 }}>
        {result.passed ? "✓ Passed" : "✗ Failed"}
      </span>
      <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 28 }}>
        Score: {Math.round(result.score / result.totalQuestions * 100)}% — Pass mark: 50%
      </div>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        {!result.passed && <button className="btn btn-primary" onClick={() => { setAnswers({}); setResult(null); }}>🔄 Retry</button>}
        <button className="btn btn-outline" onClick={onBack}>← Back to My Courses</button>
      </div>
    </div>
  );

  return (
    <div className="fade-in">
      <button className="btn btn-outline btn-sm" onClick={onBack} style={{ marginBottom: 24 }}>← Back</button>
      <div className="page-header">
        <div className="page-title">{exam.title}</div>
        <div className="page-sub">{course?.title} • {total} questions • Pass: 50%</div>
      </div>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "14px 20px", marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
          <span>{answered} of {total} answered</span>
          <span style={{ color: "var(--accent)", fontWeight: 700 }}>{total > 0 ? Math.round(answered / total * 100) : 0}%</span>
        </div>
        <div className="progress-bar"><div className="progress-fill" style={{ width: `${total > 0 ? answered / total * 100 : 0}%` }} /></div>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      {exam.questions.map((q, qi) => (
        <div className="question-card" key={qi}>
          <div className="question-text">Q{qi + 1}. {q.questionText}</div>
          {q.options.map((opt, oi) => (
            <div key={oi} className={`option${answers[qi] === oi ? " selected" : ""}`} onClick={() => setAnswers(p => ({ ...p, [qi]: oi }))}>
              <div className="option-marker">{answers[qi] === oi ? "✓" : String.fromCharCode(65 + oi)}</div>
              {opt}
            </div>
          ))}
        </div>
      ))}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 8, paddingBottom: 40 }}>
        <button className="btn btn-primary" disabled={answered < total || submitting} onClick={handleSubmit}>
          {submitting ? <><span className="spinner" /> Submitting…</> : `Submit (${answered}/${total}) →`}
        </button>
        {answered < total && <span style={{ fontSize: 12, color: "var(--muted)" }}>{total - answered} remaining</span>}
      </div>
    </div>
  );
}
