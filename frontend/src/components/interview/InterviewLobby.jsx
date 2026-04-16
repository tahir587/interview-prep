import React, { useEffect, useState, useRef } from "react";

const InterviewLobby = ({ interview, onComplete, onJoin }) => {
  const [cameraWorking, setCameraWorking] = useState(false);
  const [micWorking, setMicWorking] = useState(false);
  const [audioTestComplete, setAudioTestComplete] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [isJoining, setIsJoining] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [mediaError, setMediaError] = useState("");

  const videoRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);
  const streamRef = useRef(null);

  const attachVideoStream = () => {
    if (!videoRef.current || !streamRef.current) return;

    if (videoRef.current.srcObject !== streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }

    const playPromise = videoRef.current.play?.();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  };

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        setShowPreview(true);
        setCameraWorking(stream.getVideoTracks().length > 0);
        setMicWorking(stream.getAudioTracks().length > 0);

        // Attach immediately when possible and once again on next frame.
        attachVideoStream();
        requestAnimationFrame(() => attachVideoStream());

        const ac = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = ac;
        const src = ac.createMediaStreamSource(stream);
        const analyser = ac.createAnalyser();
        analyser.fftSize = 256;
        src.connect(analyser);
        analyserRef.current = analyser;
        const buf = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(buf);
          const avg = buf.reduce((a, b) => a + b) / buf.length;
          setMicLevel(Math.min(100, avg * 2));
          if (avg * 2 > 10) setMicWorking(true);
          animationRef.current = requestAnimationFrame(tick);
        };
        tick();
      } catch (err) {
        console.error("Camera/Mic error:", err);
        setMediaError("Unable to access camera. Please allow camera permission and retry.");
        setCameraWorking(false);
        setShowPreview(false);
      }
    };
    startCamera();
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  useEffect(() => {
    if (!showPreview) return;
    attachVideoStream();
  }, [showPreview]);

  const handleAudioTest = () => {
    const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQoWQ5nk7pdsLRJKm+Tyo3EmFUKJ4vF0YS0LRpXj8p9rLhJFh+DxdWcxE0OA3/B3aTMQP3vb7nRpKRA+d9rwc2klDjxz1u5zZiUNOHPS7HRmJAs3cNLsc2YkCzdv0ex0ZiMLN2/R7HRlIws2bM/rc2QgC7Vs0OlyYyAKtWzQ6HJiIAq1a87qcWEfCrVqzepxYB4KtWrN6nFgHgq1as3qcWAeCrVqzepxYB0KtWvN6nFgHQq1a83qcWAdCrVqzepxYB0KtWvN6nFgHQq1a83qcWAdCrVqzepxYB0KtWvN6nFgHQq1a83qcWAdCrVqzepxYB0KtWvN6nFgHQ");
    audio.volume = 0.2;
    audio.play().then(() => setAudioTestComplete(true)).catch(() => setAudioTestComplete(true));
  };

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      await onComplete({ cameraWorking, micWorking, audioTestComplete: true });
      setCountdown(3);
      const iv = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) { clearInterval(iv); onJoin(); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (err) { console.error("Failed to complete lobby:", err); setIsJoining(false); }
  };

  const CheckItem = ({ ok, label }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "0.65rem", fontWeight: 800,
        background: ok ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
        color: ok ? "#10b981" : "#f59e0b",
        border: `1px solid ${ok ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}`,
      }}>{ok ? "✓" : "…"}</div>
      <span style={{ fontSize: "0.82rem", color: ok ? "#e8edf5" : "var(--c-muted)" }}>{label}</span>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg,#07080f 0%,#0d1117 50%,#0a0614 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, position: "relative",
    }}>
      {/* Ambient orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", top: -150, right: -150, background: "radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 60%)", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", bottom: -100, left: -100, background: "radial-gradient(circle,rgba(6,182,212,0.08) 0%,transparent 60%)", filter: "blur(50px)" }} />
      </div>

      {/* Countdown overlay */}
      {countdown && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100, background: "rgba(7,8,15,0.92)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            fontSize: "8rem", fontWeight: 900, fontFamily: "Outfit,sans-serif",
            background: "linear-gradient(135deg,#6366f1,#8b5cf6,#06b6d4)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            animation: "fadeIn 0.3s ease-out",
          }}>{countdown}</div>
          <p style={{ color: "var(--c-muted)", fontSize: "1.1rem", marginTop: 16 }}>Connecting you to your interviewer…</p>
        </div>
      )}

      <div className="animate-fade-in" style={{ maxWidth: 1000, width: "100%", position: "relative", zIndex: 1 }}>
        {/* Title area */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 16px", borderRadius: 99, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", fontSize: "0.73rem", fontWeight: 700, color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", display: "inline-block", animation: "breathe 2s ease-in-out infinite" }} />
            Pre-Interview Check
          </div>
          <h1 style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 900, color: "#e8edf5", fontFamily: "Outfit,sans-serif", letterSpacing: "-0.03em", marginBottom: 8 }}>
            Interview Lobby
          </h1>
          <p style={{ color: "var(--c-muted)", fontSize: "0.92rem" }}>Ensure your camera and microphone are ready before joining</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20, alignItems: "start" }}>

          {/* LEFT — Camera Preview */}
          <div style={{ background: "rgba(13,17,23,0.85)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 20, overflow: "hidden" }}>
            {/* Header bar */}
            <div style={{ padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(99,102,241,0.12)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: cameraWorking ? "#10b981" : "#f43f5e", display: "inline-block", boxShadow: `0 0 8px ${cameraWorking ? "#10b981" : "#f43f5e"}` }} />
                <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#e8edf5" }}>Camera Preview</span>
              </div>
              <span style={{
                padding: "3px 10px", borderRadius: 99, fontSize: "0.68rem", fontWeight: 700,
                background: cameraWorking ? "rgba(16,185,129,0.12)" : "rgba(244,63,94,0.12)",
                color: cameraWorking ? "#10b981" : "#fb7185",
                border: `1px solid ${cameraWorking ? "rgba(16,185,129,0.25)" : "rgba(244,63,94,0.25)"}`,
              }}>{cameraWorking ? "✓ Connected" : "✕ No Camera"}</span>
            </div>

            {/* Video area */}
            <div style={{ position: "relative", aspectRatio: "16 / 9", background: "#07080f" }}>
              {showPreview ? (
                <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              ) : (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", marginBottom: 12, animation: "breathe 2.5s ease-in-out infinite" }}>📷</div>
                  <p style={{ color: "var(--c-muted)", fontSize: "0.85rem" }}>{mediaError || "Requesting camera access…"}</p>
                </div>
              )}

              {/* Mic indicator overlay */}
              <div style={{ position: "absolute", bottom: 14, left: 14, right: 14, display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "rgba(7,8,15,0.8)", backdropFilter: "blur(16px)", borderRadius: 10, border: "1px solid rgba(99,102,241,0.15)" }}>
                <span style={{ fontSize: "0.85rem" }}>{micWorking ? "🎤" : "🎤"}</span>
                <div style={{ flex: 1, height: 4, borderRadius: 99, background: "rgba(99,102,241,0.15)", overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 99, width: `${micLevel}%`, background: micWorking ? "linear-gradient(90deg,#10b981,#06b6d4)" : "#f59e0b", transition: "width 0.08s" }} />
                </div>
                <span style={{ fontSize: "0.7rem", fontWeight: 600, color: micWorking ? "#10b981" : "#f59e0b", minWidth: 55, textAlign: "right" }}>
                  {micWorking ? "Working" : "Speak…"}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT — Setup Panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* System checks */}
            <div style={{ background: "rgba(13,17,23,0.85)", border: "1px solid rgba(99,102,241,0.18)", borderRadius: 16, padding: "18px 20px" }}>
              <h3 style={{ fontSize: "0.82rem", fontWeight: 800, color: "#e8edf5", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.06em" }}>System Check</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <CheckItem ok={cameraWorking} label="Camera connected" />
                <CheckItem ok={micWorking} label="Microphone detected" />
                <CheckItem ok={audioTestComplete} label="Audio playback verified" />
              </div>
              {!audioTestComplete && (
                <button onClick={handleAudioTest}
                  style={{
                    width: "100%", marginTop: 14, padding: "10px", borderRadius: 10, fontSize: "0.84rem", fontWeight: 700,
                    background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.22)",
                    color: "#818cf8", cursor: "pointer", fontFamily: "Inter,sans-serif", transition: "all 0.3s",
                  }}
                >🔊 Test Audio Playback</button>
              )}
            </div>

            {/* Interviewer card */}
            <div style={{ background: "rgba(13,17,23,0.85)", border: "1px solid rgba(99,102,241,0.18)", borderRadius: 16, padding: "18px 20px" }}>
              <h3 style={{ fontSize: "0.82rem", fontWeight: 800, color: "#e8edf5", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.06em" }}>Your Interviewer</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", fontWeight: 800, fontSize: "1.1rem",
                  boxShadow: "0 0 18px rgba(99,102,241,0.45)",
                  animation: "breathe 3s ease-in-out infinite",
                }}>{interview?.interviewerName?.[0] || "A"}</div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "0.92rem", color: "#e8edf5" }}>{interview?.interviewerName || "Alex"}</p>
                  <p style={{ fontSize: "0.78rem", color: "var(--c-muted)" }}>{interview?.interviewerRole || "Senior Software Engineer"}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                    <span style={{ fontSize: "0.7rem", color: "#6ee7b7", fontWeight: 600 }}>Online · Ready</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interview details */}
            <div style={{ background: "rgba(13,17,23,0.85)", border: "1px solid rgba(99,102,241,0.18)", borderRadius: 16, padding: "18px 20px" }}>
              <h3 style={{ fontSize: "0.82rem", fontWeight: 800, color: "#e8edf5", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Session Details</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: "0.82rem", color: "var(--c-muted)" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>Type</span><span style={{ color: "#e8edf5", fontWeight: 600 }}>{interview?.type}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>Company</span><span style={{ color: "#e8edf5", fontWeight: 600 }}>{interview?.company}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>Difficulty</span><span style={{ color: "#e8edf5", fontWeight: 600 }}>{interview?.difficulty}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>Questions</span><span style={{ color: "#e8edf5", fontWeight: 600 }}>{interview?.questions?.length || "—"}</span></div>
              </div>
            </div>

            {/* Join button */}
            <button onClick={handleJoin} disabled={isJoining}
              style={{
                width: "100%", padding: "15px", borderRadius: 14, border: "none",
                background: "linear-gradient(135deg,#10b981,#059669)",
                color: "white", fontWeight: 800, fontSize: "1rem", fontFamily: "Inter,sans-serif",
                cursor: isJoining ? "not-allowed" : "pointer",
                boxShadow: "0 6px 24px rgba(16,185,129,0.4)",
                transition: "all 0.3s", opacity: isJoining ? 0.6 : 1,
              }}
            >
              {isJoining
                ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                    <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.75s linear infinite" }} />
                    Connecting…
                  </span>
                : "🎙️ Join Interview"
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewLobby;
