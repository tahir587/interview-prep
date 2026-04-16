import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getInterviews, startInterview } from "../services/api";

const TYPES = ["DSA", "Technical", "Behavioral", "System Design"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const COMPANIES = ["General","Google","Amazon","Microsoft","Meta","Apple","Flipkart"];

const TYPE_META = {
  DSA:             { icon: "💻", gradient: "linear-gradient(135deg,#6366f1,#4f46e5)", glow: "rgba(99,102,241,0.35)" },
  Technical:       { icon: "⚙️", gradient: "linear-gradient(135deg,#8b5cf6,#6d28d9)", glow: "rgba(139,92,246,0.35)" },
  Behavioral:      { icon: "🗣️", gradient: "linear-gradient(135deg,#06b6d4,#0891b2)", glow: "rgba(6,182,212,0.35)" },
  "System Design": { icon: "🏗️", gradient: "linear-gradient(135deg,#f59e0b,#d97706)", glow: "rgba(245,158,11,0.35)" },
};

const DIFF_COLORS = { Easy: "#10b981", Medium: "#f59e0b", Hard: "#f43f5e" };

const s = {
  card: { background: "rgba(13,17,23,0.82)", border: "1px solid rgba(99,102,241,0.18)", borderRadius: 18, backdropFilter: "blur(14px)", transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)", overflow: "hidden", position: "relative" },
  label: { display: "block", fontSize: "0.7rem", fontWeight: 700, color: "var(--c-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 7 },
  select: { width: "100%", padding: "11px 14px", background: "rgba(7,8,15,0.8)", border: "1px solid rgba(99,102,241,0.22)", borderRadius: 10, color: "#e8edf5", fontFamily: "Inter,sans-serif", fontSize: "0.88rem", outline: "none", appearance: "none", cursor: "pointer", transition: "all 0.3s" },
  btn: { padding: "12px 28px", borderRadius: 99, border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", fontWeight: 700, fontSize: "0.92rem", fontFamily: "Inter,sans-serif", cursor: "pointer", boxShadow: "0 6px 20px rgba(99,102,241,0.4)", transition: "all 0.3s" },
};

const MockInterviewPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [form, setForm] = useState({ type: "DSA", company: "General", difficulty: "Medium", questionCount: 5, resumeText: "" });
  const navigate = useNavigate();

  useEffect(() => { setLoading(true); getInterviews().then(r => setInterviews(r.data)).catch(console.error).finally(() => setLoading(false)); }, []);

  const handleStart = async (e) => {
    e.preventDefault();
    setStarting(true);
    try {
      const res = await startInterview(form);
      navigate(`/interview/${res.data._id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to start interview");
      setStarting(false);
    }
  };

  const scoreColor = (sc) => sc >= 70 ? "#10b981" : sc >= 50 ? "#f59e0b" : "#f43f5e";
  const scoreBg = (sc) => sc >= 70 ? "rgba(16,185,129,0.12)" : sc >= 50 ? "rgba(245,158,11,0.12)" : "rgba(244,63,94,0.12)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* Header */}
      <div className="animate-fade-in" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", display: "inline-block", boxShadow: "0 0 8px #10b981" }} />
            <span style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6ee7b7" }}>AI Powered</span>
          </div>
          <h1 style={{ fontSize: "clamp(1.5rem,2.5vw,2rem)", fontWeight: 900, color: "#e8edf5", fontFamily: "Outfit,sans-serif", letterSpacing: "-0.02em" }}>
            🤖 Mock Interviews
          </h1>
          <p style={{ color: "var(--c-muted)", fontSize: "0.88rem", marginTop: 4 }}>Realistic AI-powered interviews that simulate top company rounds</p>
        </div>
        <button
          onClick={() => setShowForm(s => !s)}
          style={{
            ...s.btn,
            background: showForm ? "rgba(244,63,94,0.15)" : s.btn.background,
            color: showForm ? "#fb7185" : "white",
            boxShadow: showForm ? "none" : s.btn.boxShadow,
            border: showForm ? "1px solid rgba(244,63,94,0.3)" : "none",
          }}
        >
          {showForm ? "✕ Cancel" : "+ New Interview"}
        </button>
      </div>

      {/* ──── New Interview Form ──── */}
      {showForm && (
        <div className="animate-fade-in" style={{ ...s.card, padding: "28px 28px 32px" }}>
          {/* Gradient accent top */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4)", borderRadius: "18px 18px 0 0" }} />

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", boxShadow: "0 0 14px rgba(99,102,241,0.4)" }}>🎯</div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "#e8edf5" }}>Configure Interview</h3>
              <p style={{ fontSize: "0.78rem", color: "var(--c-muted)" }}>Set up your mock session</p>
            </div>
          </div>

          <form onSubmit={handleStart}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 18, marginBottom: 24 }}>
              {/* Type */}
              <div>
                <label style={s.label}>Interview Type</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={s.select}>
                  {TYPES.map(t => <option key={t} style={{ background: "#0d1117" }}>{t}</option>)}
                </select>
              </div>

              {/* Company */}
              <div>
                <label style={s.label}>Company</label>
                <select value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} style={s.select}>
                  {COMPANIES.map(c => <option key={c} style={{ background: "#0d1117" }}>{c}</option>)}
                </select>
              </div>

              {/* Difficulty */}
              <div>
                <label style={s.label}>Difficulty</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {DIFFICULTIES.map(d => (
                    <button key={d} type="button" onClick={() => setForm({ ...form, difficulty: d })}
                      style={{
                        flex: 1, padding: "10px 0", borderRadius: 10, fontSize: "0.82rem", fontWeight: 700,
                        cursor: "pointer", transition: "all 0.2s", fontFamily: "Inter,sans-serif",
                        background: form.difficulty === d ? `${DIFF_COLORS[d]}20` : "rgba(7,8,15,0.6)",
                        color: form.difficulty === d ? DIFF_COLORS[d] : "var(--c-muted)",
                        border: `1px solid ${form.difficulty === d ? `${DIFF_COLORS[d]}50` : "rgba(99,102,241,0.15)"}`,
                      }}
                    >{d}</button>
                  ))}
                </div>
              </div>

              {/* Question Count */}
              <div>
                <label style={s.label}>Questions · {form.questionCount}</label>
                <div style={{ ...s.select, display: "flex", alignItems: "center", gap: 12, padding: "8px 14px" }}>
                  <input type="range" min="3" max="10" value={form.questionCount}
                    onChange={e => setForm({ ...form, questionCount: Number(e.target.value) })}
                    style={{ width: "100%", accentColor: "#6366f1" }}
                  />
                  <span style={{ fontWeight: 700, color: "#818cf8", fontSize: "0.95rem", flexShrink: 0, width: 20, textAlign: "center" }}>{form.questionCount}</span>
                </div>
              </div>

              {/* Resume Context */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={s.label}>Resume Context (Optional)</label>
                <textarea
                  value={form.resumeText}
                  onChange={e => setForm({ ...form, resumeText: e.target.value })}
                  rows={5}
                  maxLength={4000}
                  placeholder="Paste your resume or key highlights (projects, skills, impact). The interviewer will ask background questions based on this."
                  style={{
                    ...s.select,
                    minHeight: 130,
                    resize: "vertical",
                    lineHeight: 1.5,
                    fontFamily: "Inter,sans-serif"
                  }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: "0.72rem" }}>
                  <span style={{ color: "var(--c-dim)" }}>Used for personalized background questions</span>
                  <span style={{ color: "var(--c-muted)" }}>{form.resumeText.length}/4000</span>
                </div>
              </div>
            </div>

            {/* Preview summary */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, padding: "12px 16px", background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.12)", borderRadius: 12 }}>
              <span style={{ fontSize: "1.2rem" }}>{TYPE_META[form.type]?.icon}</span>
              <span style={{ fontSize: "0.84rem", color: "var(--c-muted)" }}>
                <strong style={{ color: "#e8edf5" }}>{form.type}</strong> · {form.company} · <span style={{ color: DIFF_COLORS[form.difficulty] }}>{form.difficulty}</span> · {form.questionCount} questions
                {form.resumeText.trim() ? " · Resume-based" : ""}
              </span>
            </div>

            <button type="submit" disabled={starting}
              style={{ ...s.btn, width: "100%", padding: "14px", opacity: starting ? 0.6 : 1, cursor: starting ? "not-allowed" : "pointer" }}
            >
              {starting
                ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                    <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.75s linear infinite" }} />
                    Generating AI Interview…
                  </span>
                : "🚀 Start Interview"
              }
            </button>
          </form>
        </div>
      )}

      {/* ──── Past Interviews ──── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#e8edf5", fontFamily: "Outfit,sans-serif" }}>Your Interviews</h2>
          <span style={{ fontSize: "0.78rem", color: "var(--c-muted)" }}>{interviews.length} total</span>
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
            {[0,1,2].map(i => (
              <div key={i} className="skeleton-loader" style={{ height: 180, borderRadius: 18 }} />
            ))}
          </div>
        ) : interviews.length === 0 ? (
          <div style={{ ...s.card, padding: "48px 28px", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 14 }}>🎯</div>
            <p style={{ color: "var(--c-muted)", fontSize: "0.9rem", marginBottom: 20 }}>No interviews yet. Start your first one!</p>
            <button onClick={() => setShowForm(true)} style={s.btn}>+ New Interview</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
            {interviews.map((iv, idx) => {
              const meta = TYPE_META[iv.type] || TYPE_META.DSA;
              const isComplete = iv.status === "completed";
              return (
                <div key={iv._id} className="animate-fade-in-up" style={{ ...s.card, padding: 0, animationDelay: `${idx * 60}ms` }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.35)"; e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,0.4), 0 0 24px ${meta.glow}`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = "rgba(99,102,241,0.18)"; e.currentTarget.style.boxShadow = ""; }}
                >
                  {/* Top accent bar */}
                  <div style={{ height: 3, background: meta.gradient }} />

                  <div style={{ padding: "20px 22px 22px" }}>
                    {/* Title row */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 9, background: meta.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.95rem", flexShrink: 0, boxShadow: `0 0 10px ${meta.glow}` }}>
                          {meta.icon}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <h4 style={{ fontWeight: 700, fontSize: "0.9rem", color: "#e8edf5", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{iv.title}</h4>
                          <span style={{ fontSize: "0.72rem", color: "var(--c-dim)" }}>{new Date(iv.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <span style={{
                        padding: "3px 10px", borderRadius: 99, fontSize: "0.68rem", fontWeight: 700, flexShrink: 0,
                        background: isComplete ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)",
                        color: isComplete ? "#10b981" : "#f59e0b",
                        border: `1px solid ${isComplete ? "rgba(16,185,129,0.25)" : "rgba(245,158,11,0.25)"}`,
                      }}>{isComplete ? "✓ Completed" : "In Progress"}</span>
                    </div>

                    {/* Meta row */}
                    <div style={{ display: "flex", gap: 12, fontSize: "0.78rem", color: "var(--c-muted)", marginBottom: 16 }}>
                      <span>🏢 {iv.company}</span>
                      <span>📋 {iv.type}</span>
                      <span style={{ color: DIFF_COLORS[iv.difficulty] || "var(--c-muted)" }}>⚡ {iv.difficulty}</span>
                    </div>

                    {/* Score or continue */}
                    {isComplete ? (
                      <div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ fontSize: "0.75rem", color: "var(--c-muted)", fontWeight: 600 }}>Score</span>
                          <span style={{ fontSize: "0.85rem", fontWeight: 800, color: scoreColor(iv.overallScore) }}>{iv.overallScore}%</span>
                        </div>
                        <div style={{ height: 6, borderRadius: 99, background: "rgba(99,102,241,0.1)", overflow: "hidden" }}>
                          <div style={{ height: "100%", borderRadius: 99, width: `${iv.overallScore}%`, background: `linear-gradient(90deg,${scoreColor(iv.overallScore)},${scoreColor(iv.overallScore)}80)`, transition: "width 1s ease" }} />
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => navigate(`/interview/${iv._id}`)}
                        style={{
                          width: "100%", padding: "10px", borderRadius: 10, border: "1px solid rgba(99,102,241,0.25)",
                          background: "rgba(99,102,241,0.08)", color: "#818cf8", fontWeight: 700, fontSize: "0.85rem",
                          cursor: "pointer", fontFamily: "Inter,sans-serif", transition: "all 0.2s",
                        }}
                        onMouseEnter={e => { e.target.style.background = "rgba(99,102,241,0.15)"; }}
                        onMouseLeave={e => { e.target.style.background = "rgba(99,102,241,0.08)"; }}
                      >
                        💬 Continue Interview →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MockInterviewPage;
