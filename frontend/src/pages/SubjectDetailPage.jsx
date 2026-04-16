import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSubject, completeTopic, submitQuiz as submitQuizAPI, aiExplain } from "../services/api";
import { toast } from "react-toastify";
import { formatSubjectName } from "../utils/subjectDisplay";

const borderC = "rgba(99,102,241,0.18)";
const cardStyle = { background: "rgba(13,17,23,0.82)", border: `1px solid ${borderC}`, borderRadius: 18, backdropFilter: "blur(14px)" };

const TAB_META = {
  content:   { icon: "📖", label: "Notes" },
  questions: { icon: "🎤", label: "Interview Q&A" },
  quiz:      { icon: "🧠", label: "Quiz" },
  ai:        { icon: "🤖", label: "AI Explain" },
};

const SubjectDetailPage = () => {
  const { name } = useParams();
  const [subject, setSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [activeTab, setActiveTab] = useState("content");
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [aiExplanation, setAiExplanation] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSubject(decodeURIComponent(name)).then(r => { setSubject(r.data); if (r.data.topics?.length) setSelectedTopic(r.data.topics[0]); }).catch(console.error).finally(() => setLoading(false));
  }, [name]);

  const handleCompleteTopic = async () => {
    try { await completeTopic(subject.name, selectedTopic._id, { topicTitle: selectedTopic.title }); toast.success("Topic marked as completed!"); }
    catch (err) { console.error(err); }
  };

  const handleSubmitQuiz = async () => {
    const answers = selectedTopic.quiz.map((_, i) => quizAnswers[i] ?? -1);
    try { const res = await submitQuizAPI(subject.name, selectedTopic._id, { answers }); setQuizResult(res.data); }
    catch (err) { console.error(err); }
  };

  const handleAiExplain = async () => {
    setAiLoading(true); setAiExplanation("");
    try { const res = await aiExplain({ topic: selectedTopic.title, subject: subject.name }); setAiExplanation(res.data.explanation); }
    catch { setAiExplanation("AI explanation unavailable."); }
    finally { setAiLoading(false); }
  };

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="skeleton-loader" style={{ height: 80, borderRadius: 18 }} />
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 16 }}>
        <div className="skeleton-loader" style={{ height: 300, borderRadius: 16 }} />
        <div className="skeleton-loader" style={{ height: 300, borderRadius: 16 }} />
      </div>
    </div>
  );
  if (!subject) return <div style={{ textAlign: "center", padding: 40, color: "var(--c-muted)" }}>Subject not found</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div style={{ ...cardStyle, padding: "22px 26px" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#e8edf5", fontFamily: "Outfit,sans-serif", marginBottom: 6 }}>📚 {formatSubjectName(subject.name)}</h1>
        {subject.description && (
          <div style={{ fontSize: "0.85rem", color: "var(--c-muted)", lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: subject.description }} />
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 18, alignItems: "start" }}>

        {/* Sidebar — Topic List */}
        <div style={{ ...cardStyle, padding: "16px 14px" }}>
          <h3 style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--c-muted)", textTransform: "uppercase", letterSpacing: "0.06em", padding: "0 8px", marginBottom: 10 }}>Topics</h3>
          {subject.topics?.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {subject.topics.map(t => {
                const active = selectedTopic?._id === t._id;
                return (
                  <button key={t._id}
                    onClick={() => { setSelectedTopic(t); setActiveTab("content"); setQuizResult(null); setAiExplanation(""); }}
                    style={{
                      display: "block", width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: 10,
                      fontSize: "0.85rem", fontWeight: active ? 700 : 500, cursor: "pointer",
                      background: active ? "rgba(99,102,241,0.15)" : "transparent",
                      color: active ? "#818cf8" : "var(--c-muted)",
                      border: `1px solid ${active ? "rgba(99,102,241,0.3)" : "transparent"}`,
                      transition: "all 0.2s", fontFamily: "Inter,sans-serif",
                    }}
                  >{t.title}</button>
                );
              })}
            </div>
          ) : (
            <p style={{ color: "var(--c-dim)", fontSize: "0.82rem", padding: "0 8px" }}>No topics yet</p>
          )}
        </div>

        {/* Content */}
        {selectedTopic && (
          <div style={{ ...cardStyle, padding: "24px 26px", display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Title + mark complete */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#e8edf5", fontFamily: "Outfit,sans-serif" }}>{selectedTopic.title}</h2>
              <button onClick={handleCompleteTopic}
                style={{
                  padding: "7px 18px", borderRadius: 10, fontSize: "0.8rem", fontWeight: 700,
                  background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)",
                  color: "#10b981", cursor: "pointer", fontFamily: "Inter,sans-serif", transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
              >✓ Mark Complete</button>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 6, borderBottom: `1px solid ${borderC}`, paddingBottom: 12 }}>
              {Object.entries(TAB_META).map(([key, meta]) => {
                const active = activeTab === key;
                return (
                  <button key={key} onClick={() => setActiveTab(key)}
                    style={{
                      padding: "7px 16px", borderRadius: 10, fontSize: "0.8rem", fontWeight: 700,
                      cursor: "pointer", transition: "all 0.2s", fontFamily: "Inter,sans-serif",
                      background: active ? "rgba(99,102,241,0.15)" : "transparent",
                      color: active ? "#818cf8" : "var(--c-muted)", border: "none",
                    }}
                  >{meta.icon} {meta.label}</button>
                );
              })}
            </div>

            {/* Tab content */}
            {activeTab === "content" && (
              <div style={{ color: "#c8d0df", fontSize: "0.9rem", lineHeight: 1.8 }}
                className="prose-dark"
                dangerouslySetInnerHTML={{ __html: selectedTopic.content || "<p>Notes coming soon.</p>" }}
              />
            )}

            {activeTab === "questions" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {selectedTopic.interviewQuestions?.length > 0 ? (
                  selectedTopic.interviewQuestions.map((iq, i) => (
                    <details key={i} style={{
                      padding: "14px 16px", borderRadius: 12,
                      background: "rgba(7,8,15,0.5)", border: `1px solid ${borderC}`,
                      cursor: "pointer",
                    }}>
                      <summary style={{ fontWeight: 600, fontSize: "0.88rem", color: "#e8edf5" }}>
                        <span style={{ color: "#818cf8", marginRight: 8 }}>Q{i + 1}.</span>{iq.question}
                      </summary>
                      <p style={{ marginTop: 10, color: "var(--c-muted)", fontSize: "0.85rem", lineHeight: 1.7, paddingLeft: 28 }}>{iq.answer}</p>
                    </details>
                  ))
                ) : (
                  <p style={{ color: "var(--c-dim)", fontSize: "0.85rem" }}>Questions coming soon</p>
                )}
              </div>
            )}

            {activeTab === "quiz" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {!quizResult ? (
                  <>
                    {selectedTopic.quiz?.map((q, i) => (
                      <div key={i}>
                        <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "#e8edf5", marginBottom: 10 }}>
                          <span style={{ color: "#818cf8" }}>Q{i + 1}.</span> {q.question}
                        </p>
                        {q.options.map((opt, j) => {
                          const selected = quizAnswers[i] === j;
                          return (
                            <label key={j} style={{
                              display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10,
                              marginBottom: 6, cursor: "pointer", transition: "all 0.2s",
                              background: selected ? "rgba(99,102,241,0.1)" : "rgba(7,8,15,0.4)",
                              border: `1px solid ${selected ? "rgba(99,102,241,0.35)" : borderC}`,
                              color: selected ? "#e8edf5" : "var(--c-muted)", fontSize: "0.85rem",
                            }}>
                              <input type="radio" name={`q${i}`} onChange={() => setQuizAnswers(a => ({ ...a, [i]: j }))}
                                style={{ accentColor: "#6366f1" }} />
                              {opt}
                            </label>
                          );
                        })}
                      </div>
                    ))}
                    <button onClick={handleSubmitQuiz}
                      style={{
                        padding: "12px", borderRadius: 12, border: "none",
                        background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white",
                        fontWeight: 700, fontSize: "0.9rem", fontFamily: "Inter,sans-serif", cursor: "pointer",
                        boxShadow: "0 6px 18px rgba(99,102,241,0.35)",
                      }}
                    >Submit Quiz</button>
                  </>
                ) : (
                  <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <div style={{ fontSize: "2.5rem", fontWeight: 900, color: quizResult.score / quizResult.total >= 0.7 ? "#10b981" : "#f59e0b", fontFamily: "Outfit,sans-serif" }}>
                      {quizResult.score}/{quizResult.total}
                    </div>
                    <p style={{ color: "var(--c-muted)", marginTop: 8 }}>{quizResult.score / quizResult.total >= 0.7 ? "Great job!" : "Keep practicing!"}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "ai" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <button onClick={handleAiExplain} disabled={aiLoading}
                  style={{
                    padding: "11px 22px", borderRadius: 12, border: "none", alignSelf: "flex-start",
                    background: aiLoading ? "rgba(139,92,246,0.3)" : "linear-gradient(135deg,#8b5cf6,#6366f1)",
                    color: "white", fontWeight: 700, fontSize: "0.88rem", fontFamily: "Inter,sans-serif",
                    cursor: aiLoading ? "not-allowed" : "pointer", boxShadow: aiLoading ? "none" : "0 4px 14px rgba(139,92,246,0.35)",
                  }}
                >
                  {aiLoading
                    ? <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.75s linear infinite" }} />Generating…</span>
                    : "✨ Get AI Explanation"
                  }
                </button>
                {aiExplanation && (
                  <pre style={{
                    padding: "18px 20px", borderRadius: 14,
                    background: "rgba(99,102,241,0.06)", border: `1px solid ${borderC}`,
                    color: "#c8d0df", fontSize: "0.85rem", lineHeight: 1.7,
                    whiteSpace: "pre-wrap", fontFamily: "Inter,sans-serif",
                  }}>{aiExplanation}</pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectDetailPage;
