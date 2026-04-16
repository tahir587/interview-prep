import React, { useEffect, useState } from "react";
import API from "../../services/api";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const EditProblem = () => {

  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await API.get("/problems");
        const problem = res.data.problems.find(p => p._id === id);
        setForm(problem || {});
        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || "Failed to load problem");
        setLoading(false);
      }
    };
    fetchProblem();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/problems/${id}`, form);
      toast.success("Problem Updated Successfully");
      navigate("/admin/problems");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update problem");
    }
  };

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
        <div className="skeleton-loader" style={{ height: 110, borderRadius: 18 }} />
        <div className="skeleton-loader" style={{ height: 500, borderRadius: 18 }} />
      </div>
    );
  }

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
            ✏️ Edit DSA Problem
          </h1>
          <p style={{ color: "var(--c-muted)", fontSize: "0.9rem" }}>
            Update problem details and information
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div style={{...cardStyle, padding: "32px 36px"}}>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Title */}
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
              Problem Title
            </label>

            <input
              name="title"
              placeholder="e.g., Two Sum"
              value={form.title || ""}
              onChange={handleChange}
              required
              style={inputStyle}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>

          {/* Difficulty + Platform */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>

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
                Difficulty
              </label>

              <select
                name="difficulty"
                value={form.difficulty || ""}
                onChange={handleChange}
                style={inputStyle}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

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
                Platform
              </label>

              <select
                name="platform"
                value={form.platform || ""}
                onChange={handleChange}
                style={inputStyle}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              >
                <option value="LeetCode">LeetCode</option>
                <option value="GeeksforGeeks">GeeksforGeeks</option>
              </select>
            </div>

          </div>

          {/* Topic */}
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
              Topic
            </label>

            <input
              name="topic"
              placeholder="e.g., Array, Dynamic Programming"
              value={form.topic || ""}
              onChange={handleChange}
              style={inputStyle}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>

          {/* URL */}
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
              Problem URL
            </label>

            <input
              name="externalUrl"
              placeholder="https://leetcode.com/problems/two-sum"
              value={form.externalUrl || ""}
              onChange={handleChange}
              style={inputStyle}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>

          {/* Description */}
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
              Description
            </label>

            <textarea
              name="description"
              rows="4"
              placeholder="Optional description..."
              value={form.description || ""}
              onChange={handleChange}
              style={{...inputStyle, resize: "vertical", minHeight: "120px"}}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>

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
              ✅ Update Problem
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/problems")}
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

    </div>
  );
};

export default EditProblem;