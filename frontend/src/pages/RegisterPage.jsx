import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const COMPANIES = ["Google","Amazon","Microsoft","Meta","Apple","Netflix","Flipkart","Infosys","TCS","Wipro"];

const inputStyle = {
  width: "100%", padding: "12px 14px",
  background: "rgba(7,8,15,0.7)",
  border: "1px solid rgba(99,102,241,0.2)",
  borderRadius: 10, color: "#e8edf5",
  fontSize: "0.9rem", fontFamily: "Inter,sans-serif",
  outline: "none", transition: "all 0.3s",
};

const RegisterPage = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", targetCompanies: [] });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const toggleCompany = (company) => {
    setForm(prev => ({
      ...prev,
      targetCompanies: prev.targetCompanies.includes(company)
        ? prev.targetCompanies.filter(c => c !== company)
        : [...prev.targetCompanies, company],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (form.name.trim().length < 2) { setError("Name must be at least 2 characters"); setLoading(false); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); setLoading(false); return; }
    try {
      await register(form);
      toast.success("Account created! Welcome to InterviewPrep 🎉");
      navigate("/dashboard");
    } catch (err) {
      const msg = err?.message || err?.response?.data?.message || "Registration failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(160deg,#07080f 0%,#0d1117 50%,#0a0614 100%)",
      padding: "32px 24px", position: "relative", overflow: "hidden",
    }}>
      {/* Orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", width: 480, height: 480, borderRadius: "50%", top: -120, right: -100, background: "radial-gradient(circle,rgba(99,102,241,0.14) 0%,transparent 60%)", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", width: 380, height: 380, borderRadius: "50%", bottom: -80, left: -80, background: "radial-gradient(circle,rgba(139,92,246,0.1) 0%,transparent 60%)", filter: "blur(50px)" }} />
      </div>

      <div className="animate-fade-in" style={{
        background: "rgba(13,17,23,0.88)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(99,102,241,0.2)",
        borderRadius: 24,
        padding: "40px 36px",
        width: "100%", maxWidth: 480,
        boxShadow: "0 0 60px rgba(99,102,241,0.1), 0 24px 48px rgba(0,0,0,0.5)",
        position: "relative", zIndex: 1,
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 50, height: 50, borderRadius: 13, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", margin: "0 auto 14px", boxShadow: "0 0 20px rgba(99,102,241,0.5)" }}>🎯</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#e8edf5", fontFamily: "Outfit,sans-serif", letterSpacing: "-0.02em", marginBottom: 5 }}>
            Create Account
          </h1>
          <p style={{ color: "var(--c-muted)", fontSize: "0.875rem" }}>Join 50,000+ developers preparing for top companies</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: "10px 14px", marginBottom: 16,
            background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.25)",
            borderRadius: 10, color: "#fb7185", fontSize: "0.85rem",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Name */}
          <div>
            <label style={{ display: "block", fontSize: "0.73rem", fontWeight: 700, color: "var(--c-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Full Name</label>
            <input id="reg-name" type="text" placeholder="John Doe" value={form.name} required
              onChange={e => setForm({ ...form, name: e.target.value })}
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.15)"; }}
              onBlur={e => { e.target.style.borderColor = "rgba(99,102,241,0.2)"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {/* Email */}
          <div>
            <label style={{ display: "block", fontSize: "0.73rem", fontWeight: 700, color: "var(--c-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Email</label>
            <input id="reg-email" type="email" placeholder="you@example.com" value={form.email} required
              onChange={e => setForm({ ...form, email: e.target.value })}
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.15)"; }}
              onBlur={e => { e.target.style.borderColor = "rgba(99,102,241,0.2)"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {/* Password */}
          <div>
            <label style={{ display: "block", fontSize: "0.73rem", fontWeight: 700, color: "var(--c-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Password</label>
            <input id="reg-password" type="password" placeholder="Min 6 characters" value={form.password} required minLength={6}
              onChange={e => setForm({ ...form, password: e.target.value })}
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.15)"; }}
              onBlur={e => { e.target.style.borderColor = "rgba(99,102,241,0.2)"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {/* Target Companies */}
          <div>
            <label style={{ display: "block", fontSize: "0.73rem", fontWeight: 700, color: "var(--c-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
              Target Companies <span style={{ color: "var(--c-dim)" }}>(optional)</span>
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {COMPANIES.map(company => {
                const selected = form.targetCompanies.includes(company);
                return (
                  <button
                    key={company} type="button"
                    onClick={() => toggleCompany(company)}
                    style={{
                      padding: "6px 14px", borderRadius: 99, fontSize: "0.78rem", fontWeight: 600,
                      cursor: "pointer", transition: "all 0.2s",
                      background: selected ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(26,37,64,0.5)",
                      color: selected ? "white" : "var(--c-muted)",
                      border: `1px solid ${selected ? "rgba(99,102,241,0.5)" : "rgba(99,102,241,0.18)"}`,
                      boxShadow: selected ? "0 4px 12px rgba(99,102,241,0.3)" : "none",
                    }}
                  >
                    {company}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit" id="reg-submit" disabled={loading}
            style={{
              marginTop: 6, padding: "13px",
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
                  Creating account…
                </span>
              : "→ Create Account"
            }
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0" }}>
          <div style={{ flex: 1, height: 1, background: "rgba(99,102,241,0.15)" }} />
          <span style={{ fontSize: "0.73rem", color: "var(--c-dim)", fontWeight: 500 }}>OR</span>
          <div style={{ flex: 1, height: 1, background: "rgba(99,102,241,0.15)" }} />
        </div>

        <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--c-muted)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#818cf8", fontWeight: 700, textDecoration: "none" }}>
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;