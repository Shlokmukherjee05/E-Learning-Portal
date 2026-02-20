import { useState, useEffect, useRef } from "react";
import { getAllCourses, getLessons, addLesson, deleteLesson } from "../api/index";

const BACKEND = "http://localhost:5000";

export default function ManageLessons() {
  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [form, setForm] = useState({ title: "", content: "" });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);
  const videoRef = useRef(); const thumbRef = useRef();

  useEffect(() => { getAllCourses().then(setCourses).catch(console.error); }, []);

  function selectCourse(id) {
    const c = courses.find(c => c._id === id);
    setSelected(c || null); setLessons([]); resetForm();
    if (c) getLessons(c._id).then(setLessons).catch(console.error);
  }

  function resetForm() {
    setForm({ title: "", content: "" }); setVideoFile(null); setThumbFile(null);
    setVideoPreview(null); setThumbPreview(null); setShowForm(false);
    if (videoRef.current) videoRef.current.value = "";
    if (thumbRef.current) thumbRef.current.value = "";
  }

  function flash(type, text) { setMsg({ type, text }); setTimeout(() => setMsg({ type: "", text: "" }), 3000); }

  async function handleSave() {
    if (!form.title) return flash("error", "Lesson title is required.");
    if (!videoFile) return flash("error", "Please select a video file.");
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("content", form.content);
      fd.append("video", videoFile);
      if (thumbFile) fd.append("thumbnail", thumbFile);
      const data = await addLesson(selected._id, fd);
      setLessons(p => [...p, data.lesson]);
      resetForm(); flash("success", "✅ Lesson saved!");
    } catch (err) { flash("error", err.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(lessonId) {
    if (!window.confirm("Delete this lesson?")) return;
    setDeleting(lessonId);
    try {
      await deleteLesson(selected._id, lessonId);
      setLessons(p => p.filter(l => l._id !== lessonId));
      flash("success", "Lesson deleted.");
    } catch (err) { flash("error", err.message); }
    finally { setDeleting(null); }
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">Manage Lessons</div>
        <div className="page-sub">Upload videos and content to your courses</div>
      </div>
      {msg.text && <div className={`alert alert-${msg.type === "error" ? "error" : "success"}`}>{msg.text}</div>}

      <div className="form-group" style={{ maxWidth: 400, marginBottom: 28 }}>
        <label className="form-label">Select Course</label>
        <select className="form-input" value={selected?._id || ""} onChange={e => selectCourse(e.target.value)}>
          <option value="">Choose a course…</option>
          {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
        </select>
      </div>

      {selected && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontWeight: 700 }}>Lessons ({lessons.length})</div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>+ Add Lesson</button>
          </div>

          {lessons.length === 0 ? (
            <div className="empty-state" style={{ padding: "40px 20px" }}>
              <div className="empty-icon">🎬</div>
              <div className="empty-text">No lessons yet</div>
              <div className="empty-sub">Click "Add Lesson" to upload your first video</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              {lessons.map((lesson, i) => (
                <div key={lesson._id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 20, display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{ width: 100, height: 60, borderRadius: 8, overflow: "hidden", background: "var(--surface2)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {lesson.thumbnailUrl ? <img src={`${BACKEND}${lesson.thumbnailUrl}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 24 }}>🎬</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{i + 1}. {lesson.title}</div>
                    {lesson.content && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{lesson.content.slice(0, 80)}{lesson.content.length > 80 ? "…" : ""}</div>}
                    {lesson.videoUrl && <div style={{ fontSize: 11, color: "var(--accent)", marginTop: 4 }}>▶ Video uploaded</div>}
                  </div>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(lesson._id)} disabled={deleting === lesson._id}>
                    {deleting === lesson._id ? <span className="spinner" /> : "Delete"}
                  </button>
                </div>
              ))}
            </div>
          )}

          {showForm && (
            <div style={{ background: "var(--surface)", border: "1px solid var(--accent)", borderRadius: "var(--radius)", padding: 28, maxWidth: 640 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 20 }}>New Lesson</div>
              <div className="form-group"><label className="form-label">Title *</label><input className="form-input" placeholder="Lesson title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Notes</label><textarea className="form-input" rows={3} placeholder="What students will learn" value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} /></div>

              <div className="form-group">
                <label className="form-label">Video File * (mp4, webm — max 500MB)</label>
                <div style={{ border: "2px dashed var(--border)", borderRadius: 10, padding: 24, textAlign: "center", cursor: "pointer" }} onClick={() => videoRef.current?.click()}>
                  {videoPreview ? (
                    <div>
                      <video src={videoPreview} controls style={{ maxWidth: "100%", maxHeight: 180, borderRadius: 8, marginBottom: 8 }} />
                      <div style={{ fontSize: 12, color: "var(--success)" }}>✓ {videoFile.name}</div>
                    </div>
                  ) : <div style={{ color: "var(--muted)", fontSize: 13 }}>🎬 Click to select video</div>}
                </div>
                <input ref={videoRef} type="file" accept="video/*" style={{ display: "none" }} onChange={e => { const f = e.target.files[0]; if (f) { setVideoFile(f); setVideoPreview(URL.createObjectURL(f)); } }} />
              </div>

              <div className="form-group">
                <label className="form-label">Thumbnail (optional)</label>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{ width: 120, height: 72, borderRadius: 8, border: "2px dashed var(--border)", overflow: "hidden", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface2)" }} onClick={() => thumbRef.current?.click()}>
                    {thumbPreview ? <img src={thumbPreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 24 }}>🖼️</span>}
                  </div>
                  <button className="btn btn-outline btn-sm" onClick={() => thumbRef.current?.click()}>{thumbFile ? "Change" : "Upload Image"}</button>
                </div>
                <input ref={thumbRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files[0]; if (f) { setThumbFile(f); setThumbPreview(URL.createObjectURL(f)); } }} />
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? <><span className="spinner" /> Saving…</> : "Save Lesson →"}</button>
                <button className="btn btn-outline" onClick={resetForm} disabled={saving}>Cancel</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
