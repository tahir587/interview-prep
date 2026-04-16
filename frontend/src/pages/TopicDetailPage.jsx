import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTopic, completeTopic, submitQuiz, aiExplain } from "../services/api";
import { decode } from "html-entities";
import { toast } from "react-toastify";
import { formatSubjectName } from "../utils/subjectDisplay";

const borderC = "rgba(99,102,241,0.18)";
const cardStyle = { background: "rgba(13,17,23,0.82)", border: `1px solid ${borderC}`, borderRadius: 18, backdropFilter: "blur(14px)" };

const tabs = [
  { id: "content", label: "📖 Content" },
  { id: "interview", label: "🎤 Interview Q&A" },
  { id: "quiz", label: "✍️ Practice Quiz" },
  { id: "ai", label: "🤖 AI Explanation" },
];

const TopicDetailPage = () => {
  const { subjectName, topicId } = useParams();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("content");
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [aiExplanation, setAiExplanation] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    getTopic(subjectName, topicId).then(res => { setTopic(res.data); setLoading(false); })
      .catch(err => { console.error(err); toast.error("Failed to load topic"); setLoading(false); });
  }, [subjectName, topicId]);

  const handleCompleteTopic = async () => {
    setCompleting(true);
    try { await completeTopic(subjectName, topicId, { topicTitle: topic.title }); toast.success("Topic marked as completed!"); }
    catch { toast.error("Failed to complete topic"); }
    finally { setCompleting(false); }
  };

  const handleQuizSubmit = async () => {
    if (!topic?.quiz || topic.quiz.length === 0) return;
    const answers = Object.values(quizAnswers);
    if (answers.length !== topic.quiz.length) { toast.error("Please answer all questions"); return; }
    try { const res = await submitQuiz(subjectName, topicId, { answers }); setQuizResult(res.data); toast.success(`Score: ${res.data.score}/${res.data.total}`); }
    catch { toast.error("Failed to submit quiz"); }
  };

  const handleAIExplain = async () => {
    setAiLoading(true);
    try { const res = await aiExplain({ topic: topic.title, subject: subjectName }); setAiExplanation(res.data.explanation); }
    catch { toast.error("Failed to get AI explanation"); }
    finally { setAiLoading(false); }
  };

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 900, margin: "0 auto" }}>
      <div className="skeleton-loader" style={{ height: 60, borderRadius: 16 }} />
      <div className="skeleton-loader" style={{ height: 40, borderRadius: 10 }} />
      <div className="skeleton-loader" style={{ height: 300, borderRadius: 16 }} />
    </div>
  );

  if (!topic) return <div style={{ textAlign: "center", padding: 48, color: "var(--c-muted)" }}>Topic not found</div>;

  const decodedContent = decode(topic.content || "");
  const scoreColor = (r) => r.score / r.total >= 0.7 ? "#10b981" : "#f59e0b";
  const displaySubjectName = formatSubjectName(decodeURIComponent(subjectName));

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#e8edf5", fontFamily: "Outfit,sans-serif", marginBottom: 4 }}>{topic.title}</h1>
          <p style={{ color: "var(--c-muted)", fontSize: "0.85rem" }}>{displaySubjectName}</p>
        </div>
        <button onClick={handleCompleteTopic} disabled={completing}
          style={{
            padding: "9px 22px", borderRadius: 10, border: "none",
            background: "linear-gradient(135deg,#10b981,#059669)", color: "white",
            fontWeight: 700, fontSize: "0.85rem", fontFamily: "Inter,sans-serif",
            cursor: completing ? "not-allowed" : "pointer",
            boxShadow: "0 4px 14px rgba(16,185,129,0.35)",
            opacity: completing ? 0.6 : 1, transition: "all 0.3s",
          }}
        >{completing ? "Marking…" : "✓ Mark Complete"}</button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${borderC}`, paddingBottom: 0 }}>
        {tabs.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "10px 18px", fontSize: "0.84rem", fontWeight: 700,
                cursor: "pointer", transition: "all 0.2s", fontFamily: "Inter,sans-serif",
                background: "transparent", border: "none",
                color: active ? "#818cf8" : "var(--c-muted)",
                borderBottom: `2px solid ${active ? "#6366f1" : "transparent"}`,
                marginBottom: -1,
              }}
            >{tab.label}</button>
          );
        })}
      </div>

      {/* Content area */}
      <div style={{ ...cardStyle, padding: "28px 28px" }}>

        {/* ── Content Tab ── */}
        {activeTab === "content" && (
          <div>
            {decodedContent ? (
              <div style={{ color: "#c8d0df", fontSize: "0.9rem", lineHeight: 1.85 }}
                className="prose-dark"
                dangerouslySetInnerHTML={{ __html: decodedContent }}
              />
            ) : (
              <div style={{ textAlign: "center", padding: "40px 0", color: "var(--c-dim)" }}>
                <div style={{ fontSize: "2rem", marginBottom: 10 }}>📖</div>
                <p>No content available. Use the AI Explanation tab to learn more!</p>
              </div>
            )}
          </div>
        )}

        {/* ── Interview Q&A Tab ── */}
        {activeTab === "interview" && (
          <div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#e8edf5", fontFamily: "Outfit,sans-serif", marginBottom: 16 }}>Common Interview Questions</h2>
            {topic.interviewQuestions?.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {topic.interviewQuestions.map((item, i) => (
                  <div key={i} style={{
                    padding: "16px 18px", borderRadius: 14,
                    background: "rgba(7,8,15,0.5)", border: `1px solid ${borderC}`,
                    transition: "all 0.2s",
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <span style={{
                        padding: "2px 10px", borderRadius: 8, fontSize: "0.72rem", fontWeight: 800,
                        background: "rgba(99,102,241,0.12)", color: "#818cf8",
                        border: "1px solid rgba(99,102,241,0.25)", flexShrink: 0,
                      }}>Q{i + 1}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "#e8edf5" }}>{item.question}</p>
                        {item.answer && (
                          <details style={{ marginTop: 10 }}>
                            <summary style={{ cursor: "pointer", color: "#818cf8", fontSize: "0.82rem", fontWeight: 600 }}>Show Answer</summary>
                            <p style={{ marginTop: 8, color: "var(--c-muted)", fontSize: "0.85rem", lineHeight: 1.7, padding: "12px 14px", background: "rgba(99,102,241,0.05)", borderRadius: 10 }}>
                              {item.answer}
                            </p>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 0", color: "var(--c-dim)" }}>
                <p>No interview questions available. Use the AI Explanation tab to prepare!</p>
              </div>
            )}
          </div>
        )}

        {/* ── Quiz Tab ── */}
        {activeTab === "quiz" && (
          <div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#e8edf5", fontFamily: "Outfit,sans-serif", marginBottom: 16 }}>Practice Quiz</h2>
            {quizResult ? (
              <div>
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                  <div style={{ fontSize: "3rem", fontWeight: 900, color: scoreColor(quizResult), fontFamily: "Outfit,sans-serif" }}>
                    {quizResult.score}/{quizResult.total}
                  </div>
                  <p style={{ color: "var(--c-muted)", marginTop: 6 }}>
                    {quizResult.score / quizResult.total >= 0.7 ? "Great job! You've mastered this topic!" : "Keep practicing to improve!"}
                  </p>
                </div>

                {/* Results breakdown */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                  {quizResult.results?.map((r, idx) => (
                    <div key={idx} style={{
                      padding: "14px 16px", borderRadius: 12,
                      background: r.isCorrect ? "rgba(16,185,129,0.06)" : "rgba(244,63,94,0.06)",
                      border: `1px solid ${r.isCorrect ? "rgba(16,185,129,0.2)" : "rgba(244,63,94,0.2)"}`,
                    }}>
                      <p style={{ fontWeight: 600, fontSize: "0.88rem", color: "#e8edf5", marginBottom: 4 }}>Q{idx + 1}: {r.question}</p>
                      <p style={{ fontSize: "0.82rem", color: r.isCorrect ? "#10b981" : "#f43f5e" }}>
                        Your answer: {r.selectedAnswer !== undefined ? r.selectedAnswer : "Not answered"}
                      </p>
                      {!r.isCorrect && <p style={{ fontSize: "0.82rem", color: "#10b981", marginTop: 2 }}>Correct: {r.correctAnswer}</p>}
                      {r.explanation && <p style={{ fontSize: "0.8rem", color: "var(--c-muted)", marginTop: 6 }}>{r.explanation}</p>}
                    </div>
                  ))}
                </div>

                <button onClick={() => { setQuizResult(null); setQuizAnswers({}); }}
                  style={{
                    padding: "11px 24px", borderRadius: 12, border: "none",
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white",
                    fontWeight: 700, fontSize: "0.88rem", fontFamily: "Inter,sans-serif", cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
                  }}
                >🔄 Try Again</button>
              </div>
            ) : topic.quiz?.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {topic.quiz.map((q, i) => (
                  <div key={i}>
                    <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "#e8edf5", marginBottom: 10 }}>
                      <span style={{ color: "#818cf8" }}>Q{i + 1}.</span> {q.question}
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {q.options.map((opt, j) => {
                        const sel = quizAnswers[i] === j;
                        return (
                          <label key={j} style={{
                            display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                            borderRadius: 10, cursor: "pointer", transition: "all 0.2s",
                            background: sel ? "rgba(99,102,241,0.1)" : "rgba(7,8,15,0.4)",
                            border: `1px solid ${sel ? "rgba(99,102,241,0.35)" : borderC}`,
                            color: sel ? "#e8edf5" : "var(--c-muted)", fontSize: "0.85rem",
                          }}>
                            <input type="radio" name={`question-${i}`} value={j}
                              checked={sel} onChange={() => setQuizAnswers({ ...quizAnswers, [i]: j })}
                              style={{ accentColor: "#6366f1" }} />
                            {opt}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <button onClick={handleQuizSubmit}
                  style={{
                    padding: "12px", borderRadius: 12, border: "none",
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white",
                    fontWeight: 700, fontSize: "0.9rem", fontFamily: "Inter,sans-serif", cursor: "pointer",
                    boxShadow: "0 6px 18px rgba(99,102,241,0.35)",
                  }}
                >Submit Quiz</button>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 0", color: "var(--c-dim)" }}>
                <p>No quiz questions available for this topic.</p>
              </div>
            )}
          </div>
        )}

        {/* ── AI Tab ── */}
        {activeTab === "ai" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#e8edf5", fontFamily: "Outfit,sans-serif" }}>AI-Powered Explanation</h2>
              <button onClick={handleAIExplain} disabled={aiLoading}
                style={{
                  padding: "9px 22px", borderRadius: 10, border: "none",
                  background: aiLoading ? "rgba(139,92,246,0.3)" : "linear-gradient(135deg,#8b5cf6,#6366f1)",
                  color: "white", fontWeight: 700, fontSize: "0.84rem", fontFamily: "Inter,sans-serif",
                  cursor: aiLoading ? "not-allowed" : "pointer",
                  boxShadow: aiLoading ? "none" : "0 4px 14px rgba(139,92,246,0.35)",
                  display: "flex", alignItems: "center", gap: 8,
                }}
              >
                {aiLoading
                  ? <><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.75s linear infinite" }} />Generating…</>
                  : "✨ Get AI Explanation"
                }
              </button>
            </div>

            {aiLoading && (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ width: 40, height: 40, border: "3px solid rgba(99,102,241,0.2)", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.75s linear infinite", margin: "0 auto 14px" }} />
                <p style={{ color: "var(--c-muted)" }}>AI is thinking…</p>
              </div>
            )}

            {aiExplanation && !aiLoading && (
              <div style={{
                padding: "20px 22px", borderRadius: 14,
                background: "rgba(99,102,241,0.05)", border: `1px solid ${borderC}`,
              }}>
                <p style={{ color: "#c8d0df", fontSize: "0.88rem", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{aiExplanation}</p>
              </div>
            )}

            {!aiExplanation && !aiLoading && (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🤖</div>
                <p style={{ color: "var(--c-muted)", fontSize: "0.88rem" }}>Click "Get AI Explanation" for a personalized explanation.</p>
                <p style={{ color: "var(--c-dim)", fontSize: "0.78rem", marginTop: 6 }}>Powered by Groq AI</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicDetailPage;
