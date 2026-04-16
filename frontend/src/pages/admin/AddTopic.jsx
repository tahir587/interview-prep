import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { addTopic } from "../../services/api";
import { toast } from "react-toastify";

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["code-block"],
    ["link"],
    ["clean"],
  ],
};

export default function AddTopic() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [activeTab, setActiveTab] = useState("content");

  // Interview Questions
  const [interviewQuestions, setInterviewQuestions] = useState([
    { question: "", answer: "" }
  ]);

  // Quiz Questions
  const [quizQuestions, setQuizQuestions] = useState([
    {
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: ""
    }
  ]);

  const addInterviewQuestion = () => {
    setInterviewQuestions([...interviewQuestions, { question: "", answer: "" }]);
  };

  const removeInterviewQuestion = (index) => {
    setInterviewQuestions(interviewQuestions.filter((_, i) => i !== index));
  };

  const updateInterviewQuestion = (index, field, value) => {
    const updated = [...interviewQuestions];
    updated[index][field] = value;
    setInterviewQuestions(updated);
  };

  const addQuizQuestion = () => {
    setQuizQuestions([...quizQuestions, {
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: ""
    }]);
  };

  const removeQuizQuestion = (index) => {
    setQuizQuestions(quizQuestions.filter((_, i) => i !== index));
  };

  const updateQuizQuestion = (index, field, value) => {
    const updated = [...quizQuestions];
    updated[index][field] = value;
    setQuizQuestions(updated);
  };

  const updateQuizOption = (qIndex, optIndex, value) => {
    const updated = [...quizQuestions];
    updated[qIndex].options[optIndex] = value;
    setQuizQuestions(updated);
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a topic title");
      return;
    }

    try {
      // Filter out empty questions
      const filteredInterviewQuestions = interviewQuestions.filter(
        q => q.question.trim() !== ""
      );

      const filteredQuizQuestions = quizQuestions.filter(
        q => q.question.trim() !== "" && q.options.some(o => o.trim() !== "")
      );

      await addTopic(id, {
        title,
        content,
        interviewQuestions: filteredInterviewQuestions,
        quiz: filteredQuizQuestions
      });

      toast.success("Topic Added Successfully");

      // Reset form
      setTitle("");
      setContent("");
      setInterviewQuestions([{ question: "", answer: "" }]);
      setQuizQuestions([{
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        explanation: ""
      }]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add topic");
    }
  };

  const tabs = [
    { id: "content", label: "📖 Content" },
    { id: "interview", label: "🎤 Interview Q&A" },
    { id: "quiz", label: "✍️ Quiz Questions" },
  ];

  const borderC = "rgba(99,102,241,0.18)";
  const cardStyle = { 
    background: "rgba(13,17,23,0.82)", 
    border: `1px solid ${borderC}`, 
    borderRadius: 18, 
    backdropFilter: "blur(14px)" 
  };

  const inputStyle = {
    width: "100%",
    background: "rgba(7,8,15,0.5)",
    border: "1px solid rgba(99,102,241,0.2)",
    borderRadius: 12,
    padding: "12px 16px",
    color: "#e8edf5",
    fontSize: "0.9rem",
    fontFamily: "Inter,sans-serif",
    outline: "none",
    transition: "all 0.3s",
  };

  const handleInputFocus = (e) => {
    e.target.style.borderColor = "#6366f1";
    e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.15)";
    e.target.style.background = "rgba(7,8,15,0.7)";
  };

  const handleInputBlur = (e) => {
    e.target.style.borderColor = "rgba(99,102,241,0.2)";
    e.target.style.boxShadow = "none";
    e.target.style.background = "rgba(7,8,15,0.5)";
  };

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

      {/* Header */}
      <div className="animate-fade-in" style={{
        background: "linear-gradient(135deg,rgba(99,102,241,0.18) 0%,rgba(139,92,246,0.12) 50%,rgba(6,182,212,0.08) 100%)",
        border: "1px solid rgba(99,102,241,0.25)", 
        borderRadius: 20, 
        padding: "28px 32px",
        position: "relative", 
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle,rgba(139,92,246,0.15) 0%,transparent 70%)", filter: "blur(30px)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#e8edf5", fontFamily: "Outfit,sans-serif", marginBottom: 6, letterSpacing: "-0.02em" }}>
            ➕ Add New Topic
          </h1>
          <p style={{ color: "var(--c-muted)", fontSize: "0.9rem" }}>
            Create content, interview Q&A, and quiz questions for this subject
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div style={{...cardStyle, padding: "32px 36px"}}>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Title Input */}
          <div>
            <label style={{ 
              display: "block", 
              fontSize: "0.85rem", 
              fontWeight: 700, 
              color: "#e8edf5",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 10,
              textShadow: "0 1px 2px rgba(0,0,0,0.3)"
            }}>
              Topic Title
            </label>
            <input
              placeholder="e.g., Binary Trees, Recursion, Dynamic Programming"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={inputStyle}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>

          {/* Tabs */}
          <div style={{ 
            borderBottom: `1px solid ${borderC}`,
            display: "flex",
            gap: 0,
            marginBottom: -24,
            marginLeft: -36,
            marginRight: -36,
            paddingLeft: 36,
            paddingRight: 36,
            paddingBottom: 24,
          }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "12px 20px",
                  borderBottom: activeTab === tab.id ? "2px solid #6366f1" : "2px solid transparent",
                  background: "transparent",
                  color: activeTab === tab.id ? "#818cf8" : "var(--c-muted)",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.3s",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
                onMouseEnter={e => {
                  if (activeTab !== tab.id) {
                    e.target.style.color = "#e8edf5";
                  }
                }}
                onMouseLeave={e => {
                  if (activeTab !== tab.id) {
                    e.target.style.color = "var(--c-muted)";
                  }
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Tab */}
          {activeTab === "content" && (
            <div>
              <label style={{ 
                display: "block", 
                fontSize: "0.85rem", 
                fontWeight: 700, 
                color: "#e8edf5",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: 10,
              }}>
                Topic Content
              </label>
              <div style={{
                background: "rgba(7,8,15,0.5)",
                border: "1px solid rgba(99,102,241,0.2)",
                borderRadius: 12,
                transition: "all 0.3s",
                overflow: "hidden",
              }}>
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  modules={modules}
                  style={{ background: "transparent", color: "#e8edf5" }}
                />
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--c-dim)", marginTop: 8 }}>
                Add rich content with formatting, code blocks, and links
              </p>
            </div>
          )}

          {/* Interview Questions Tab */}
          {activeTab === "interview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <p style={{ color: "var(--c-muted)", fontSize: "0.9rem" }}>
                Add common interview questions and their answers for this topic.
              </p>
              {interviewQuestions.map((iq, index) => (
                <div key={index} style={{
                  ...cardStyle,
                  padding: "20px",
                  border: `1px solid rgba(99,102,241,0.3)`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <span style={{ fontWeight: 700, color: "#e8edf5", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Question {index + 1}
                    </span>
                    {interviewQuestions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInterviewQuestion(index)}
                        style={{
                          background: "rgba(239,68,68,0.15)",
                          border: "1px solid rgba(239,68,68,0.3)",
                          color: "#f87171",
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          padding: "6px 12px",
                          borderRadius: 8,
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={e => {
                          e.target.style.background = "rgba(239,68,68,0.25)";
                          e.target.style.boxShadow = "0 0 12px rgba(239,68,68,0.2)";
                        }}
                        onMouseLeave={e => {
                          e.target.style.background = "rgba(239,68,68,0.15)";
                          e.target.style.boxShadow = "none";
                        }}
                      >
                        🗑️ Remove
                      </button>
                    )}
                  </div>
                  <input
                    placeholder="Enter interview question..."
                    value={iq.question}
                    onChange={(e) => updateInterviewQuestion(index, "question", e.target.value)}
                    style={{...inputStyle, marginBottom: 12}}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />
                  <textarea
                    placeholder="Enter detailed answer..."
                    value={iq.answer}
                    onChange={(e) => updateInterviewQuestion(index, "answer", e.target.value)}
                    style={{...inputStyle, resize: "vertical", minHeight: "100px"}}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addInterviewQuestion}
                style={{
                  background: "linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(6,182,212,0.15) 100%)",
                  border: "1px solid rgba(16,185,129,0.3)",
                  color: "#6ee7b7",
                  padding: "12px 20px",
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
                onMouseEnter={e => {
                  e.target.style.background = "linear-gradient(135deg, rgba(16,185,129,0.3) 0%, rgba(6,182,212,0.25) 100%)";
                  e.target.style.boxShadow = "0 0 16px rgba(16,185,129,0.2)";
                }}
                onMouseLeave={e => {
                  e.target.style.background = "linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(6,182,212,0.15) 100%)";
                  e.target.style.boxShadow = "none";
                }}
              >
                ➕ Add Interview Question
              </button>
            </div>
          )}

          {/* Quiz Questions Tab */}
          {activeTab === "quiz" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <p style={{ color: "var(--c-muted)", fontSize: "0.9rem" }}>
                Add quiz questions with multiple choice options. Mark the correct answer with radio buttons.
              </p>
              {quizQuestions.map((q, index) => (
                <div key={index} style={{
                  ...cardStyle,
                  padding: "20px",
                  border: `1px solid rgba(99,102,241,0.3)`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <span style={{ fontWeight: 700, color: "#e8edf5", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Question {index + 1}
                    </span>
                    {quizQuestions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuizQuestion(index)}
                        style={{
                          background: "rgba(239,68,68,0.15)",
                          border: "1px solid rgba(239,68,68,0.3)",
                          color: "#f87171",
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          padding: "6px 12px",
                          borderRadius: 8,
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={e => {
                          e.target.style.background = "rgba(239,68,68,0.25)";
                          e.target.style.boxShadow = "0 0 12px rgba(239,68,68,0.2)";
                        }}
                        onMouseLeave={e => {
                          e.target.style.background = "rgba(239,68,68,0.15)";
                          e.target.style.boxShadow = "none";
                        }}
                      >
                        🗑️ Remove
                      </button>
                    )}
                  </div>
                  <input
                    placeholder="Enter quiz question..."
                    value={q.question}
                    onChange={(e) => updateQuizQuestion(index, "question", e.target.value)}
                    style={{...inputStyle, marginBottom: 16}}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />

                  <div style={{ marginBottom: 16 }}>
                    <p style={{ fontWeight: 700, fontSize: "0.85rem", color: "#e8edf5", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
                      ✓ Options (Select Correct Answer):
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {q.options.map((opt, optIndex) => (
                        <div key={optIndex} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <input
                            type="radio"
                            name={`correct-${index}`}
                            checked={q.correctAnswer === optIndex}
                            onChange={() => updateQuizQuestion(index, "correctAnswer", optIndex)}
                            style={{
                              width: 20,
                              height: 20,
                              cursor: "pointer",
                              accentColor: "#6366f1",
                              flexShrink: 0,
                            }}
                          />
                          <input
                            placeholder={`Option ${optIndex + 1}`}
                            value={opt}
                            onChange={(e) => updateQuizOption(index, optIndex, e.target.value)}
                            style={{...inputStyle, flex: 1}}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <textarea
                    placeholder="Explanation for the correct answer (optional)..."
                    value={q.explanation}
                    onChange={(e) => updateQuizQuestion(index, "explanation", e.target.value)}
                    style={{...inputStyle, resize: "vertical", minHeight: "80px"}}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addQuizQuestion}
                style={{
                  background: "linear-gradient(135deg, rgba(168,85,247,0.2) 0%, rgba(139,92,246,0.15) 100%)",
                  border: "1px solid rgba(168,85,247,0.3)",
                  color: "#d8b4fe",
                  padding: "12px 20px",
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
                onMouseEnter={e => {
                  e.target.style.background = "linear-gradient(135deg, rgba(168,85,247,0.3) 0%, rgba(139,92,246,0.25) 100%)";
                  e.target.style.boxShadow = "0 0 16px rgba(168,85,247,0.2)";
                }}
                onMouseLeave={e => {
                  e.target.style.background = "linear-gradient(135deg, rgba(168,85,247,0.2) 0%, rgba(139,92,246,0.15) 100%)";
                  e.target.style.boxShadow = "none";
                }}
              >
                ➕ Add Quiz Question
              </button>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <button
              type="submit"
              style={{
                flex: 1,
                background: "linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(139,92,246,0.2) 100%)",
                border: "1px solid rgba(99,102,241,0.4)",
                color: "#818cf8",
                padding: "14px 24px",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: "pointer",
                transition: "all 0.3s",
                boxShadow: "0 4px 12px rgba(99,102,241,0.1)",
              }}
              onMouseEnter={e => {
                e.target.style.background = "linear-gradient(135deg, rgba(99,102,241,0.4) 0%, rgba(139,92,246,0.3) 100%)";
                e.target.style.boxShadow = "0 8px 24px rgba(99,102,241,0.25)";
                e.target.style.border = "1px solid rgba(99,102,241,0.6)";
              }}
              onMouseLeave={e => {
                e.target.style.background = "linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(139,92,246,0.2) 100%)";
                e.target.style.boxShadow = "0 4px 12px rgba(99,102,241,0.1)";
                e.target.style.border = "1px solid rgba(99,102,241,0.4)";
              }}
            >
              ✅ Add Topic
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                flex: 1,
                background: "rgba(99,102,241,0.1)",
                border: "1px solid rgba(99,102,241,0.2)",
                color: "#818cf8",
                padding: "14px 24px",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
              onMouseEnter={e => {
                e.target.style.background = "rgba(99,102,241,0.2)";
                e.target.style.borderColor = "rgba(99,102,241,0.4)";
              }}
              onMouseLeave={e => {
                e.target.style.background = "rgba(99,102,241,0.1)";
                e.target.style.borderColor = "rgba(99,102,241,0.2)";
              }}
            >
              ← Cancel
            </button>
          </div>

        </form>

      </div>

      <style>{`
        .ql-toolbar {
          background: rgba(7, 8, 15, 0.5) !important;
          border: none !important;
          border-radius: 8px 8px 0 0 !important;
          padding: 8px !important;
        }
        
        .ql-container {
          background: rgba(7, 8, 15, 0.5) !important;
          border: none !important;
          border-radius: 0 0 8px 8px !important;
          font-family: Inter, sans-serif !important;
        }
        
        .ql-editor {
          color: #e8edf5 !important;
          min-height: 200px !important;
          padding: 16px !important;
        }
        
        .ql-editor.ql-blank::before {
          color: var(--c-muted) !important;
          font-style: italic !important;
        }
        
        .ql-toolbar .ql-stroke {
          stroke: var(--c-muted) !important;
        }
        
        .ql-toolbar .ql-fill,
        .ql-toolbar .ql-picker-label {
          fill: var(--c-muted) !important;
        }
        
        .ql-toolbar button:hover,
        .ql-toolbar button.ql-active,
        .ql-toolbar button:focus {
          color: #6366f1 !important;
        }
        
        .ql-toolbar button:hover .ql-stroke,
        .ql-toolbar button.ql-active .ql-stroke {
          stroke: #6366f1 !important;
        }
        
        .ql-toolbar button:hover .ql-fill,
        .ql-toolbar button.ql-active .ql-fill {
          fill: #6366f1 !important;
        }
      `}</style>

    </div>
  );
}

