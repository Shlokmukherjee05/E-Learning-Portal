import { useState } from "react";
import { createCourse } from "../api/index";

export default function CreateCourse() {
  const [form, setForm] = useState({ title: "", description: "", category: "", price: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const h = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  async function submit() {
    if (!form.title || !form.description || !form.category) return setMsg({ type: "error", text: "Please fill all required fields." });
    setLoading(true);
    try {
      await createCourse({ ...form, price: Number(form.price) || 0 });
      setMsg({ type: "success", text: "✅ Course created!" });
      setForm({ title: "", description: "", category: "", price: "" });
    } catch (err) { setMsg({ type: "error", text: err.message }); }
    finally { setLoading(false); setTimeout(() => setMsg({ type: "", text: "" }), 3000); }
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">Create Course</div>
        <div className="page-sub">Publish a new course for students</div>
      </div>
      {msg.text && <div className={`alert alert-${msg.type === "error" ? "error" : "success"}`}>{msg.text}</div>}
      <div className="create-form-card">
        <div className="form-group"><label className="form-label">Title *</label><input className="form-input" name="title" placeholder="Course title" value={form.title} onChange={h} /></div>
        <div className="form-group"><label className="form-label">Description *</label><textarea className="form-input" name="description" rows={3} placeholder="What will students learn?" value={form.description} onChange={h} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="form-group"><label className="form-label">Category *</label>
            <select className="form-input" name="category" value={form.category} onChange={h}>
              <option value="">Select…</option>
              {["Web Dev","Backend","Design","Data","DevOps","CS Fundamentals"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Price (₹)</label><input className="form-input" name="price" type="number" min="0" placeholder="0 = Free" value={form.price} onChange={h} /></div>
        </div>
        <button className="btn btn-primary" onClick={submit} disabled={loading}>
          {loading ? <><span className="spinner" /> Publishing…</> : "Publish Course →"}
        </button>
      </div>
    </div>
  );
}
