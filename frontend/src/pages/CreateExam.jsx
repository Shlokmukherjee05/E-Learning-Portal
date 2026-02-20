import { useState, useEffect } from "react";
import { createExam, getAllCourses } from "../api/index";

const emptyQ = () => ({ questionText: "", options: ["", "", "", ""], correctAnswer: 0 });

export default function CreateExam() {
  const [form, setForm] = useState({ title: "", courseId: "", questions: [emptyQ()] });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(null);
  const [copied, setCopied] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => { getAllCourses().then(setCourses).catch(console.error); }, []);

  const addQ = () => setForm(p => ({ ...p, questions: [...p.questions, emptyQ()] }));
  const removeQ = i => setForm(p => ({ ...p, questions: p.questions.filter((_, idx) => idx !== i) }));
  const updateQ = (i, field, val) => setForm(p => { const qs = [...p.questions]; qs[i] = { ...qs[i], [field]: val }; return { ...p, questions: qs }; });
  const updateOpt = (qi, oi, val) => setForm(p => { const qs = [...p.questions]; const opts = [...qs[qi].options]; opts[oi] = val; qs[qi] = { ...qs[qi], options: opts }; return { ...p, questions: qs }; });

  async function submit() {
    if (!form.title || !form.courseId) return setMsg({ type: "error", text: "Title and course required." });
    if (form.questions.some(q => !q.questionText || q.options.some(o => !o))) return setMsg({ type: "error", text: "Fill all questions and options." });
    setLoading(true);
    try {
      const data = await createExam({ title: form.title, course: form.courseId, questions: form.questions });
      setCreated(data);
      setForm({ title: "", courseId: "", questions: [emptyQ()] });
      setMsg({ type: "", text: "" });
    } catch (err) { setMsg({ type: "error", text: err.message }); }
    finally { setLoading(false); }
  }

  function copyId() {
    navigator.clipboard.writeText(created._id);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">Create Exam</div>
        <div className="page-sub">Build a quiz for one of your courses</div>
      </div>

      {created && (
        <div style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.3)", borderRadius: "var(--radius)", padding: 24, marginBottom: 24 }}>
          <div style={{ fontWeight: 700, color: "var(--success)", marginBottom: 8 }}>✅ Exam published — "{created.title}"</div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>Students in this course can now take the exam directly from My Courses.</div>
          <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>EXAM ID</span>
            <code style={{ flex: 1, fontSize: 12, color: "var(--accent)", wordBreak: "break-all" }}>{created._id}</code>
            <button className={`btn btn-sm ${copied ? "btn-success" : "btn-outline"}`} onClick={copyId}>{copied ? "✓ Copied!" : "Copy"}</button>
          </div>
          <button className="btn btn-outline btn-sm" style={{ marginTop: 12 }} onClick={() => setCreated(null)}>+ Create Another</button>
        </div>
      )}

      {!created && (
        <div className="create-form-card" style={{ maxWidth: "100%" }}>
          {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 4 }}>
            <div className="form-group"><label className="form-label">Exam Title *</label><input className="form-input" placeholder="e.g. Midterm Quiz" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Course *</label>
              <select className="form-input" value={form.courseId} onChange={e => setForm(p => ({ ...p, courseId: e.target.value }))}>
                <option value="">Select course…</option>
                {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>
            </div>
          </div>
          <div className="divider" />
          {form.questions.map((q, qi) => (
            <div key={qi} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: "var(--accent)" }}>Question {qi + 1}</span>
                {form.questions.length > 1 && <button className="btn btn-sm btn-danger" onClick={() => removeQ(qi)}>Remove</button>}
              </div>
              <div className="form-group"><input className="form-input" placeholder="Question text…" value={q.questionText} onChange={e => updateQ(qi, "questionText", e.target.value)} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>
                {q.options.map((opt, oi) => (
                  <div key={oi} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="radio" name={`correct-${qi}`} checked={q.correctAnswer === oi} onChange={() => updateQ(qi, "correctAnswer", oi)} style={{ accentColor: "var(--accent)" }} />
                    <input className="form-input" style={{ fontSize: 12 }} placeholder={`Option ${oi + 1}`} value={opt} onChange={e => updateOpt(qi, oi, e.target.value)} />
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>● Select radio button next to the correct answer</div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn btn-outline btn-sm" onClick={addQ}>+ Add Question</button>
            <button className="btn btn-primary" onClick={submit} disabled={loading}>
              {loading ? <><span className="spinner" /> Publishing…</> : "Publish Exam →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
