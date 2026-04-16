import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../services/api";

const COMPANIES = ["Google","Amazon","Microsoft","Meta","Apple","Netflix","Flipkart","Infosys","TCS","Wipro"];
const borderC = "rgba(99,102,241,0.18)";

const inputStyle = {
  width: "100%", padding: "12px 14px", background: "rgba(7,8,15,0.7)",
  border: `1px solid ${borderC}`, borderRadius: 10, color: "#e8edf5",
  fontSize: "0.9rem", fontFamily: "Inter,sans-serif", outline: "none", transition: "all 0.3s",
};

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", targetCompanies: user?.targetCompanies || [] });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const toggleCompany = (c) => setForm(f => ({
    ...f, targetCompanies: f.targetCompanies.includes(c) ? f.targetCompanies.filter(x => x !== c) : [...f.targetCompanies, c],
  }));

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try { const res = await updateProfile(form); updateUser(res.data); setSuccess(true); setTimeout(() => setSuccess(false), 3000); }
    catch (err) { alert(err.response?.data?.message || "Update failed"); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Header */}
      <div className="animate-fade-in" style={{
        background: "linear-gradient(135deg,rgba(99,102,241,0.18) 0%,rgba(139,92,246,0.12) 50%,rgba(6,182,212,0.08) 100%)",
        border: "1px solid rgba(99,102,241,0.25)", borderRadius: 20, padding: "24px 28px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.15) 0%,transparent 70%)", filter: "blur(25px)", pointerEvents: "none" }} />
        <h1 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#e8edf5", fontFamily: "Outfit,sans-serif", marginBottom: 4, position: "relative" }}>👤 Profile Settings</h1>
        <p style={{ color: "var(--c-muted)", fontSize: "0.85rem", position: "relative" }}>Manage your information and target companies</p>
      </div>

      {/* Card */}
      <div style={{
        background: "rgba(13,17,23,0.85)", border: `1px solid ${borderC}`,
        borderRadius: 20, padding: "28px 28px 32px", backdropFilter: "blur(14px)",
      }}>
        {/* Profile avatar row */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28, paddingBottom: 20, borderBottom: `1px solid ${borderC}` }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white",
            fontWeight: 900, fontSize: "1.3rem", fontFamily: "Outfit,sans-serif",
            boxShadow: "0 0 18px rgba(99,102,241,0.45)",
          }}>{user?.name?.charAt(0)?.toUpperCase() || "?"}</div>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: "1.05rem", color: "#e8edf5" }}>{user?.name}</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--c-muted)" }}>{user?.email}</p>
          </div>
        </div>

        {/* Success */}
        {success && (
          <div style={{
            padding: "10px 14px", marginBottom: 18, borderRadius: 10,
            background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)",
            color: "#10b981", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 8,
          }}>✓ Profile updated successfully!</div>
        )}

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Name */}
          <div>
            <label style={{ display: "block", fontSize: "0.73rem", fontWeight: 700, color: "var(--c-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 7 }}>Full Name</label>
            <input type="text" value={form.name} required
              onChange={e => setForm({ ...form, name: e.target.value })}
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.15)"; }}
              onBlur={e => { e.target.style.borderColor = borderC; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {/* Email (readonly) */}
          <div>
            <label style={{ display: "block", fontSize: "0.73rem", fontWeight: 700, color: "var(--c-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 7 }}>Email <span style={{ color: "var(--c-dim)" }}>(cannot be changed)</span></label>
            <input type="email" value={user?.email} disabled
              style={{ ...inputStyle, opacity: 0.5, cursor: "not-allowed" }}
            />
          </div>

          {/* Target Companies */}
          <div>
            <label style={{ display: "block", fontSize: "0.73rem", fontWeight: 700, color: "var(--c-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Target Companies</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {COMPANIES.map(c => {
                const sel = form.targetCompanies.includes(c);
                return (
                  <button key={c} type="button" onClick={() => toggleCompany(c)}
                    style={{
                      padding: "6px 16px", borderRadius: 99, fontSize: "0.8rem", fontWeight: 600,
                      cursor: "pointer", transition: "all 0.2s", fontFamily: "Inter,sans-serif",
                      background: sel ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(26,37,64,0.5)",
                      color: sel ? "white" : "var(--c-muted)",
                      border: `1px solid ${sel ? "rgba(99,102,241,0.5)" : borderC}`,
                      boxShadow: sel ? "0 4px 12px rgba(99,102,241,0.3)" : "none",
                    }}
                  >{c}</button>
                );
              })}
            </div>
          </div>

          {/* Save */}
          <button type="submit" disabled={saving}
            style={{
              marginTop: 4, padding: "13px", borderRadius: 12, border: "none",
              background: saving ? "rgba(99,102,241,0.4)" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
              color: "white", fontWeight: 700, fontSize: "0.95rem", fontFamily: "Inter,sans-serif",
              cursor: saving ? "not-allowed" : "pointer",
              boxShadow: saving ? "none" : "0 6px 20px rgba(99,102,241,0.4)",
              transition: "all 0.3s",
            }}
          >
            {saving
              ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.75s linear infinite" }} />
                  Saving…
                </span>
              : "💾 Save Changes"
            }
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;