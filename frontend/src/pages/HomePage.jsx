import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const features = [
  {
    icon: "💻", title: "DSA Practice",
    description: "Master data structures and algorithms with 1000+ curated FAANG problems.",
    path: "/dsa",
    gradient: "linear-gradient(135deg,#6366f1,#4f46e5)",
    glow: "rgba(99,102,241,0.3)",
    tag: "1000+ Problems",
  },
  {
    icon: "🤖", title: "AI Mock Interviews",
    description: "Realistic AI-powered interviews simulating top tech company rounds.",
    path: "/interview",
    gradient: "linear-gradient(135deg,#8b5cf6,#6d28d9)",
    glow: "rgba(139,92,246,0.3)",
    tag: "AI Powered",
  },
  {
    icon: "📚", title: "CS Subjects",
    description: "Complete computer science fundamentals — OS, DBMS, Networks, and more.",
    path: "/subjects",
    gradient: "linear-gradient(135deg,#06b6d4,#0891b2)",
    glow: "rgba(6,182,212,0.3)",
    tag: "Full Coverage",
  },
  {
    icon: "📊", title: "Progress Analytics",
    description: "Track your preparation with detailed insights and performance metrics.",
    path: "/progress",
    gradient: "linear-gradient(135deg,#10b981,#059669)",
    glow: "rgba(16,185,129,0.3)",
    tag: "Live Tracking",
  },
];

const stats = [
  { label: "Active Users",     value: "50K+",  icon: "👥" },
  { label: "Problems Solved",  value: "1M+",   icon: "✅" },
  { label: "Success Rate",     value: "89%",   icon: "🏆" },
  { label: "Avg. Score Boost", value: "+34%",  icon: "📈" },
];

const HomePage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // ─── Logged-in Welcome View ───
  if (!loading && user) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg,#07080f 0%,#0d1117 50%,#07080f 100%)",
        padding: "48px 32px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Ambient orbs */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", top: -120, right: -120, background: "radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 60%)", filter: "blur(40px)" }} />
          <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", bottom: -80, left: -80, background: "radial-gradient(circle,rgba(6,182,212,0.1) 0%,transparent 60%)", filter: "blur(40px)" }} />
        </div>

        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
          {/* Welcome banner */}
          <div className="animate-fade-in" style={{
            background: "linear-gradient(135deg,rgba(99,102,241,0.18) 0%,rgba(139,92,246,0.12) 50%,rgba(6,182,212,0.1) 100%)",
            border: "1px solid rgba(99,102,241,0.25)",
            borderRadius: 24,
            padding: "36px 40px",
            marginBottom: 48,
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle,rgba(139,92,246,0.15) 0%,transparent 70%)", filter: "blur(30px)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -20, left: -20, width: 150, height: 150, borderRadius: "50%", background: "radial-gradient(circle,rgba(6,182,212,0.12) 0%,transparent 70%)", filter: "blur(20px)", pointerEvents: "none" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", display: "inline-block", boxShadow: "0 0 8px #10b981" }} />
                <span style={{ fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6ee7b7" }}>Active Session</span>
              </div>
              <h1 style={{ fontSize: "clamp(1.8rem,3vw,2.8rem)", fontWeight: 900, marginBottom: 10, color: "#e8edf5", fontFamily: "Outfit,sans-serif", letterSpacing: "-0.03em" }}>
                Welcome back, <span className="grad-text-animated">{user?.name?.split(" ")[0]}</span> 👋
              </h1>
              <p style={{ color: "var(--c-muted)", fontSize: "1rem", maxWidth: 520 }}>
                Ready to continue your journey? Pick up where you left off.
              </p>
              <button
                onClick={() => navigate("/dsa")}
                style={{
                  marginTop: 20,
                  padding: "11px 28px",
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  border: "none", borderRadius: 99,
                  color: "white", fontWeight: 700, fontSize: "0.9rem",
                  cursor: "pointer", fontFamily: "Inter,sans-serif",
                  boxShadow: "0 8px 24px rgba(99,102,241,0.4)",
                  transition: "all 0.3s",
                }}
              >🚀 Resume Practice</button>
            </div>
          </div>

          {/* Section heading */}
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#e8edf5", marginBottom: 4, fontFamily: "Outfit,sans-serif" }}>
              Jump back in
            </h2>
            <p style={{ color: "var(--c-muted)", fontSize: "0.9rem" }}>Choose a learning path to continue</p>
          </div>

          {/* Feature cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 18, marginBottom: 48 }}>
            {features.map((f, i) => (
              <Link
                key={i} to={f.path}
                className="animate-fade-in-up"
                style={{
                  animationDelay: `${i * 80}ms`,
                  textDecoration: "none",
                  display: "block",
                  background: "rgba(13,17,23,0.8)",
                  border: "1px solid rgba(99,102,241,0.18)",
                  borderRadius: 18,
                  padding: "26px 24px",
                  transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
                  position: "relative", overflow: "hidden",
                  backdropFilter: "blur(12px)",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)";
                  e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.4), 0 0 30px ${f.glow}`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.borderColor = "rgba(99,102,241,0.18)";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                {/* Icon */}
                <div style={{
                  width: 48, height: 48, borderRadius: 13,
                  background: f.gradient, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  fontSize: "1.4rem", marginBottom: 16,
                  boxShadow: `0 0 16px ${f.glow}`,
                }}>{f.icon}</div>

                {/* Tag */}
                <span style={{
                  display: "inline-block",
                  padding: "3px 10px",
                  borderRadius: 99,
                  fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.05em",
                  background: "rgba(99,102,241,0.12)",
                  color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)",
                  marginBottom: 10,
                }}>{f.tag}</span>

                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#e8edf5", marginBottom: 6, fontFamily: "Outfit,sans-serif" }}>{f.title}</h3>
                <p style={{ fontSize: "0.84rem", color: "var(--c-muted)", lineHeight: 1.65 }}>{f.description}</p>

                <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 4, color: "#818cf8", fontSize: "0.84rem", fontWeight: 700 }}>
                  Start <span style={{ transition: "transform 0.2s" }}>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Public Landing View ───
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg,#07080f 0%,#0d1117 40%,#0a0614 100%)",
      color: "#e8edf5",
      overflowX: "hidden",
    }}>
      {/* Blob background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div className="animate-blob" style={{ position: "absolute", top: "20%", left: "15%", width: 400, height: 400, borderRadius: "50%", background: "rgba(99,102,241,0.15)", filter: "blur(80px)" }} />
        <div className="animate-blob animation-delay-2000" style={{ position: "absolute", top: "30%", right: "20%", width: 350, height: 350, borderRadius: "50%", background: "rgba(139,92,246,0.12)", filter: "blur(80px)" }} />
        <div className="animate-blob animation-delay-4000" style={{ position: "absolute", bottom: "15%", left: "40%", width: 300, height: 300, borderRadius: "50%", background: "rgba(6,182,212,0.1)", filter: "blur(80px)" }} />
      </div>

      {/* Topbar */}
      <header style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 40px", borderBottom: "1px solid rgba(99,102,241,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.95rem", boxShadow: "0 0 16px rgba(99,102,241,0.45)" }}>🎯</div>
          <span style={{ fontWeight: 800, fontSize: "1.05rem", fontFamily: "Outfit,sans-serif" }}>
            Interview<span style={{ color: "#818cf8" }}>Prep</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link to="/login" style={{
            padding: "8px 22px", borderRadius: 99,
            border: "1px solid rgba(99,102,241,0.3)",
            color: "#818cf8", fontWeight: 600, fontSize: "0.875rem",
            textDecoration: "none", transition: "all 0.3s",
          }}>Log in</Link>
          <Link to="/register" style={{
            padding: "8px 22px", borderRadius: 99,
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            color: "white", fontWeight: 700, fontSize: "0.875rem",
            textDecoration: "none",
            boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
          }}>Get Started</Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "90px 24px 70px", position: "relative", zIndex: 1 }}>
        <div className="animate-fade-in" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "6px 18px", borderRadius: 99,
          background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.22)",
          fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.04em",
          color: "#818cf8", marginBottom: 28, textTransform: "uppercase",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
          Trusted by 50,000+ developers worldwide
        </div>

        <h1 className="animate-fade-in" style={{
          fontSize: "clamp(2.8rem,6vw,5rem)",
          fontWeight: 900, letterSpacing: "-0.04em",
          lineHeight: 1.05, marginBottom: 22,
          fontFamily: "Outfit,sans-serif",
        }}>
          🎯 Master Technical<br />
          <span className="grad-text-animated">Interviews</span>
        </h1>

        <p className="animate-fade-in-up" style={{
          fontSize: "1.15rem", color: "var(--c-muted)",
          maxWidth: 580, margin: "0 auto 40px", lineHeight: 1.75,
        }}>
          Your all-in-one platform to ace FAANG interviews. Practice DSA, take AI-powered mock interviews, and track your progress — all for free.
        </p>

        <div className="animate-fade-in-up" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/register" style={{
            padding: "14px 40px", borderRadius: 99,
            background: "linear-gradient(135deg,#6366f1,#8b5cf6,#06b6d4)",
            color: "white", fontWeight: 700, fontSize: "1rem",
            textDecoration: "none",
            boxShadow: "0 8px 30px rgba(99,102,241,0.45)",
          }}>🚀 Start Free — No Card Needed</Link>
          <Link to="/login" style={{
            padding: "14px 32px", borderRadius: 99,
            background: "rgba(15,23,42,0.8)",
            border: "1px solid rgba(99,102,241,0.25)",
            color: "#818cf8", fontWeight: 600, fontSize: "1rem",
            textDecoration: "none",
          }}>Sign In →</Link>
        </div>
      </section>

      {/* Stats row */}
      <section style={{ padding: "20px 32px 60px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16 }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              background: "rgba(13,17,23,0.7)",
              border: "1px solid rgba(99,102,241,0.18)",
              borderRadius: 18, padding: "22px 20px",
              textAlign: "center",
              backdropFilter: "blur(16px)",
              transition: "all 0.3s",
            }}>
              <div style={{ fontSize: "1.4rem", marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: "2rem", fontWeight: 900, fontFamily: "Outfit,sans-serif", background: "linear-gradient(135deg,#818cf8,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {s.value}
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--c-muted)", fontWeight: 500, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "20px 32px 80px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 99, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", fontSize: "0.73rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#818cf8", marginBottom: 16 }}>
              Features
            </div>
            <h2 style={{ fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 900, fontFamily: "Outfit,sans-serif", letterSpacing: "-0.03em", marginBottom: 12 }}>
              Everything to Land Your <span className="grad-text">Dream Job</span>
            </h2>
            <p style={{ color: "var(--c-muted)", maxWidth: 500, margin: "0 auto", fontSize: "0.95rem" }}>
              Comprehensive tools built for serious interview preparation
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20 }}>
            {features.map((f, i) => (
              <div key={i} style={{
                background: "rgba(13,17,23,0.75)",
                border: "1px solid rgba(99,102,241,0.15)",
                borderRadius: 20, padding: "28px 24px",
                backdropFilter: "blur(12px)",
                transition: "all 0.35s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.35)"; e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.4),0 0 30px ${f.glow}`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = "rgba(99,102,241,0.15)"; e.currentTarget.style.boxShadow = ""; }}
              >
                <div style={{ width: 52, height: 52, borderRadius: 14, background: f.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", marginBottom: 18, boxShadow: `0 0 20px ${f.glow}` }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#e8edf5", marginBottom: 8, fontFamily: "Outfit,sans-serif" }}>{f.title}</h3>
                <p style={{ fontSize: "0.875rem", color: "var(--c-muted)", lineHeight: 1.65 }}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "0 32px 80px", position: "relative", zIndex: 1 }}>
        <div style={{
          maxWidth: 820, margin: "0 auto",
          background: "linear-gradient(135deg,rgba(99,102,241,0.2) 0%,rgba(139,92,246,0.15) 50%,rgba(6,182,212,0.12) 100%)",
          border: "1px solid rgba(99,102,241,0.3)",
          borderRadius: 28, padding: "52px 48px",
          textAlign: "center", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 70% 50%,rgba(99,102,241,0.12) 0%,transparent 60%)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 900, fontFamily: "Outfit,sans-serif", letterSpacing: "-0.03em", marginBottom: 12 }}>
              Ready to Transform Your <span className="grad-text-animated">Career?</span>
            </h2>
            <p style={{ color: "var(--c-muted)", marginBottom: 32, fontSize: "0.97rem" }}>
              Join thousands of developers who've successfully landed jobs at top companies
            </p>
            <Link to="/register" style={{
              display: "inline-block",
              padding: "14px 44px", borderRadius: 99,
              background: "linear-gradient(135deg,#6366f1,#8b5cf6,#06b6d4)",
              color: "white", fontWeight: 700, fontSize: "1rem",
              textDecoration: "none",
              boxShadow: "0 8px 30px rgba(99,102,241,0.45)",
            }}>Start Your Journey — It's Free 🚀</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(99,102,241,0.12)", padding: "24px 32px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <p style={{ color: "var(--c-dim)", fontSize: "0.82rem" }}>
          © 2026 InterviewPrep · Made with ❤️ for future tech leaders
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
