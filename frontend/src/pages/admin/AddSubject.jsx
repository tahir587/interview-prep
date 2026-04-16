import { useState } from "react";
import { createSubject } from "../../services/api";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

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

export default function AddSubject() {

  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const submit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Please enter a subject name");
      return;
    }

    try {
      const res = await createSubject(form);
      console.log(res);
      toast.success("Subject Added Successfully");
      setForm({
        name: "",
        description: "",
      });
      navigate("/admin/subjects");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add subject");
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
    border: "1px solid rgba(168,85,247,0.2)",
    borderRadius: 12,
    padding: "12px 16px",
    color: "#e8edf5",
    fontSize: "0.9rem",
    fontFamily: "Inter,sans-serif",
    outline: "none",
    transition: "all 0.3s",
  };

  const handleInputFocus = (e) => {
    e.target.style.borderColor = "#a855f7";
    e.target.style.boxShadow = "0 0 0 3px rgba(168,85,247,0.15)";
    e.target.style.background = "rgba(7,8,15,0.7)";
  };

  const handleInputBlur = (e) => {
    e.target.style.borderColor = "rgba(168,85,247,0.2)";
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
        background: "linear-gradient(135deg,rgba(168,85,247,0.18) 0%,rgba(139,92,246,0.12) 50%,rgba(99,102,241,0.08) 100%)",
        border: "1px solid rgba(168,85,247,0.25)", 
        borderRadius: 20, 
        padding: "28px 32px",
        position: "relative", 
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle,rgba(168,85,247,0.15) 0%,transparent 70%)", filter: "blur(30px)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#e8edf5", fontFamily: "Outfit,sans-serif", marginBottom: 6, letterSpacing: "-0.02em" }}>
            📚 Add New Subject
          </h1>
          <p style={{ color: "var(--c-muted)", fontSize: "0.9rem" }}>
            Create a new CS subject for interview preparation
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div style={{...cardStyle, padding: "32px 36px"}}>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Subject Name */}
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
              Subject Name
            </label>
            <input
              placeholder="e.g., Operating Systems"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
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
            <div style={{
              background: "rgba(7,8,15,0.5)",
              border: "1px solid rgba(168,85,247,0.2)",
              borderRadius: 12,
              transition: "all 0.3s",
              overflow: "hidden",
            }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "rgba(168,85,247,0.4)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(168,85,247,0.1)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "rgba(168,85,247,0.2)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <ReactQuill
                theme="snow"
                value={form.description}
                onChange={(value) => setForm({ ...form, description: value })}
                modules={modules}
                style={{ background: "transparent", color: "#e8edf5" }}
              />
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--c-dim)", marginTop: 8 }}>
              Optional. Add subject details using rich text formatting.
            </p>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <button
              type="submit"
              style={{
                flex: 1,
                background: "linear-gradient(135deg, rgba(168,85,247,0.3) 0%, rgba(139,92,246,0.2) 100%)",
                border: "1px solid rgba(168,85,247,0.4)",
                color: "#d8b4fe",
                padding: "14px 24px",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: "pointer",
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
              ✅ Add Subject
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/subjects")}
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
          border: 1px solid rgba(168, 85, 247, 0.2) !important;
          border-bottom: 1px solid rgba(168, 85, 247, 0.2) !important;
          border-radius: 8px 8px 0 0 !important;
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
          color: #a855f7 !important;
        }
        
        .ql-toolbar button:hover .ql-stroke,
        .ql-toolbar button.ql-active .ql-stroke {
          stroke: #a855f7 !important;
        }
        
        .ql-toolbar button:hover .ql-fill,
        .ql-toolbar button.ql-active .ql-fill {
          fill: #a855f7 !important;
        }
      `}</style>

    </div>
  );
}
