import React, { useEffect, useState, useCallback } from "react";
import { getProblems, getCompanies, getTopics, markSolved, unmarkSolved, getSolvedIds } from "../services/api";
import { useSearchParams } from "react-router-dom";

const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];
const PLATFORMS = ["All", "LeetCode", "GeeksforGeeks"];
const DIFF_COLORS = { Easy: "#10b981", Medium: "#f59e0b", Hard: "#f43f5e" };
const borderC = "rgba(99,102,241,0.18)";

const selectStyle = {
  padding: "10px 14px", background: "rgba(7,8,15,0.8)", border: `1px solid ${borderC}`,
  borderRadius: 10, color: "#e8edf5", fontFamily: "Inter,sans-serif", fontSize: "0.85rem",
  outline: "none", appearance: "none", cursor: "pointer", transition: "all 0.3s",
};

const DSAPracticePage = () => {
  const [searchParams] = useSearchParams();
  const [problems, setProblems] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [topics, setTopics] = useState([]);
  const [solvedIds, setSolvedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({ company: searchParams.get("company") || "", difficulty: "", topic: "", platform: "", page: 1 });

  const fetchProblems = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const res = await getProblems(params);
      setProblems(res.data.problems);
      setPagination({ page: res.data.page, pages: res.data.pages, total: res.data.total });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { getCompanies().then(r => setCompanies(r.data)); getTopics().then(r => setTopics(r.data)); getSolvedIds().then(r => setSolvedIds(new Set(r.data))); }, []);
  useEffect(() => { fetchProblems(); }, [fetchProblems]);

  const setFilter = (key, value) => setFilters(f => ({ ...f, [key]: value, page: 1 }));

  const toggleSolved = async (p) => {
    try {
      if (solvedIds.has(p._id)) { await unmarkSolved(p._id); setSolvedIds(s => { const n = new Set(s); n.delete(p._id); return n; }); }
      else { await markSolved(p._id); setSolvedIds(s => new Set([...s, p._id])); }
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Header */}
      <div className="animate-fade-in" style={{
        background: "linear-gradient(135deg,rgba(99,102,241,0.18) 0%,rgba(139,92,246,0.12) 50%,rgba(6,182,212,0.08) 100%)",
        border: `1px solid rgba(99,102,241,0.25)`, borderRadius: 20, padding: "24px 28px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 140, height: 140, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.15) 0%,transparent 70%)", filter: "blur(25px)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#e8edf5", fontFamily: "Outfit,sans-serif", marginBottom: 4 }}>💻 DSA Practice</h1>
          <p style={{ color: "var(--c-muted)", fontSize: "0.88rem" }}>{pagination.total} problems from LeetCode & GeeksforGeeks</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: "rgba(13,17,23,0.82)", border: `1px solid ${borderC}`, borderRadius: 16,
        padding: "18px 20px", display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center",
        backdropFilter: "blur(14px)",
      }}>
        <select value={filters.company} onChange={e => setFilter("company", e.target.value)} style={selectStyle}>
          <option value="" style={{ background: "#0d1117" }}>All Companies</option>
          {companies.map(c => <option key={c} style={{ background: "#0d1117" }}>{c}</option>)}
        </select>

        <select value={filters.topic} onChange={e => setFilter("topic", e.target.value)} style={selectStyle}>
          <option value="" style={{ background: "#0d1117" }}>All Topics</option>
          {topics.map(t => <option key={t} style={{ background: "#0d1117" }}>{t}</option>)}
        </select>

        <div style={{ display: "flex", gap: 6 }}>
          {DIFFICULTIES.map(d => {
            const active = filters.difficulty === (d === "All" ? "" : d);
            const color = DIFF_COLORS[d] || "#6366f1";
            return (
              <button key={d} onClick={() => setFilter("difficulty", d === "All" ? "" : d)}
                style={{
                  padding: "8px 14px", borderRadius: 10, fontSize: "0.8rem", fontWeight: 700,
                  cursor: "pointer", transition: "all 0.2s", fontFamily: "Inter,sans-serif",
                  background: active ? `${color}20` : "rgba(7,8,15,0.5)", color: active ? color : "var(--c-muted)",
                  border: `1px solid ${active ? `${color}40` : "transparent"}`,
                }}
              >{d}</button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {PLATFORMS.map(p => {
            const active = filters.platform === (p === "All" ? "" : p);
            return (
              <button key={p} onClick={() => setFilter("platform", p === "All" ? "" : p)}
                style={{
                  padding: "8px 14px", borderRadius: 10, fontSize: "0.8rem", fontWeight: 700,
                  cursor: "pointer", transition: "all 0.2s", fontFamily: "Inter,sans-serif",
                  background: active ? "rgba(139,92,246,0.2)" : "rgba(7,8,15,0.5)",
                  color: active ? "#a78bfa" : "var(--c-muted)",
                  border: `1px solid ${active ? "rgba(139,92,246,0.35)" : "transparent"}`,
                }}
              >{p}</button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[0,1,2,3,4].map(i => <div key={i} className="skeleton-loader" style={{ height: 48, borderRadius: 10 }} />)}
        </div>
      ) : (
        <div style={{ background: "rgba(13,17,23,0.82)", border: `1px solid ${borderC}`, borderRadius: 16, overflow: "hidden", backdropFilter: "blur(14px)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${borderC}` }}>
                {["Status","Title","Difficulty","Topic","Platform","Action"].map(h => (
                  <th key={h} style={{ padding: "14px 16px", textAlign: h === "Title" || h === "Topic" ? "left" : "center", fontSize: "0.72rem", fontWeight: 800, color: "var(--c-muted)", textTransform: "uppercase", letterSpacing: "0.06em", background: "rgba(20,27,45,0.6)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {problems.map(p => {
                const solved = solvedIds.has(p._id);
                const dc = DIFF_COLORS[p.difficulty] || "#6366f1";
                return (
                  <tr key={p._id} style={{ borderBottom: `1px solid rgba(99,102,241,0.08)`, transition: "all 0.2s", background: solved ? "rgba(16,185,129,0.04)" : "transparent" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.06)"}
                    onMouseLeave={e => e.currentTarget.style.background = solved ? "rgba(16,185,129,0.04)" : "transparent"}
                  >
                    <td style={{ textAlign: "center", padding: "12px 16px" }}>
                      <button onClick={() => toggleSolved(p)}
                        style={{
                          width: 22, height: 22, borderRadius: 6, cursor: "pointer", transition: "all 0.2s",
                          display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem",
                          background: solved ? "rgba(16,185,129,0.2)" : "transparent",
                          border: `1.5px solid ${solved ? "#10b981" : "rgba(99,102,241,0.25)"}`,
                          color: solved ? "#10b981" : "transparent",
                        }}
                      >{solved ? "✓" : ""}</button>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <a href={p.externalUrl} target="_blank" rel="noreferrer"
                        style={{ color: "#e8edf5", textDecoration: "none", fontWeight: 600, transition: "color 0.2s" }}
                        onMouseEnter={e => e.target.style.color = "#818cf8"}
                        onMouseLeave={e => e.target.style.color = "#e8edf5"}
                      >{p.title}</a>
                    </td>
                    <td style={{ textAlign: "center", padding: "12px 8px" }}>
                      <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: "0.72rem", fontWeight: 700, background: `${dc}15`, color: dc, border: `1px solid ${dc}30` }}>{p.difficulty}</span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--c-muted)", fontSize: "0.82rem" }}>{p.topic}</td>
                    <td style={{ textAlign: "center", padding: "12px 8px" }}>
                      <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: "0.72rem", fontWeight: 600, background: p.platform === "LeetCode" ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)", color: p.platform === "LeetCode" ? "#f59e0b" : "#10b981", border: `1px solid ${p.platform === "LeetCode" ? "rgba(245,158,11,0.2)" : "rgba(16,185,129,0.2)"}` }}>{p.platform}</span>
                    </td>
                    <td style={{ textAlign: "center", padding: "12px 16px" }}>
                      <a href={p.externalUrl} target="_blank" rel="noreferrer"
                        style={{
                          padding: "5px 14px", borderRadius: 8, fontSize: "0.78rem", fontWeight: 700,
                          background: "rgba(99,102,241,0.12)", color: "#818cf8",
                          border: `1px solid rgba(99,102,241,0.25)`,
                          textDecoration: "none", transition: "all 0.2s",
                        }}
                      >Solve →</a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button disabled={pagination.page <= 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
          style={{
            padding: "9px 18px", borderRadius: 10, fontSize: "0.85rem", fontWeight: 600,
            background: "rgba(99,102,241,0.08)", border: `1px solid ${borderC}`,
            color: pagination.page <= 1 ? "var(--c-dim)" : "#818cf8",
            cursor: pagination.page <= 1 ? "not-allowed" : "pointer", fontFamily: "Inter,sans-serif",
            opacity: pagination.page <= 1 ? 0.4 : 1, transition: "all 0.2s",
          }}
        >← Prev</button>
        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--c-muted)" }}>
          Page {pagination.page} of {pagination.pages}
        </span>
        <button disabled={pagination.page >= pagination.pages} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
          style={{
            padding: "9px 18px", borderRadius: 10, fontSize: "0.85rem", fontWeight: 600,
            background: "rgba(99,102,241,0.08)", border: `1px solid ${borderC}`,
            color: pagination.page >= pagination.pages ? "var(--c-dim)" : "#818cf8",
            cursor: pagination.page >= pagination.pages ? "not-allowed" : "pointer", fontFamily: "Inter,sans-serif",
            opacity: pagination.page >= pagination.pages ? 0.4 : 1, transition: "all 0.2s",
          }}
        >Next →</button>
      </div>
    </div>
  );
};

export default DSAPracticePage;