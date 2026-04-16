import React from "react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {

  const cards = [
    {
      title: "Manage DSA Problems",
      icon: "📋",
      link: "/admin/problems",
      color: "#6366f1",
      rgbColor: "99,102,241",
      desc: "Edit, delete or manage all DSA problems"
    },
    {
      title: "Add Problem",
      icon: "➕",
      link: "/admin/add-problem",
      color: "#8b5cf6",
      rgbColor: "139,92,246",
      desc: "Add new coding problems to the database"
    },
    {
      title: "Manage Subjects",
      icon: "📚",
      link: "/admin/subjects",
      color: "#a855f7",
      rgbColor: "168,85,247",
      desc: "View and manage CS subjects"
    },
    {
      title: "Add Subject",
      icon: "📝",
      link: "/admin/add-subject",
      color: "#d946ef",
      rgbColor: "217,70,239",
      desc: "Create new subjects for interview prep"
    }
  ];

  const borderC = "rgba(99,102,241,0.18)";
  const cardStyle = { 
    background: "rgba(13,17,23,0.82)", 
    border: `1px solid ${borderC}`, 
    borderRadius: 18, 
    backdropFilter: "blur(14px)" 
  };

  return (
    <div className="responsive-page-container" style={{ display: "flex", flexDirection: "column", gap: 32, paddingLeft: 24, paddingRight: 24 }}>
      <style>{`
        .responsive-page-container {
          padding-top: 80px;
        }
        @media (min-width: 768px) {
          .responsive-page-container {
            padding-top: 20px;
          }
        }
      `}</style>

      {/* Header */}
      <div className="animate-fade-in" style={{
        background: "linear-gradient(135deg,rgba(99,102,241,0.18) 0%,rgba(139,92,246,0.12) 25%,rgba(168,85,247,0.12) 50%,rgba(217,70,239,0.08) 100%)",
        border: "1px solid rgba(99,102,241,0.25)", 
        borderRadius: 20, 
        padding: "40px 48px",
        position: "relative", 
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle,rgba(139,92,246,0.2) 0%,transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -40, left: 80, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle,rgba(168,85,247,0.15) 0%,transparent 70%)", filter: "blur(35px)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <h1 style={{ 
            fontSize: "2.2rem", 
            fontWeight: 900, 
            background: "linear-gradient(135deg, #818cf8 0%, #a855f7 50%, #d946ef 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: "Outfit,sans-serif",
            marginBottom: 12,
            letterSpacing: "-0.02em"
          }}>
            ⚙️ Admin Dashboard
          </h1>
          <p style={{ color: "var(--c-muted)", fontSize: "1rem", maxWidth: "600px", lineHeight: 1.6 }}>
            Manage all aspects of your interview preparation platform. Create problems, organize subjects, and configure the learning experience.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
    

      {/* Admin Cards Grid */}
      <div>
        <h2 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--c-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 20 }}>
          ✨ Management Tools
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
          {cards.map((card, idx) => (
            <Link
              key={card.title}
              to={card.link}
              style={{
                ...cardStyle,
                padding: "28px",
                display: "flex",
                flexDirection: "column",
                textDecoration: "none",
                color: "inherit",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
                group: true,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.borderColor = `rgba(${card.rgbColor},0.5)`;
                e.currentTarget.style.boxShadow = `0 20px 40px rgba(${card.rgbColor},0.15), 0 0 0 1px rgba(${card.rgbColor},0.2)`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = borderC;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Gradient accent bar */}
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: `linear-gradient(90deg, ${card.color}, transparent)`,
                opacity: 0.7,
              }} />

              {/* Icon */}
              <div style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: `rgba(${card.rgbColor},0.15)`,
                border: `2px solid rgba(${card.rgbColor},0.25)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem",
                marginBottom: 20,
                transition: "all 0.3s",
              }}
                className="group-icon"
              >
                {card.icon}
              </div>

              {/* Content */}
              <h3 style={{
                fontSize: "1.2rem",
                fontWeight: 800,
                color: "#e8edf5",
                fontFamily: "Outfit,sans-serif",
                marginBottom: 10,
                letterSpacing: "-0.01em",
              }}>
                {card.title}
              </h3>

              <p style={{
                color: "var(--c-muted)",
                fontSize: "0.9rem",
                marginBottom: 16,
                flex: 1,
                lineHeight: 1.5,
              }}>
                {card.desc}
              </p>

              {/* CTA */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: `${card.color}`,
                fontWeight: 700,
                fontSize: "0.85rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                transition: "all 0.3s",
              }}>
                <span>Open</span>
                <span style={{ transition: "transform 0.3s" }}>→</span>
              </div>

            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        ...cardStyle,
        padding: "24px 28px",
        textAlign: "center",
        marginTop: 16,
      }}>

      </div>

    </div>
  );

};

export default AdminDashboard;