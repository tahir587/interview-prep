import React, { useEffect, useState } from "react";
import { getProgress } from "../services/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#10b981", "#f59e0b", "#f43f5e"];
const borderC = "rgba(99,102,241,0.18)";
const cardStyle = { background: "rgba(13,17,23,0.82)", border: `1px solid ${borderC}`, borderRadius: 18, padding: "22px", backdropFilter: "blur(14px)" };

const ProgressPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getProgress().then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false)); }, []);

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="skeleton-loader" style={{ height: 90, borderRadius: 18 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14 }}>
        {[0,1,2,3,4,5].map(i => <div key={i} className="skeleton-loader" style={{ height: 80, borderRadius: 14 }} />)}
      </div>
    </div>
  );

  const s = data?.summary || {};
  const interviews = data?.recentInterviews || [];
  const diffData = [
    { name: "Easy", value: s.solvedByDifficulty?.Easy || 0 },
    { name: "Medium", value: s.solvedByDifficulty?.Medium || 0 },
    { name: "Hard", value: s.solvedByDifficulty?.Hard || 0 },
  ];
  const topicData = Object.entries(s.solvedByTopic || {}).map(([topic, count]) => ({ topic, count })).sort((a, b) => b.count - a.count).slice(0, 8);
  const completedSubjects = {};
  data?.progress?.completedTopics?.forEach(t => { completedSubjects[t.subject] = (completedSubjects[t.subject] || 0) + 1; });
  const statItems = [
    { icon: "💻", label: "Problems Solved", value: s.totalSolved || 0, color: "#6366f1" },
    { icon: "🔥", label: "Current Streak", value: `${s.currentStreak || 0}d`, color: "#f43f5e" },
    { icon: "🎯", label: "Avg Interview", value: `${s.interviewStats?.averageScore || 0}%`, color: "#8b5cf6" },
    { icon: "🏆", label: "Best Score", value: `${s.interviewStats?.bestScore || 0}%`, color: "#f59e0b" },
    { icon: "📚", label: "Topics Done", value: s.completedTopics || 0, color: "#06b6d4" },
    { icon: "🧠", label: "Quizzes Taken", value: s.quizzesTaken || 0, color: "#10b981" },
  ];

  const tooltipStyle = { contentStyle: { background: "#141b2d", border: `1px solid ${borderC}`, borderRadius: 10, color: "#e8edf5", fontSize: "0.82rem" } };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Header */}
      <div className="animate-fade-in" style={{
        background: "linear-gradient(135deg,rgba(99,102,241,0.18) 0%,rgba(139,92,246,0.12) 50%,rgba(6,182,212,0.08) 100%)",
        border: "1px solid rgba(99,102,241,0.25)", borderRadius: 20, padding: "24px 28px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 150, height: 150, borderRadius: "50%", background: "radial-gradient(circle,rgba(139,92,246,0.15) 0%,transparent 70%)", filter: "blur(25px)", pointerEvents: "none" }} />
        <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#e8edf5", fontFamily: "Outfit,sans-serif", marginBottom: 4, position: "relative" }}>📊 Your Progress</h1>
        <p style={{ color: "var(--c-muted)", fontSize: "0.88rem", position: "relative" }}>Track your interview preparation journey</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14 }}>
        {statItems.map((it, i) => (
          <div key={i} style={{ ...cardStyle, padding: "18px 16px", display: "flex", alignItems: "center", gap: 12, transition: "all 0.3s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `${it.color}50`; e.currentTarget.style.boxShadow = `0 0 20px ${it.color}15`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = borderC; e.currentTarget.style.boxShadow = "none"; }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${it.color}18`, border: `1px solid ${it.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>{it.icon}</div>
            <div>
              <div style={{ fontSize: "1.2rem", fontWeight: 900, color: "#e8edf5", fontFamily: "Outfit,sans-serif" }}>{it.value}</div>
              <div style={{ fontSize: "0.7rem", color: "var(--c-muted)", fontWeight: 500 }}>{it.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))", gap: 18 }}>

        {/* Difficulty pie */}
        <div style={cardStyle}>
          <h3 style={{ fontWeight: 700, fontSize: "0.92rem", color: "#e8edf5", marginBottom: 16 }}>Problems by Difficulty</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={diffData} dataKey="value" innerRadius={60} outerRadius={95} paddingAngle={4}>
                {diffData.map((_, i) => <Cell key={i} fill={COLORS[i]} stroke="transparent" />)}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend formatter={v => <span style={{ color: "var(--c-muted)", fontSize: "0.78rem" }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Topic bars */}
        {topicData.length > 0 && (
          <div style={cardStyle}>
            <h3 style={{ fontWeight: 700, fontSize: "0.92rem", color: "#e8edf5", marginBottom: 16 }}>Problems by Topic</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topicData} layout="vertical" margin={{ left: 80 }}>
                <XAxis type="number" tick={{ fill: "var(--c-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="topic" width={140} tick={{ fill: "var(--c-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Subject progress */}
        <div style={cardStyle}>
          <h3 style={{ fontWeight: 700, fontSize: "0.92rem", color: "#e8edf5", marginBottom: 16 }}>CS Subject Progress</h3>
          {Object.keys(completedSubjects).length > 0 ? (
            Object.entries(completedSubjects).map(([subj, count]) => (
              <div key={subj} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: 6 }}>
                  <span style={{ color: "#e8edf5", fontWeight: 600 }}>{subj}</span>
                  <span style={{ color: "var(--c-muted)" }}>{count} topics</span>
                </div>
                <div style={{ height: 5, borderRadius: 99, background: "rgba(99,102,241,0.1)", overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 99, width: `${Math.min(100, count * 10)}%`, background: "linear-gradient(90deg,#10b981,#06b6d4)", transition: "width 0.8s" }} />
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: "var(--c-dim)", fontSize: "0.82rem" }}>Complete topics to see progress</p>
          )}
        </div>

        {/* Interview scores */}
        <div style={cardStyle}>
          <h3 style={{ fontWeight: 700, fontSize: "0.92rem", color: "#e8edf5", marginBottom: 16 }}>Recent Interview Scores</h3>
          {interviews.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={interviews.slice().reverse().map(i => ({ name: i.title.split(" ")[0], score: i.overallScore }))}>
                <XAxis dataKey="name" tick={{ fill: "var(--c-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: "var(--c-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} formatter={v => `${v}%`} />
                <Bar dataKey="score" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: "var(--c-dim)", fontSize: "0.82rem" }}>No completed interviews yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;