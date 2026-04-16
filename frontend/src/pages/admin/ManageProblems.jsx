import React, { useEffect, useState } from "react";
import API from "../../services/api";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const ManageProblems = () => {

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchProblems = async () => {
    try {
      const res = await API.get("/problems");
      setProblems(res.data.problems || res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load problems");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const deleteProblem = async (id) => {
    try {
      await API.delete(`/problems/${id}`);
      setProblems(problems.filter(p => p._id !== id));
      toast.success("Problem deleted successfully");
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete problem");
    }
  };

  const filteredProblems = problems.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const borderC = "rgba(99,102,241,0.18)";
  const cardStyle = { 
    background: "rgba(13,17,23,0.82)", 
    border: `1px solid ${borderC}`, 
    borderRadius: 18, 
    backdropFilter: "blur(14px)" 
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
        <div className="skeleton-loader" style={{ height: 400, borderRadius: 18 }} />
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
            📋 Manage DSA Problems
          </h1>
          <p style={{ color: "var(--c-muted)", fontSize: "0.9rem" }}>
            Edit, delete or manage all DSA problems ({filteredProblems.length} total)
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{...cardStyle, padding: "16px 20px"}}>
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <span style={{ position: "absolute", left: 14, color: "var(--c-muted)", fontSize: "1.1rem" }}>🔍</span>
          <input
            type="text"
            placeholder="Search by title or topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              background: "rgba(7,8,15,0.5)",
              border: "1px solid rgba(99,102,241,0.2)",
              borderRadius: 12,
              padding: "12px 16px 12px 40px",
              color: "#e8edf5",
              fontSize: "0.9rem",
              fontFamily: "Inter,sans-serif",
              outline: "none",
              transition: "all 0.3s",
            }}
            onFocus={e => { 
              e.target.style.borderColor = "#6366f1"; 
              e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.15)";
              e.target.style.background = "rgba(7,8,15,0.7)";
            }}
            onBlur={e => { 
              e.target.style.borderColor = "rgba(99,102,241,0.2)"; 
              e.target.style.boxShadow = "none";
              e.target.style.background = "rgba(7,8,15,0.5)";
            }}
          />
        </div>
      </div>

      {/* Problems List or Empty State */}
      {filteredProblems.length === 0 ? (
        <div style={{...cardStyle, padding: "60px 32px", textAlign: "center"}}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>📭</div>
          <p style={{ color: "var(--c-muted)", fontSize: "0.95rem", marginBottom: 24 }}>
            {searchTerm ? "No problems match your search" : "No problems found"}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              style={{
                background: "rgba(99,102,241,0.2)",
                border: "1px solid rgba(99,102,241,0.3)",
                color: "#818cf8",
                padding: "8px 16px",
                borderRadius: 8,
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.3s",
              }}
              onMouseEnter={e => {
                e.target.style.background = "rgba(99,102,241,0.35)";
                e.target.style.boxShadow = "0 0 16px rgba(99,102,241,0.25)";
              }}
              onMouseLeave={e => {
                e.target.style.background = "rgba(99,102,241,0.2)";
                e.target.style.boxShadow = "none";
              }}
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div style={{...cardStyle, overflow: "hidden"}}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", fontSize: "0.9rem", borderCollapse: "collapse" }}>
              <thead style={{ borderBottom: `1px solid ${borderC}`, background: "rgba(7,8,15,0.3)" }}>
                <tr>
                  <th style={{ padding: "18px 20px", textAlign: "left", fontWeight: 700, color: "#e8edf5", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Title</th>
                  <th style={{ padding: "18px 20px", textAlign: "center", fontWeight: 700, color: "#e8edf5", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Difficulty</th>
                  <th style={{ padding: "18px 20px", textAlign: "center", fontWeight: 700, color: "#e8edf5", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Topic</th>
                  <th style={{ padding: "18px 20px", textAlign: "center", fontWeight: 700, color: "#e8edf5", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Platform</th>
                  <th style={{ padding: "18px 20px", textAlign: "center", fontWeight: 700, color: "#e8edf5", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProblems.map((p, idx) => (
                  <tr
                    key={p._id}
                    style={{
                      borderBottom: `1px solid ${borderC}`,
                      transition: "all 0.2s",
                      background: idx % 2 === 0 ? "transparent" : "rgba(99,102,241,0.03)",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "rgba(99,102,241,0.08)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = idx % 2 === 0 ? "transparent" : "rgba(99,102,241,0.03)";
                    }}
                  >
                    <td style={{ padding: "16px 20px", fontWeight: 600, color: "#e8edf5" }}>
                      {p.title}
                    </td>
                    <td style={{ padding: "16px 20px", textAlign: "center" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "6px 12px",
                          borderRadius: 20,
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          border: "1px solid",
                          ...(p.difficulty === "Easy"
                            ? { background: "rgba(16,185,129,0.15)", color: "#10b981", borderColor: "rgba(16,185,129,0.3)" }
                            : p.difficulty === "Medium"
                            ? { background: "rgba(245,158,11,0.15)", color: "#f59e0b", borderColor: "rgba(245,158,11,0.3)" }
                            : { background: "rgba(239,68,68,0.15)", color: "#ef4444", borderColor: "rgba(239,68,68,0.3)" })
                        }}
                      >
                        {p.difficulty}
                      </span>
                    </td>
                    <td style={{ padding: "16px 20px", textAlign: "center", color: "var(--c-muted)" }}>
                      {p.topic}
                    </td>
                    <td style={{ padding: "16px 20px", textAlign: "center", fontSize: "0.8rem", color: "var(--c-muted)", fontWeight: 500 }}>
                      {p.platform}
                    </td>
                    <td style={{ padding: "16px 20px", textAlign: "center" }}>
                      <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                        <Link
                          to={`/admin/edit-problem/${p._id}`}
                          style={{
                            padding: "6px 14px",
                            background: "rgba(99,102,241,0.15)",
                            color: "#818cf8",
                            border: "1px solid rgba(99,102,241,0.3)",
                            borderRadius: 8,
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            textDecoration: "none",
                            transition: "all 0.2s",
                            display: "inline-block",
                            cursor: "pointer",
                          }}
                          onMouseEnter={e => {
                            e.target.style.background = "rgba(99,102,241,0.25)";
                            e.target.style.borderColor = "rgba(99,102,241,0.5)";
                            e.target.style.boxShadow = "0 0 12px rgba(99,102,241,0.2)";
                          }}
                          onMouseLeave={e => {
                            e.target.style.background = "rgba(99,102,241,0.15)";
                            e.target.style.borderColor = "rgba(99,102,241,0.3)";
                            e.target.style.boxShadow = "none";
                          }}
                        >
                          ✏️ Edit
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm(p._id)}
                          style={{
                            padding: "6px 14px",
                            background: "rgba(239,68,68,0.15)",
                            color: "#f87171",
                            border: "1px solid rgba(239,68,68,0.3)",
                            borderRadius: 8,
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            transition: "all 0.2s",
                            cursor: "pointer",
                          }}
                          onMouseEnter={e => {
                            e.target.style.background = "rgba(239,68,68,0.25)";
                            e.target.style.borderColor = "rgba(239,68,68,0.5)";
                            e.target.style.boxShadow = "0 0 12px rgba(239,68,68,0.2)";
                          }}
                          onMouseLeave={e => {
                            e.target.style.background = "rgba(239,68,68,0.15)";
                            e.target.style.borderColor = "rgba(239,68,68,0.3)";
                            e.target.style.boxShadow = "none";
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 50,
          padding: 16,
          backdropFilter: "blur(8px)",
        }}>
          <div style={{...cardStyle, padding: "28px 32px", maxWidth: 420, width: "100%", animation: "slideIn 0.3s ease-out"}}>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>⚠️</div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 900, color: "#e8edf5", fontFamily: "Outfit,sans-serif" }}>Delete Problem?</h3>
            </div>
            <p style={{ color: "var(--c-muted)", marginBottom: 24, lineHeight: 1.6 }}>
              Are you sure you want to delete this problem? This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  flex: 1,
                  padding: "12px 20px",
                  borderRadius: 12,
                  fontWeight: 700,
                  background: "rgba(99,102,241,0.1)",
                  border: "1px solid rgba(99,102,241,0.2)",
                  color: "#818cf8",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontSize: "0.9rem",
                }}
                onMouseEnter={e => {
                  e.target.style.background = "rgba(99,102,241,0.2)";
                }}
                onMouseLeave={e => {
                  e.target.style.background = "rgba(99,102,241,0.1)";
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteProblem(deleteConfirm)}
                style={{
                  flex: 1,
                  padding: "12px 20px",
                  borderRadius: 12,
                  fontWeight: 700,
                  background: "rgba(239,68,68,0.2)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "#f87171",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontSize: "0.9rem",
                }}
                onMouseEnter={e => {
                  e.target.style.background = "rgba(239,68,68,0.35)";
                  e.target.style.boxShadow = "0 0 16px rgba(239,68,68,0.2)";
                }}
                onMouseLeave={e => {
                  e.target.style.background = "rgba(239,68,68,0.2)";
                  e.target.style.boxShadow = "none";
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageProblems;