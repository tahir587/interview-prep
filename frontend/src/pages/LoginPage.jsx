import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const res = await login(form);
      toast.success("Welcome back! 👋");
      // Redirect admin users to admin panel, others to dashboard
      if (res.user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error(err?.message || err?.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(160deg,#07080f 0%,#0d1117 50%,#0a0614 100%)",
      padding: 24, position: "relative", overflow: "hidden",
    }}>
      {/* Ambient orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", width: 480, height: 480, borderRadius: "50%", top: -100, right: -100, background: "radial-gradient(circle,rgba(99,102,241,0.15) 0%,transparent 60%)", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", width: 380, height: 380, borderRadius: "50%", bottom: -80, left: -80, background: "radial-gradient(circle,rgba(6,182,212,0.1) 0%,transparent 60%)", filter: "blur(50px)" }} />
      </div>

      <div className="animate-fade-in" style={{
        background: "rgba(13,17,23,0.85)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(99,102,241,0.2)",
        borderRadius: 24,
        padding: "44px 40px",
        width: "100%", maxWidth: 420,
        boxShadow: "0 0 60px rgba(99,102,241,0.12), 0 24px 48px rgba(0,0,0,0.5)",
        position: "relative", zIndex: 1,
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 54, height: 54, borderRadius: 15,
            background: "linear-gradient(135deg,#6366f1,#8b5cf6,#06b6d4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.4rem", margin: "0 auto 16px",
            boxShadow: "0 0 24px rgba(99,102,241,0.5)",
          }}>🎯</div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#e8edf5", fontFamily: "Outfit,sans-serif", letterSpacing: "-0.02em", marginBottom: 6 }}>
            Welcome back
          </h1>
          <p style={{ color: "var(--c-muted)", fontSize: "0.875rem" }}>
            Sign in to continue your preparation
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Email */}
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--c-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 7 }}>
              Email Address
            </label>
            <input
              type="email"
              id="login-email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
              style={{
                width: "100%", padding: "12px 14px",
                background: "rgba(7,8,15,0.7)",
                border: "1px solid rgba(99,102,241,0.2)",
                borderRadius: 10, color: "#e8edf5",
                fontSize: "0.9rem", fontFamily: "Inter,sans-serif",
                outline: "none", transition: "all 0.3s",
              }}
              onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.15)"; }}
              onBlur={e => { e.target.style.borderColor = "rgba(99,102,241,0.2)"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {/* Password */}
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--c-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 7 }}>
              Password
            </label>
            <input
              type="password"
              id="login-password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              style={{
                width: "100%", padding: "12px 14px",
                background: "rgba(7,8,15,0.7)",
                border: "1px solid rgba(99,102,241,0.2)",
                borderRadius: 10, color: "#e8edf5",
                fontSize: "0.9rem", fontFamily: "Inter,sans-serif",
                outline: "none", transition: "all 0.3s",
              }}
              onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.15)"; }}
              onBlur={e => { e.target.style.borderColor = "rgba(99,102,241,0.2)"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            id="login-submit"
            disabled={loading}
            style={{
              marginTop: 4,
              padding: "13px",
              background: loading ? "rgba(99,102,241,0.4)" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
              border: "none", borderRadius: 10,
              color: "white", fontWeight: 700, fontSize: "0.97rem",
              fontFamily: "Inter,sans-serif",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.3s",
              boxShadow: loading ? "none" : "0 6px 20px rgba(99,102,241,0.4)",
            }}
          >
            {loading
              ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.75s linear infinite" }} />
                  Signing in…
                </span>
              : "→ Sign In"
            }
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
          <div style={{ flex: 1, height: 1, background: "rgba(99,102,241,0.15)" }} />
          <span style={{ fontSize: "0.75rem", color: "var(--c-dim)", fontWeight: 500 }}>OR</span>
          <div style={{ flex: 1, height: 1, background: "rgba(99,102,241,0.15)" }} />
        </div>

        <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--c-muted)" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#818cf8", fontWeight: 700, textDecoration: "none" }}>
            Create account →
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;