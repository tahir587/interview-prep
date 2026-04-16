import { useEffect, useState } from "react";
import { getSubjects } from "../../services/api";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { formatSubjectName } from "../../utils/subjectDisplay";

export default function ManageSubjects() {

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await getSubjects();
        setSubjects(res.data || []);
        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load subjects");
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton-loader" style={{ height: 280, borderRadius: 18 }} />
          ))}
        </div>
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
        background: "linear-gradient(135deg,rgba(139,92,246,0.18) 0%,rgba(168,85,247,0.12) 50%,rgba(99,102,241,0.08) 100%)",
        border: "1px solid rgba(168,85,247,0.25)", 
        borderRadius: 20, 
        padding: "28px 32px",
        position: "relative", 
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle,rgba(168,85,247,0.15) 0%,transparent 70%)", filter: "blur(30px)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#e8edf5", fontFamily: "Outfit,sans-serif", marginBottom: 6, letterSpacing: "-0.02em" }}>
            📚 Manage Subjects
          </h1>
          <p style={{ color: "var(--c-muted)", fontSize: "0.9rem" }}>
            View, manage and organize your CS subjects ({subjects.length} total)
          </p>
        </div>
      </div>

      {/* Subjects Grid or Empty State */}
      {subjects.length === 0 ? (
        <div style={{...cardStyle, padding: "80px 32px", textAlign: "center"}}>
          <div style={{ fontSize: "4rem", marginBottom: 20, opacity: 0.6 }}>📭</div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#e8edf5", marginBottom: 8, fontFamily: "Outfit,sans-serif" }}>
            No Subjects Found
          </h3>
          <p style={{ color: "var(--c-muted)", fontSize: "0.9rem", marginBottom: 24 }}>
            Create your first subject to get started
          </p>
          <Link
            to="/admin/add-subject"
            style={{
              display: "inline-block",
              background: "linear-gradient(135deg, rgba(168,85,247,0.3) 0%, rgba(139,92,246,0.2) 100%)",
              border: "1px solid rgba(168,85,247,0.4)",
              color: "#d8b4fe",
              padding: "12px 24px",
              borderRadius: 12,
              fontSize: "0.9rem",
              fontWeight: 700,
              textDecoration: "none",
              transition: "all 0.3s",
              boxShadow: "0 4px 12px rgba(168,85,247,0.1)",
            }}
            onMouseEnter={e => {
              e.target.style.background = "linear-gradient(135deg, rgba(168,85,247,0.4) 0%, rgba(139,92,246,0.3) 100%)";
              e.target.style.boxShadow = "0 8px 24px rgba(168,85,247,0.25)";
              e.target.style.border = "1px solid rgba(168,85,247,0.6)";
            }}
            onMouseLeave={e => {
              e.target.style.background = "linear-gradient(135deg, rgba(168,85,247,0.3) 0%, rgba(139,92,246,0.2) 100%)";
              e.target.style.boxShadow = "0 4px 12px rgba(168,85,247,0.1)";
              e.target.style.border = "1px solid rgba(168,85,247,0.4)";
            }}
          >
            ➕ Create First Subject
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {subjects.map(s => (
            <div
              key={s._id}
              style={{
                ...cardStyle,
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.3s",
                cursor: "pointer",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "rgba(168,85,247,0.4)";
                e.currentTarget.style.boxShadow = `0 12px 32px rgba(168,85,247,0.15)`;
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = borderC;
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* Card Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    fontSize: "1.1rem", 
                    fontWeight: 800, 
                    color: "#e8edf5", 
                    fontFamily: "Outfit,sans-serif",
                    marginBottom: 6,
                    letterSpacing: "-0.01em"
                  }}>
                    {formatSubjectName(s.name)}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--c-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      📝 Topics
                    </span>
                    <span style={{ 
                      display: "inline-block",
                      background: "rgba(168,85,247,0.2)",
                      color: "#d8b4fe",
                      padding: "4px 10px",
                      borderRadius: 20,
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      border: "1px solid rgba(168,85,247,0.3)"
                    }}>
                      {s.topics?.length || 0}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: "2.5rem", opacity: 0.9 }}>📚</div>
              </div>

              {/* Progress Bar */}
              <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: `1px solid ${borderC}` }}>
                <div style={{ 
                  height: 6, 
                  borderRadius: 99, 
                  background: "rgba(99,102,241,0.1)", 
                  overflow: "hidden",
                  marginBottom: 8
                }}>
                  <div style={{ 
                    height: "100%", 
                    width: `${Math.min(100, (s.topics?.length || 0) * 15)}%`,
                    background: "linear-gradient(90deg, #a855f7, #8b5cf6)",
                    borderRadius: 99,
                    transition: "width 0.8s ease"
                  }} />
                </div>
                <p style={{ fontSize: "0.75rem", color: "var(--c-dim)" }}>
                  Content coverage
                </p>
              </div>

              {/* Add Topic Button */}
              <Link
                to={`/admin/subjects/${s._id}/add-topic`}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 12,
                  background: "rgba(168,85,247,0.15)",
                  border: "1px solid rgba(168,85,247,0.3)",
                  color: "#d8b4fe",
                  textDecoration: "none",
                  textAlign: "center",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  transition: "all 0.3s",
                  display: "block",
                  cursor: "pointer",
                }}
                onMouseEnter={e => {
                  e.target.style.background = "rgba(168,85,247,0.25)";
                  e.target.style.borderColor = "rgba(168,85,247,0.5)";
                  e.target.style.boxShadow = "0 0 12px rgba(168,85,247,0.2)";
                }}
                onMouseLeave={e => {
                  e.target.style.background = "rgba(168,85,247,0.15)";
                  e.target.style.borderColor = "rgba(168,85,247,0.3)";
                  e.target.style.boxShadow = "none";
                }}
              >
                ➕ Add Topic
              </Link>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}