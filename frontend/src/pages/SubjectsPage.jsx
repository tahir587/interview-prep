import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSubjects } from "../services/api";
import { formatSubjectName, stripHtml } from "../utils/subjectDisplay";

const SUBJECT_META = {
  "Operating Systems": { icon: "🖥️", gradient: "linear-gradient(135deg,#6366f1,#4f46e5)", glow: "rgba(99,102,241,0.3)", desc: "Processes, Memory, Scheduling, Deadlocks" },
  DBMS:                { icon: "🗄️", gradient: "linear-gradient(135deg,#8b5cf6,#6d28d9)", glow: "rgba(139,92,246,0.3)", desc: "SQL, Normalization, Transactions, Indexing" },
  "Computer Networks": { icon: "🌐", gradient: "linear-gradient(135deg,#06b6d4,#0891b2)", glow: "rgba(6,182,212,0.3)", desc: "OSI Model, TCP/IP, HTTP, Security" },
  OOPs:               { icon: "🧩", gradient: "linear-gradient(135deg,#10b981,#059669)", glow: "rgba(16,185,129,0.3)", desc: "Encapsulation, Inheritance, Polymorphism" },
};

const borderC = "rgba(99,102,241,0.18)";

const featureCards = [
  { icon: "📖", title: "Topic Explanations", desc: "Detailed notes covering all important concepts." },
  { icon: "🎤", title: "Interview Questions", desc: "Curated Q&A asked in technical interviews." },
  { icon: "🧠", title: "Practice Quizzes", desc: "Test your understanding with MCQ quizzes." },
  { icon: "🤖", title: "AI Explanations", desc: "Ask AI to explain any concept for interviews." },
];

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { getSubjects().then(r => setSubjects(r.data)).catch(console.error).finally(() => setLoading(false)); }, []);

  const displaySubjects = subjects.length > 0 ? subjects : Object.entries(SUBJECT_META).map(([name]) => ({ name, totalTopics: 0, _id: name }));

  const getMetaBySubjectName = (subjectName) => {
    const matchedKey = Object.keys(SUBJECT_META).find(
      (key) => key.toLowerCase() === subjectName?.toLowerCase(),
    );

    return matchedKey
      ? SUBJECT_META[matchedKey]
      : { icon: "📖", gradient: "linear-gradient(135deg,#6366f1,#4f46e5)", glow: "rgba(99,102,241,0.3)", desc: "" };
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#e8edf5", fontFamily: "Outfit,sans-serif", marginBottom: 6 }}>📚 CS Subject Preparation</h1>
        <p style={{ color: "var(--c-muted)", fontSize: "0.88rem" }}>Master core computer science concepts with structured topics, interview Q&A, and quizzes.</p>
      </div>

      {/* Subjects grid */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
          {[0,1,2,3].map(i => <div key={i} className="skeleton-loader" style={{ height: 120, borderRadius: 18 }} />)}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
          {displaySubjects.map((sub, idx) => {
            const meta = getMetaBySubjectName(sub.name);
            const subjectTitle = formatSubjectName(sub.name);
            const descriptionPreview = meta.desc || stripHtml(sub.description) || "Core interview concepts and practice topics.";
            return (
              <div key={sub._id || sub.name} className="animate-fade-in-up"
                onClick={() => navigate(`/subjects/${encodeURIComponent(sub.name)}`)}
                style={{
                  animationDelay: `${idx * 60}ms`,
                  background: "rgba(13,17,23,0.82)", border: `1px solid ${borderC}`,
                  borderRadius: 18, padding: "24px 22px", cursor: "pointer",
                  backdropFilter: "blur(14px)", transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
                  position: "relative", overflow: "hidden",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)"; e.currentTarget.style.boxShadow = `0 14px 36px rgba(0,0,0,0.4), 0 0 24px ${meta.glow}`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = borderC; e.currentTarget.style.boxShadow = ""; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 13, background: meta.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0, boxShadow: `0 0 14px ${meta.glow}` }}>
                    {meta.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontWeight: 700, fontSize: "0.95rem", color: "#e8edf5", fontFamily: "Outfit,sans-serif", marginBottom: 3 }}>{subjectTitle}</h3>
                    <p style={{ fontSize: "0.78rem", color: "var(--c-muted)", lineHeight: 1.5 }}>{descriptionPreview}</p>
                    <span style={{ fontSize: "0.7rem", color: "var(--c-dim)", marginTop: 4, display: "inline-block" }}>
                      {sub.totalTopics || sub.topics?.length || 0} topics
                    </span>
                  </div>
                  <span style={{ color: "var(--c-dim)", fontSize: "1rem", flexShrink: 0 }}>→</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
        {featureCards.map((f, i) => (
          <div key={i} style={{
            background: "rgba(13,17,23,0.7)", border: `1px solid ${borderC}`,
            borderRadius: 16, padding: "22px 18px", textAlign: "center",
            backdropFilter: "blur(12px)", transition: "all 0.3s",
          }}>
            <div style={{ fontSize: "1.6rem", marginBottom: 10 }}>{f.icon}</div>
            <h4 style={{ fontWeight: 700, fontSize: "0.88rem", color: "#e8edf5", marginBottom: 5 }}>{f.title}</h4>
            <p style={{ fontSize: "0.78rem", color: "var(--c-muted)", lineHeight: 1.5 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectsPage;