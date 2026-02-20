import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { loginUser, registerUser } from "../api/index";

export default function AuthPage() {
  const { login } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const h = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  async function submit() {
    setError("");
    if (!form.email || !form.password) return setError("Email and password are required.");
    if (mode === "register" && !form.name) return setError("Name is required.");
    setLoading(true);
    try {
      const data = mode === "login"
        ? await loginUser(form.email, form.password)
        : await registerUser(form.name, form.email, form.password, form.role);
      if (!data.token || !data.user) throw new Error("Invalid server response.");
      login(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card">
        <div className="logo" style={{ fontSize: 24, marginBottom: 20 }}>⚡E-Learning-Portal</div>
        <div className="auth-title">{mode === "login" ? "Welcome back" : "Create account"}</div>
        <div className="auth-sub">{mode === "login" ? "Sign in to continue" : "Join thousands of learners"}</div>

        {error && <div className="alert alert-error">{error}</div>}

        {mode === "register" && (
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" name="name" placeholder="Your name" value={form.name} onChange={h} />
          </div>
        )}
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" name="email" type="email" placeholder="you@email.com" value={form.email} onChange={h} onKeyDown={e => e.key === "Enter" && submit()} />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" name="password" type="password" placeholder="••••••••" value={form.password} onChange={h} onKeyDown={e => e.key === "Enter" && submit()} />
        </div>
        {mode === "register" && (
          <div className="form-group">
            <label className="form-label">I am a...</label>
            <div className="radio-group">
              {["student", "instructor"].map(r => (
                <div key={r} className={`radio-option${form.role === r ? " selected" : ""}`} onClick={() => setForm(p => ({ ...p, role: r }))}>
                  {r === "student" ? "🎓" : "🧑‍🏫"} {r.charAt(0).toUpperCase() + r.slice(1)}
                </div>
              ))}
            </div>
          </div>
        )}
        <button className="btn btn-primary" style={{ width: "100%", marginTop: 8 }} onClick={submit} disabled={loading}>
          {loading ? <><span className="spinner" /> Please wait…</> : mode === "login" ? "Sign In →" : "Create Account →"}
        </button>
        <div className="auth-toggle">
          {mode === "login"
            ? <>No account? <span onClick={() => { setMode("register"); setError(""); }}>Sign up</span></>
            : <>Have account? <span onClick={() => { setMode("login"); setError(""); }}>Sign in</span></>}
        </div>
      </div>
    </div>
  );
}
