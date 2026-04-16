import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProgress } from "../services/api";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

/* ─── Stat Card ─── */
const StatCard = ({ icon, label, value, color, to, tag }) => (
  <Link to={to} style={{ textDecoration: "none" }}>
    <div style={{
      background: "rgba(13,17,23,0.8)",
      border: "1px solid rgba(99,102,241,0.18)",
      borderRadius: 18, padding: "22px 20px",
      cursor: "pointer",
      transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
      position: "relative", overflow: "hidden",
      backdropFilter: "blur(12px)",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)"; e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(${colorToRgb(color)},0.2)`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = "rgba(99,102,241,0.18)"; e.currentTarget.style.boxShadow = ""; }}
    >
      {/* Top accent */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${color},transparent)`, opacity: 0.7, borderRadius: "18px 18px 0 0" }} />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}1a`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>
          {icon}
        </div>
        {tag && (
          <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 99, fontSize: "0.68rem", fontWeight: 700, background: "rgba(99,102,241,0.12)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" }}>
            {tag}
          </span>
        )}
      </div>

      <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "#e8edf5", fontFamily: "Outfit,sans-serif", letterSpacing: "-0.02em", marginBottom: 2 }}>
        {value}
      </div>
      <div style={{ fontSize: "0.8rem", color: "var(--c-muted)", fontWeight: 500 }}>{label}</div>
    </div>
  </Link>
);

const colorToRgb = (hex) => {
  const m = hex?.replace("#","").match(/.{2}/g) || ["99","66","f1"];
  return m.map(h => parseInt(h,16)).join(",");
};

/* ─── Skeleton ─── */
const CardSkeleton = () => (
  <div style={{ background: "rgba(13,17,23,0.8)", border: "1px solid rgba(99,102,241,0.1)", borderRadius: 18, padding: "22px 20px" }}>
    <div className="skeleton-loader" style={{ height: 36, width: 36, borderRadius: 10, marginBottom: 14 }} />
    <div className="skeleton-loader" style={{ height: 28, width: "60%", marginBottom: 8 }} />
    <div className="skeleton-loader" style={{ height: 14, width: "80%" }} />
  </div>
);

/* ─── Main Component ─── */
const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

  useEffect(() => {
    getProgress()
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="responsive-page-container" style={{ display: "flex", flexDirection: "column", gap: 24, paddingLeft: 24, paddingRight: 24 }}>
        <style>{`
          .responsive-page-container {
            padding-top: 80px;
          }
          @media (min-width: 768px) {
            .responsive-page-container {
              padding-top: 28px;
            }
          }
        `}</style>
        <div className="skeleton-loader" style={{ height: 100, borderRadius: 18, width: "100%" }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 16 }}>
          {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  const s = data?.summary || {};
  const interviews = data?.recentInterviews || [];

  const difficultyData = [
    { name: "Easy",   value: s.solvedByDifficulty?.Easy   || 0 },
    { name: "Medium", value: s.solvedByDifficulty?.Medium || 0 },
    { name: "Hard",   value: s.solvedByDifficulty?.Hard   || 0 },
  ];

  const total = difficultyData.reduce((acc, d) => acc + d.value, 0);

  return (
    <div className="responsive-page-container" style={{ display: "flex", flexDirection: "column", gap: 24, paddingLeft: 24, paddingRight: 24 }}>
      <style>{`
        .responsive-page-container {
          padding-top: 80px;
        }
        @media (min-width: 768px) {
          .responsive-page-container {
            padding-top: 28px;
          }
        }
      `}</style>

      {/* Welcome Banner */}
      <div className="animate-fade-in" style={{
        background: "linear-gradient(135deg,rgba(99,102,241,0.18) 0%,rgba(139,92,246,0.12) 50%,rgba(6,182,212,0.08) 100%)",
        border: "1px solid rgba(99,102,241,0.25)",
        borderRadius: 20, padding: "28px 32px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle,rgba(139,92,246,0.18) 0%,transparent 70%)", filter: "blur(30px)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", display: "inline-block", boxShadow: "0 0 8px #10b981" }} />
              <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6ee7b7" }}>Dashboard</span>
            </div>
            <h1 style={{ fontSize: "clamp(1.4rem,2.5vw,2rem)", fontWeight: 900, color: "#e8edf5", fontFamily: "Outfit,sans-serif", letterSpacing: "-0.02em", marginBottom: 6 }}>
              Good to see you, <span style={{ color: "#818cf8" }}>{user?.name?.split(" ")[0]}</span> 👋
            </h1>
            <p style={{ color: "var(--c-muted)", fontSize: "0.9rem" }}>Keep up the momentum — here's your preparation overview.</p>
          </div>
          <Link to="/interview" style={{
            padding: "10px 24px", borderRadius: 99, textDecoration: "none",
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            color: "white", fontWeight: 700, fontSize: "0.875rem",
            boxShadow: "0 6px 20px rgba(99,102,241,0.35)", whiteSpace: "nowrap",
          }}>🤖 Start Interview</Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 15 }}>
        <StatCard icon="💻" label="Problems Solved"   value={s.totalSolved || 0}                       color="#6366f1" to="/dsa"       tag={`${Math.round((s.totalSolved || 0) / 10)}%`} />
        <StatCard icon="🤖" label="Interviews Taken"  value={s.interviewStats?.totalInterviews || 0}    color="#8b5cf6" to="/interview" />
        <StatCard icon="📚" label="Topics Completed"  value={s.completedTopics || 0}                    color="#06b6d4" to="/subjects"  />
        <StatCard icon="🧠" label="Quizzes Taken"     value={s.quizzesTaken || 0}                       color="#10b981" to="/subjects"  />
        <StatCard icon="⭐" label="Best Score"         value={`${s.interviewStats?.bestScore || 0}%`}    color="#f59e0b" to="/progress"  tag="🔥" />
        <StatCard icon="🔥" label="Current Streak"    value={`${s.currentStreak || 0}d`}               color="#f43f5e" to="/progress"  />
      </div>

      {/* Charts + Recent */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))", gap: 20 }}>

        {/* Donut Chart */}
        <div style={{
          background: "rgba(13,17,23,0.8)", border: "1px solid rgba(99,102,241,0.18)",
          borderRadius: 20, padding: "24px",
          backdropFilter: "blur(12px)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.97rem", color: "#e8edf5" }}>📊 By Difficulty</h3>
            <span style={{ fontSize: "0.8rem", color: "var(--c-muted)" }}>{total} total</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={difficultyData} dataKey="value" nameKey="name" innerRadius={65} outerRadius={100} paddingAngle={4}>
                {difficultyData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#141b2d", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 10, color: "#e8edf5", fontSize: "0.82rem" }}
              />
              <Legend
                formatter={(value) => <span style={{ color: "var(--c-muted)", fontSize: "0.8rem" }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Interviews */}
        <div style={{
          background: "rgba(13,17,23,0.8)", border: "1px solid rgba(99,102,241,0.18)",
          borderRadius: 20, padding: "24px",
          backdropFilter: "blur(12px)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.97rem", color: "#e8edf5" }}>🎬 Recent Interviews</h3>
            {interviews.length > 5 && (
              <Link to="/interview" style={{ color: "#818cf8", fontSize: "0.78rem", fontWeight: 600, textDecoration: "none" }}>View all →</Link>
            )}
          </div>

          {interviews.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🎯</div>
              <p style={{ color: "var(--c-muted)", fontSize: "0.875rem", marginBottom: 16 }}>No interviews yet. Start your first one!</p>
              <Link to="/interview" style={{
                display: "inline-block", padding: "9px 22px", borderRadius: 99,
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                color: "white", fontWeight: 700, fontSize: "0.84rem",
                textDecoration: "none", boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
              }}>🚀 Start Interview</Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {interviews.slice(0, 5).map((item, idx) => {
                const score = item.overallScore || 0;
                const scoreColor = score >= 70 ? "#10b981" : score >= 50 ? "#f59e0b" : "#f43f5e";
                const scoreBg = score >= 70 ? "rgba(16,185,129,0.12)" : score >= 50 ? "rgba(245,158,11,0.12)" : "rgba(244,63,94,0.12)";
                return (
                  <div key={item._id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                    padding: "12px 14px", borderRadius: 12,
                    background: "rgba(7,8,15,0.5)",
                    border: "1px solid rgba(99,102,241,0.12)",
                    transition: "all 0.2s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,102,241,0.08)"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.25)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(7,8,15,0.5)"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.12)"; }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#e8edf5", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {idx + 1}. {item.title}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--c-muted)", marginTop: 2 }}>
                        {item.type} · {item.company}
                      </div>
                    </div>
                    <span style={{
                      padding: "4px 12px", borderRadius: 99, fontWeight: 700, fontSize: "0.8rem",
                      background: scoreBg, color: scoreColor,
                      border: `1px solid ${scoreColor}30`, flexShrink: 0,
                    }}>{score}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
