import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getInterview, submitAnswer, completeInterview, completeLobby,
  joinInterview, submitWarmUp, submitBackground, startCandidateQA,
  submitCandidateQuestion, startClosing, synthesizeInterviewSpeech
} from "../services/api";
import InterviewLobby from "../components/interview/InterviewLobby";

/* ═══════════════════ Shared Styles ═══════════════════ */
const bg = "linear-gradient(160deg,#07080f 0%,#0d1117 50%,#0a0614 100%)";
const cardBg = "rgba(13,17,23,0.85)";
const borderC = "rgba(99,102,241,0.18)";
const borderA = "rgba(99,102,241,0.35)";
const phaseColors = { warmup: "#f59e0b", background: "#8b5cf6", "core-questions": "#6366f1", "candidate-qa": "#06b6d4", closing: "#10b981" };
const phaseLabels = { warmup: "Warm-Up", background: "Background", "core-questions": "Technical Questions", "candidate-qa": "Your Questions", closing: "Closing" };

/* Self camera preview tile */
const SelfPreviewCard = ({ videoRef, cameraOn }) => (
  <div style={{
    position: "fixed", top: 72, right: 14, zIndex: 45,
    width: 172, borderRadius: 14, overflow: "hidden",
    background: "rgba(13,17,23,0.9)", border: "1px solid rgba(99,102,241,0.25)",
    boxShadow: "0 12px 28px rgba(0,0,0,0.35)"
  }}>
    <div style={{
      padding: "6px 10px", fontSize: "0.72rem", fontWeight: 700,
      color: "#e8edf5", background: "rgba(7,8,15,0.8)",
      borderBottom: "1px solid rgba(99,102,241,0.2)",
      display: "flex", alignItems: "center", justifyContent: "space-between"
    }}>
      <span>You</span>
      <span style={{ color: cameraOn ? "#10b981" : "#f59e0b" }}>{cameraOn ? "●" : "○"}</span>
    </div>
    <div style={{ position: "relative", aspectRatio: "4 / 3", background: "#07080f" }}>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transform: "scaleX(-1)" }}
      />
      {!cameraOn && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--c-muted)", fontSize: "0.75rem",
          background: "rgba(7,8,15,0.55)"
        }}>
          Camera off
        </div>
      )}
    </div>
  </div>
);

/* ═══════════════════ Sub-Components ═══════════════════ */

/* AI Avatar (interviewer bubble with animated states) */
const AIAvatar = ({ name, speaking, processing, reaction, size = 52 }) => {
  const emoji = (() => {
    if (!reaction) return null;
    const r = reaction.reaction;
    if (r === "impressed") return "😊";
    if (r === "satisfied") return "😌";
    if (r === "thinking") return "🤔";
    if (r === "skeptical") return "😐";
    if (r === "intrigued") return "👀";
    return null;
  })();

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      {/* Glow ring when speaking */}
      {speaking && (
        <div style={{
          position: "absolute", inset: -4, borderRadius: "50%", border: "2px solid rgba(99,102,241,0.5)",
          animation: "breathe 1s ease-in-out infinite", boxShadow: "0 0 20px rgba(99,102,241,0.3)",
        }} />
      )}
      <div style={{
        width: size, height: size, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white",
        fontWeight: 900, fontSize: size * 0.38, fontFamily: "Outfit,sans-serif",
        boxShadow: "0 0 18px rgba(99,102,241,0.45)",
        animation: speaking ? "speaking-pulse 0.8s ease-in-out infinite" : processing ? "breathe 2s ease-in-out infinite" : "none",
        transition: "all 0.3s",
      }}>
        {name?.[0]?.toUpperCase() || "A"}
      </div>
      {/* Reaction badge */}
      {emoji && (
        <div style={{
          position: "absolute", bottom: -4, right: -4, width: 24, height: 24, borderRadius: "50%",
          background: "#0d1117", border: "1.5px solid rgba(99,102,241,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem",
          animation: "fadeIn 0.3s ease-out",
        }}>{emoji}</div>
      )}
    </div>
  );
};

/* Conversation bubble */
const MessageBubble = ({ isAI, speaking, processing, children }) => (
  <div style={{
    padding: "14px 18px", borderRadius: isAI ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
    maxWidth: "90%",
    background: isAI
      ? (speaking ? "rgba(99,102,241,0.12)" : processing ? "rgba(245,158,11,0.08)" : "rgba(26,37,64,0.5)")
      : "rgba(99,102,241,0.08)",
    border: `1px solid ${isAI ? (speaking ? borderA : borderC) : "rgba(99,102,241,0.12)"}`,
    alignSelf: isAI ? "flex-start" : "flex-end",
    fontSize: "0.9rem", color: "#e8edf5", lineHeight: 1.65,
    transition: "all 0.3s",
  }}>
    {speaking ? (
      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ display: "flex", gap: 3 }}>
          {[0,1,2,3].map(i => (
            <span key={i} style={{
              width: 3, height: 12 + Math.random() * 8, background: "#818cf8", borderRadius: 2,
              animation: `sound-wave-${(i % 3) + 1} 0.${3 + i}s ease-in-out infinite`,
            }} />
          ))}
        </span>
        <span style={{ color: "#818cf8", fontWeight: 600 }}>Speaking…</span>
      </span>
    ) : processing ? (
      <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#f59e0b" }}>
        <span style={{ display: "inline-flex", gap: 4 }}>
          {[0,1,2].map(i => (
            <span key={i} style={{
              width: 6, height: 6, borderRadius: "50%", background: "#f59e0b",
              animation: `breathe 1.2s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </span>
        Thinking…
      </span>
    ) : children}
  </div>
);

/* Phase progress bar */
const PhaseBar = ({ phase, timer, questionIndex, totalQuestions }) => {
  const phases = ["warmup", "background", "core-questions", "candidate-qa", "closing"];
  const activeIdx = phases.indexOf(phase);
  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 18px",
      background: "rgba(13,17,23,0.92)", backdropFilter: "blur(20px)",
      borderBottom: `1px solid ${borderC}`,
      position: "sticky", top: 0, zIndex: 30,
    }}>
      {/* Phase steps */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {phases.map((p, i) => (
          <div key={p} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{
              width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.6rem", fontWeight: 800,
              background: i <= activeIdx ? `${phaseColors[p]}20` : "transparent",
              color: i <= activeIdx ? phaseColors[p] : "var(--c-dim)",
              border: `1.5px solid ${i <= activeIdx ? `${phaseColors[p]}55` : "var(--c-dim)30"}`,
              transition: "all 0.3s",
            }}>{i < activeIdx ? "✓" : i + 1}</div>
            {i < phases.length - 1 && <div style={{ width: 16, height: 1.5, background: i < activeIdx ? phaseColors[phases[i + 1]] : "var(--c-dim)", borderRadius: 1, transition: "all 0.3s" }} />}
          </div>
        ))}
      </div>

      {/* Phase label + timer */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{
          padding: "3px 12px", borderRadius: 99, fontSize: "0.72rem", fontWeight: 700,
          background: `${phaseColors[phase]}18`, color: phaseColors[phase],
          border: `1px solid ${phaseColors[phase]}35`,
        }}>{phaseLabels[phase]}</span>
        {phase === "core-questions" && totalQuestions && (
          <span style={{ fontSize: "0.78rem", color: "var(--c-muted)", fontWeight: 600 }}>
            Q{questionIndex + 1}/{totalQuestions}
          </span>
        )}
        <div style={{
          fontFamily: "JetBrains Mono, monospace", fontSize: "0.9rem", fontWeight: 600,
          color: "#818cf8", padding: "4px 12px", borderRadius: 8,
          background: "rgba(99,102,241,0.08)", border: `1px solid ${borderC}`,
        }}>{formatTime(timer)}</div>
      </div>
    </div>
  );
};

/* Response area (textarea + mic + send) */
const ResponseArea = ({ value, onChange, onSubmit, onMic, listening, disabled, placeholder, submitLabel = "Send", aiSpeaking }) => (
  <div style={{
    padding: "16px 20px",
    background: "rgba(13,17,23,0.95)", backdropFilter: "blur(20px)",
    borderTop: `1px solid ${borderC}`,
    position: "sticky", bottom: 0, zIndex: 30,
  }}>
    <div style={{ display: "flex", gap: 10, alignItems: "flex-end", maxWidth: 800, margin: "0 auto" }}>
      {/* Mic button */}
      <button onClick={onMic} disabled={aiSpeaking || disabled}
        style={{
          width: 42, height: 42, borderRadius: 12, cursor: disabled ? "not-allowed" : "pointer",
          background: listening ? "rgba(16,185,129,0.2)" : "rgba(99,102,241,0.1)",
          color: listening ? "#10b981" : "#818cf8", fontSize: "1.1rem",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: `1px solid ${listening ? "rgba(16,185,129,0.35)" : borderC}`,
          transition: "all 0.3s", flexShrink: 0,
          boxShadow: listening ? "0 0 12px rgba(16,185,129,0.3)" : "none",
          animation: listening ? "breathe 1.5s ease-in-out infinite" : "none",
        }}
      >{listening ? "🎙️" : "🎤"}</button>

      {/* Textarea */}
      <textarea value={value} onChange={onChange} rows={1} disabled={disabled}
        placeholder={placeholder}
        style={{
          flex: 1, padding: "11px 14px", minHeight: 42, maxHeight: 120,
          background: "rgba(7,8,15,0.7)", border: `1px solid ${borderC}`,
          borderRadius: 12, color: "#e8edf5", fontSize: "0.88rem",
          fontFamily: "Inter,sans-serif", outline: "none", resize: "vertical",
          transition: "all 0.3s",
        }}
        onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; }}
        onBlur={e => { e.target.style.borderColor = borderC; e.target.style.boxShadow = "none"; }}
      />

      {/* Send */}
      <button onClick={onSubmit} disabled={!value?.trim() || disabled}
        style={{
          height: 42, padding: "0 22px", borderRadius: 12, border: "none",
          background: !value?.trim() || disabled ? "rgba(99,102,241,0.15)" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
          color: "white", fontWeight: 700, fontSize: "0.85rem", fontFamily: "Inter,sans-serif",
          cursor: !value?.trim() || disabled ? "not-allowed" : "pointer",
          boxShadow: !value?.trim() || disabled ? "none" : "0 4px 14px rgba(99,102,241,0.35)",
          transition: "all 0.3s", flexShrink: 0, whiteSpace: "nowrap",
        }}
      >
        {disabled
          ? <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.75s linear infinite" }} />…</span>
          : submitLabel
        }
      </button>
    </div>
  </div>
);

/* ═══════════════════ Main Component ═══════════════════ */
const InterviewSessionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [currentPhase, setCurrentPhase] = useState("lobby");
  const [currentQ, setCurrentQ] = useState(0);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [receivedScore, setReceivedScore] = useState(null);
  const [followUp, setFollowUp] = useState(null);
  const [followUpAsked, setFollowUpAsked] = useState(false);
  const [warmUpCount, setWarmUpCount] = useState(0);
  const [backgroundCount, setBackgroundCount] = useState(0);
  const [candidateResponse, setCandidateResponse] = useState("");
  const [candidateQAPrompt, setCandidateQAPrompt] = useState("");
  const [candidateQuestionsAsked, setCandidateQuestionsAsked] = useState(0);
  const [remainingCandidateQuestions, setRemainingCandidateQuestions] = useState(3);
  const [closingMessage, setClosingMessage] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [pendingWarmUpGreeting, setPendingWarmUpGreeting] = useState("");
  const [timer, setTimer] = useState(0);
  const [listening, setListening] = useState(false);
  const [showQuestionCard, setShowQuestionCard] = useState(false);
  const [interviewerReaction, setInterviewerReaction] = useState(null);
  const [shouldInterrupt, setShouldInterrupt] = useState(false);
  const [interruptMessage, setInterruptMessage] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [questionTimeLimit] = useState(120);
  const [canRedeemAnswer, setCanRedeemAnswer] = useState(false);
  const [redemptionUsed, setRedemptionUsed] = useState(false);
  const [selfCameraOn, setSelfCameraOn] = useState(false);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const lastSpokenRef = useRef({ text: "", ts: 0 });
  const selectedVoiceRef = useRef(null);
  const activeAudioRef = useRef(null);
  const audioUrlRef = useRef(null);
  const selfVideoRef = useRef(null);
  const selfStreamRef = useRef(null);

  const stopActiveAudio = useCallback(() => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current.src = "";
      activeAudioRef.current = null;
    }

    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, []);

  const sanitizeSpeechText = useCallback((rawText) => {
    if (!rawText) return "";

    const cleaned = rawText
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
      .replace(/[*_`>#]/g, " ")
      .replace(/\bQ(\d+)\b/gi, "Question $1")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleaned) return "";
    return /[.!?]$/.test(cleaned) ? cleaned : `${cleaned}.`;
  }, []);

  const pickNaturalVoice = useCallback((voices) => {
    if (!Array.isArray(voices) || voices.length === 0) return null;

    const englishVoices = voices.filter((voice) => /^en[-_]/i.test(voice.lang || ""));
    const pool = englishVoices.length > 0 ? englishVoices : voices;

    const preferredPatterns = [
      /aria.*natural/i,
      /jenny.*natural/i,
      /guy.*natural/i,
      /samantha/i,
      /google.*english/i,
      /zira/i,
      /david/i,
      /mark/i,
      /serena/i,
    ];

    for (const pattern of preferredPatterns) {
      const match = pool.find((voice) => pattern.test(voice.name || ""));
      if (match) return match;
    }

    const nonRobotic = pool.find((voice) => !/robot|espeak|microsoft server speech/i.test(voice.name || ""));
    return nonRobotic || pool[0] || null;
  }, []);

  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) return undefined;

    const loadVoices = () => {
      const voices = synth.getVoices?.() || [];
      if (!voices.length) return;
      selectedVoiceRef.current = pickNaturalVoice(voices);
    };

    loadVoices();

    if (typeof synth.addEventListener === "function") {
      synth.addEventListener("voiceschanged", loadVoices);
      return () => synth.removeEventListener("voiceschanged", loadVoices);
    }

    const previousHandler = synth.onvoiceschanged;
    synth.onvoiceschanged = loadVoices;
    return () => {
      synth.onvoiceschanged = previousHandler || null;
    };
  }, [pickNaturalVoice]);

  const speakWithBrowserTts = useCallback((spokenText, onDone) => {
    const synth = window.speechSynthesis;
    if (!synth) {
      onDone();
      return;
    }

    synth.cancel();

    const segments = spokenText
      .split(/(?<=[.!?])\s+/)
      .map((segment) => segment.trim())
      .filter(Boolean);

    let segmentIndex = 0;

    const speakNextSegment = () => {
      if (segmentIndex >= segments.length) {
        onDone();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(segments[segmentIndex]);
      utterance.voice = selectedVoiceRef.current || null;
      utterance.lang = selectedVoiceRef.current?.lang || "en-US";
      utterance.rate = 0.95;
      utterance.pitch = 1.02;
      utterance.volume = 1;

      utterance.onend = () => {
        segmentIndex += 1;
        if (segmentIndex < segments.length) {
          setTimeout(speakNextSegment, 120);
        } else {
          onDone();
        }
      };

      utterance.onerror = () => {
        segmentIndex += 1;
        if (segmentIndex < segments.length) {
          setTimeout(speakNextSegment, 80);
        } else {
          onDone();
        }
      };

      synth.speak(utterance);
    };

    speakNextSegment();
  }, []);

  /* ── Speech synthesis ── */
  const speak = useCallback(async (text, callback = null) => {
    const spokenText = sanitizeSpeechText(text);
    if (!spokenText || isSpeakingRef.current) return;

    const now = Date.now();
    const { text: lastText, ts: lastTs } = lastSpokenRef.current;
    // Ignore accidental duplicate calls for the exact same prompt in a short window.
    if (lastText === spokenText && now - lastTs < 8000) return;
    lastSpokenRef.current = { text: spokenText, ts: now };

    isSpeakingRef.current = true;
    setAiSpeaking(true);
    if (recognitionRef.current && listening) { try { recognitionRef.current.stop(); } catch (e) {} }

    let completed = false;
    let fallbackStarted = false;

    const finishSpeaking = () => {
      if (completed) return;
      completed = true;
      isSpeakingRef.current = false;
      setAiSpeaking(false);
      if (callback) callback();
    };

    const fallbackToBrowserTts = () => {
      if (fallbackStarted) return;
      fallbackStarted = true;
      stopActiveAudio();
      speakWithBrowserTts(spokenText, finishSpeaking);
    };

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    try {
      stopActiveAudio();

      const audioResponse = await synthesizeInterviewSpeech({ text: spokenText });
      const audioBlob = new Blob([audioResponse.data], { type: "audio/mpeg" });

      if (!audioBlob.size) {
        fallbackToBrowserTts();
        return;
      }

      const objectUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = objectUrl;

      const audio = new Audio(objectUrl);
      activeAudioRef.current = audio;

      audio.onended = () => {
        stopActiveAudio();
        finishSpeaking();
      };

      audio.onerror = () => {
        stopActiveAudio();
        finishSpeaking();
      };

      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
          stopActiveAudio();
          finishSpeaking();
        });
      }
    } catch (error) {
      fallbackToBrowserTts();
    }
  }, [listening, sanitizeSpeechText, speakWithBrowserTts, stopActiveAudio]);

  /* ── Load interview ── */
  useEffect(() => {
    getInterview(id).then(r => {
      setInterview(r.data);
      setCurrentPhase(r.data.currentPhase || "lobby");
      if (r.data.questions) {
        for (let i = 0; i < r.data.questions.length; i++) {
          if (!r.data.questions[i].userAnswer || r.data.questions[i].userAnswer === "") { setCurrentQ(i); break; }
          if (i === r.data.questions.length - 1) setCurrentQ(i);
        }
      }
      if (r.data.warmUpConversation) setWarmUpCount(r.data.warmUpConversation.length);
      if (r.data.backgroundConversation) setBackgroundCount(r.data.backgroundConversation.filter(b => b.userResponse).length);
    }).catch(console.error);
    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      stopActiveAudio();
    };
  }, [id, stopActiveAudio]);

  /* ── Speech recognition ── */
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "en-US"; rec.continuous = false; rec.interimResults = false;
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onresult = (e) => {
      if (aiSpeaking || isProcessing) return;
      const transcript = e.results[0][0].transcript;
      if (currentPhase === "core-questions") setAnswer(prev => (prev ? prev + " " : "") + transcript);
      else setCandidateResponse(prev => (prev ? prev + " " : "") + transcript);
    };
    recognitionRef.current = rec;
    return () => { if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch (e) {} } };
  }, [aiSpeaking, isProcessing, currentPhase]);

  /* ── Auto-speak new questions ── */
  useEffect(() => {
    if (currentPhase === "core-questions" && interview?.questions) {
      const q = interview.questions[currentQ]?.question;
      if (q) { setQuestionStartTime(Date.now()); setTimeout(() => speak(q), 1000); }
    }
  }, [currentPhase, currentQ, interview, speak]);

  const attachSelfPreviewStream = useCallback(() => {
    if (!selfVideoRef.current || !selfStreamRef.current) return;

    if (selfVideoRef.current.srcObject !== selfStreamRef.current) {
      selfVideoRef.current.srcObject = selfStreamRef.current;
    }

    const playPromise = selfVideoRef.current.play?.();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  }, []);

  /* ── Persistent self preview during active interview ── */
  const hideSelfPreview = currentPhase === "lobby" || currentPhase === "closing" || showResults;

  useEffect(() => {
    if (hideSelfPreview) {
      if (selfStreamRef.current) {
        selfStreamRef.current.getTracks().forEach((t) => t.stop());
        selfStreamRef.current = null;
      }
      setSelfCameraOn(false);
      return;
    }

    let cancelled = false;

    const startSelfPreview = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        selfStreamRef.current = stream;
        setSelfCameraOn(stream.getVideoTracks().length > 0);
        attachSelfPreviewStream();
        requestAnimationFrame(() => attachSelfPreviewStream());
      } catch (err) {
        console.error("Self preview camera error:", err);
        setSelfCameraOn(false);
      }
    };

    if (!selfStreamRef.current) {
      startSelfPreview();
    } else {
      setSelfCameraOn(selfStreamRef.current.getVideoTracks().length > 0);
      attachSelfPreviewStream();
    }

    return () => {
      cancelled = true;
    };
  }, [hideSelfPreview, attachSelfPreviewStream]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const tryMic = () => { if (!aiSpeaking && !isProcessing && recognitionRef.current) recognitionRef.current.start(); };

  /* ── Phase handlers ── */
  const handleLobbyComplete = async (data) => {
    const res = await completeLobby(id, data);
    if (res?.data?.greeting) {
      setPendingWarmUpGreeting(res.data.greeting);
    }
  };

  const handleJoinInterview = async () => {
    await joinInterview(id);
    setCurrentPhase("warmup");
    speak(pendingWarmUpGreeting || "Hi there! Thanks for joining. How has your day been so far?");
  };

  const handleWarmUpSubmit = async () => {
    if (!candidateResponse.trim() || isProcessing) return;
    setIsProcessing(true);
    try {
      const res = await submitWarmUp(id, { userResponse: candidateResponse, isFirstResponse: warmUpCount === 0 });
      setWarmUpCount(prev => prev + 1);
      speak(res.data.aiResponse, () => {
        if (res.data.shouldMoveToBackground) setTimeout(() => { setCurrentPhase("background"); if (res.data.backgroundQuestion) setTimeout(() => speak(res.data.backgroundQuestion), 500); }, 1500);
      });
      setCandidateResponse("");
    } catch (err) { console.error("Warm-up error:", err); } finally { setIsProcessing(false); }
  };

  const handleBackgroundSubmit = async () => {
    if (!candidateResponse.trim() || isProcessing) return;
    setIsProcessing(true);
    try {
      const res = await submitBackground(id, { userResponse: candidateResponse, questionIndex: backgroundCount });
      setBackgroundCount(Number.isFinite(res?.data?.nextBackgroundIndex) ? res.data.nextBackgroundIndex : backgroundCount + 1);
      speak(res.data.aiResponse, () => {
        if (res.data.shouldMoveToCore) setTimeout(() => setCurrentPhase("core-questions"), 1500);
        else if (res.data.nextBackgroundQuestion) setTimeout(() => speak(res.data.nextBackgroundQuestion), 500);
      });
      setCandidateResponse("");
    } catch (err) { console.error("Background error:", err); } finally { setIsProcessing(false); }
  };

  const handleCoreSubmit = async () => {
    if (!answer.trim() || isProcessing) return;
    setIsProcessing(true);
    try {
      const res = await submitAnswer(id, currentQ, { answer });
      const requestedNextQuestion = Boolean(res.data.userRequestedNextQuestion);
      setFeedback(res.data.feedback); setReceivedScore(res.data.score);
      setInterviewerReaction(res.data.interviewerReaction);
      setShouldInterrupt(res.data.shouldInterrupt); setInterruptMessage(res.data.interruptMessage);
      setShowQuestionCard(true);
      setInterview((prev) => {
        if (!prev || !Array.isArray(prev.questions)) return prev;
        const nextQuestions = [...prev.questions];
        if (!nextQuestions[currentQ]) return prev;
        nextQuestions[currentQ] = {
          ...nextQuestions[currentQ],
          score: res.data.score,
          aiFeedback: res.data.feedback,
          displayedAsCard: true,
        };
        return { ...prev, questions: nextQuestions };
      });
      if (requestedNextQuestion) {
        setFollowUp(null);
        setFollowUpAsked(false);
        setCanRedeemAnswer(false);
      } else if (res.data.score < 4 && !redemptionUsed) {
        setCanRedeemAnswer(true);
      }
      if (res.data.shouldInterrupt && res.data.interruptMessage) {
        speak(res.data.interruptMessage, () => {
          setTimeout(() => { speak(res.data.feedback, () => {
            if (res.data.followUp && !followUpAsked) { setFollowUpAsked(true); setTimeout(() => { speak("Let's take this a step further. " + res.data.followUp); setFollowUp(res.data.followUp); }, 1000); }
          }); }, 1500);
        });
      } else if (res.data.followUp && !followUpAsked) {
        setFollowUpAsked(true);
        speak(res.data.feedback, () => { setTimeout(() => { speak("Let's take this a step further. " + res.data.followUp); setFollowUp(res.data.followUp); }, 500); });
      } else { speak(res.data.feedback); }
    } catch (err) {
      const fallback = "Thanks for your answer. Let's move to the next question.";
      setFeedback(fallback); speak(fallback);
    } finally { setIsProcessing(false); }
  };

  const handleAnswerRedemption = () => {
    setAnswer(""); setCanRedeemAnswer(false); setRedemptionUsed(true);
    setFeedback(null); setReceivedScore(null); setShowQuestionCard(false);
    speak("Let me clarify that — could you elaborate more on your answer?");
  };

  const nextQuestion = () => {
    setAnswer(""); setFeedback(null); setReceivedScore(null); setFollowUp(null);
    setFollowUpAsked(false); setShowQuestionCard(false); setInterviewerReaction(null);
    setShouldInterrupt(false); setInterruptMessage(null); setCanRedeemAnswer(false);
    setCurrentQ(q => q + 1);
  };

  const startCandidateQAPhase = async () => {
    try {
      const res = await startCandidateQA(id);
      setCandidateQAPrompt(res.data.prompt);
      setCandidateQuestionsAsked(0);
      setRemainingCandidateQuestions(res.data.remainingQuestions ?? 3);
      setCurrentPhase("candidate-qa");
      setTimeout(() => speak(res.data.prompt), 500);
    }
    catch (err) { console.error(err); }
  };

  const handleCandidateQuestionSubmit = async () => {
    if (!candidateResponse.trim() || isProcessing) return;
    setIsProcessing(true);
    try {
      const res = await submitCandidateQuestion(id, { question: candidateResponse });
      speak(res.data.answer);
      setCandidateQuestionsAsked((p) => p + 1);
      setRemainingCandidateQuestions(res.data.remainingQuestions ?? Math.max(0, remainingCandidateQuestions - 1));
      setCandidateResponse("");
    }
    catch (err) { console.error(err); } finally { setIsProcessing(false); }
  };

  const finishCandidateQA = async () => {
    try {
      const res = await startClosing(id);
      setClosingMessage(res.data.closingMessage);
      setCurrentPhase("closing");
      speak(res.data.closingMessage, async () => {
        try {
          const completion = await completeInterview(id, { duration: timer });
          if (completion?.data?.interview) {
            setInterview(completion.data.interview);
          }
        } catch (err) {
          console.error("Completion error:", err);
        } finally {
          setShowResults(true);
        }
      });
    }
    catch (err) { console.error(err); }
  };

  const finishInterview = async () => {
    navigate("/interview");
  };

  const getWarmUpMessage = () => {
    if (aiSpeaking || isProcessing) return null;
    if (warmUpCount === 0) return pendingWarmUpGreeting || "How's your day going?";
    if (warmUpCount === 1) return "That sounds nice. I'd love to hear more about your background.";
    return "Great! Let's get started with the interview.";
  };

  const getBackgroundMessage = () => {
    if (aiSpeaking || isProcessing) return null;
    return interview?.backgroundConversation?.[backgroundCount]?.question || "Walk me through your resume — what have you been focused on lately?";
  };

  const scoreColor = (s) => s >= 7 ? "#10b981" : s >= 4 ? "#f59e0b" : "#f43f5e";
  const scoreBg = (s) => s >= 7 ? "rgba(16,185,129,0.1)" : s >= 4 ? "rgba(245,158,11,0.1)" : "rgba(244,63,94,0.1)";

  /* ═══════════════════ LOADING ═══════════════════ */
  if (!interview) return (
    <div style={{ minHeight: "100vh", background: bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", marginBottom: 18, animation: "breathe 2s ease-in-out infinite", boxShadow: "0 0 20px rgba(99,102,241,0.4)" }}>🤖</div>
      <p style={{ color: "var(--c-muted)", fontSize: "0.95rem" }}>Preparing your interview…</p>
    </div>
  );

  /* ═══════════════════ RESULTS ═══════════════════ */
  if (showResults) {
    const computedScore = interview.questions?.reduce((acc, q) => acc + (q.score || 0), 0) / (interview.questions?.length || 1) * 10;
    const totalScore = interview?.status === "completed" && Number.isFinite(interview?.overallScore)
      ? interview.overallScore
      : computedScore;
    const grade = totalScore >= 80 ? "A" : totalScore >= 70 ? "B+" : totalScore >= 60 ? "B" : totalScore >= 50 ? "C" : "D";
    const gradeColor = totalScore >= 70 ? "#10b981" : totalScore >= 50 ? "#f59e0b" : "#f43f5e";

    return (
      <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div className="animate-fade-in" style={{
          maxWidth: 560, width: "100%", background: cardBg, border: `1px solid ${borderC}`,
          borderRadius: 24, padding: "40px 36px", backdropFilter: "blur(20px)", textAlign: "center",
          boxShadow: "0 0 60px rgba(99,102,241,0.1), 0 24px 48px rgba(0,0,0,0.5)",
        }}>
          <div style={{ fontSize: "3.5rem", marginBottom: 16 }}>🎉</div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 900, color: "#e8edf5", fontFamily: "Outfit,sans-serif", marginBottom: 6 }}>Interview Complete!</h1>
          <p style={{ color: "var(--c-muted)", marginBottom: 28 }}>Great job completing the mock interview.</p>

          {/* Score ring */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
            <div style={{
              width: 130, height: 130, borderRadius: "50%",
              background: `conic-gradient(${gradeColor} ${totalScore}%, rgba(99,102,241,0.1) 0%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 30px ${gradeColor}30`,
            }}>
              <div style={{
                width: 105, height: 105, borderRadius: "50%", background: "#0d1117",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: "2.2rem", fontWeight: 900, fontFamily: "Outfit,sans-serif", color: gradeColor }}>{Math.round(totalScore)}%</span>
                <span style={{ fontSize: "0.75rem", color: "var(--c-muted)", fontWeight: 600 }}>Grade {grade}</span>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
            {[
              { icon: "❓", label: "Questions", value: interview.questions?.length || 0, color: "#6366f1" },
              { icon: "⏱️", label: "Duration", value: formatTime(timer), color: "#8b5cf6" },
            ].map((s, i) => (
              <div key={i} style={{ padding: "16px", borderRadius: 14, background: `${s.color}10`, border: `1px solid ${s.color}25` }}>
                <div style={{ fontSize: "1.3rem", fontWeight: 900, color: s.color, fontFamily: "Outfit,sans-serif" }}>{s.value}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--c-muted)", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <button onClick={finishInterview} style={{
            width: "100%", padding: "14px", borderRadius: 14, border: "none",
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white",
            fontWeight: 700, fontSize: "0.95rem", fontFamily: "Inter,sans-serif", cursor: "pointer",
            boxShadow: "0 6px 20px rgba(99,102,241,0.4)",
          }}>← Back to Interviews</button>
        </div>
      </div>
    );
  }

  /* ═══════════════════ LOBBY ═══════════════════ */
  if (currentPhase === "lobby") return <InterviewLobby interview={interview} onComplete={handleLobbyComplete} onJoin={handleJoinInterview} />;

  /* ═══════════════════ CONVERSATION PHASES (warmup, background, candidate-qa) ═══════════════════ */
  const isConversationPhase = ["warmup", "background", "candidate-qa"].includes(currentPhase);

  if (isConversationPhase) {
    const getMessage = () => {
      if (currentPhase === "warmup") return getWarmUpMessage();
      if (currentPhase === "background") return getBackgroundMessage();
      return candidateQAPrompt || "Before I let you go — do you have any questions for me about the role or the team?";
    };

    const handleSubmit = () => {
      if (currentPhase === "warmup") handleWarmUpSubmit();
      else if (currentPhase === "background") handleBackgroundSubmit();
      else handleCandidateQuestionSubmit();
    };

    const msg = getMessage();

    return (
      <div style={{ minHeight: "100vh", background: bg, display: "flex", flexDirection: "column" }}>
        <PhaseBar phase={currentPhase} timer={timer} />
        {!hideSelfPreview && <SelfPreviewCard videoRef={selfVideoRef} cameraOn={selfCameraOn} />}

        {/* Chat area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 16, maxWidth: 800, width: "100%", margin: "0 auto" }}>

          {/* AI message */}
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <AIAvatar name={interview.interviewerName} speaking={aiSpeaking} processing={isProcessing} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.75rem", color: "var(--c-muted)", marginBottom: 6, fontWeight: 600 }}>
                {interview.interviewerName}
                {interviewerReaction?.audioClue && <span style={{ marginLeft: 8, color: "var(--c-dim)", fontStyle: "italic" }}>({interviewerReaction.audioClue})</span>}
              </div>
              <MessageBubble isAI speaking={aiSpeaking} processing={isProcessing}>
                {msg}
              </MessageBubble>
            </div>
          </div>

          {/* Candidate-QA special: done button */}
          {currentPhase === "candidate-qa" && (candidateQuestionsAsked >= 2 || remainingCandidateQuestions <= 0) && (
            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0" }}>
              <button onClick={finishCandidateQA}
                style={{
                  padding: "10px 28px", borderRadius: 99, border: "none",
                  background: "linear-gradient(135deg,#10b981,#059669)",
                  color: "white", fontWeight: 700, fontSize: "0.88rem", fontFamily: "Inter,sans-serif",
                  cursor: "pointer", boxShadow: "0 4px 14px rgba(16,185,129,0.35)",
                }}
              >✓ I'm All Done</button>
            </div>
          )}
        </div>

        {/* Input bar */}
        <ResponseArea
          value={candidateResponse} onChange={e => setCandidateResponse(e.target.value)}
          onSubmit={handleSubmit} onMic={tryMic} listening={listening}
          disabled={isProcessing || (currentPhase === "candidate-qa" && remainingCandidateQuestions <= 0)} aiSpeaking={aiSpeaking}
          placeholder={currentPhase === "candidate-qa" ? "Ask about the role, team, tech stack…" : "Type your response…"}
          submitLabel={currentPhase === "candidate-qa" ? "Ask" : "Send"}
        />
      </div>
    );
  }

  /* ═══════════════════ CLOSING ═══════════════════ */
  if (currentPhase === "closing") {
    return (
      <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div className="animate-fade-in" style={{
          maxWidth: 480, width: "100%", textAlign: "center",
          background: cardBg, border: `1px solid ${borderC}`, borderRadius: 24,
          padding: "48px 36px", backdropFilter: "blur(20px)",
          boxShadow: "0 0 60px rgba(99,102,241,0.1), 0 24px 48px rgba(0,0,0,0.5)",
        }}>
          <AIAvatar name={interview.interviewerName} speaking={aiSpeaking} size={72} />
          <div style={{ marginTop: 20 }}>
            <MessageBubble isAI speaking={aiSpeaking}>
              {closingMessage || "This was really great. We'll be in touch within a week or so."}
            </MessageBubble>
          </div>
          <div style={{ fontSize: "3rem", marginTop: 24 }}>👋</div>
          <p style={{ color: "var(--c-muted)", fontSize: "0.9rem", marginTop: 8 }}>Interview ending…</p>
        </div>
      </div>
    );
  }

  /* ═══════════════════ CORE QUESTIONS ═══════════════════ */
  const q = interview.questions?.[currentQ];
  const isLast = currentQ === (interview.questions?.length || 1) - 1;
  const questionText = followUp || q?.question;
  const timeElapsed = questionStartTime ? Math.floor((Date.now() - questionStartTime) / 1000) : 0;
  const timeRemaining = Math.max(0, questionTimeLimit - timeElapsed);
  const isTimeWarning = timeRemaining < 30;

  return (
    <div style={{ minHeight: "100vh", background: bg, display: "flex", flexDirection: "column" }}>
      <PhaseBar phase="core-questions" timer={timer} questionIndex={currentQ} totalQuestions={interview.questions?.length} />
      {!hideSelfPreview && <SelfPreviewCard videoRef={selfVideoRef} cameraOn={selfCameraOn} />}

      {/* Main content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 18, maxWidth: 800, width: "100%", margin: "0 auto" }}>

        {/* Time progress for this question */}
        <div style={{
          padding: "10px 16px", borderRadius: 12,
          background: isTimeWarning ? "rgba(244,63,94,0.06)" : "rgba(99,102,241,0.04)",
          border: `1px solid ${isTimeWarning ? "rgba(244,63,94,0.2)" : borderC}`,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 600, color: isTimeWarning ? "#f43f5e" : "var(--c-muted)" }}>
            {isTimeWarning ? "⚠️" : "⏱️"} {timeRemaining}s
          </span>
          <div style={{ flex: 1, height: 4, borderRadius: 99, background: "rgba(99,102,241,0.1)", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 99, transition: "width 1s linear",
              width: `${Math.min(100, (timeElapsed / questionTimeLimit) * 100)}%`,
              background: isTimeWarning ? "linear-gradient(90deg,#f43f5e,#ef4444)" : "linear-gradient(90deg,#6366f1,#818cf8)",
            }} />
          </div>
          <span style={{ fontSize: "0.72rem", color: "var(--c-dim)" }}>/ {questionTimeLimit}s</span>
        </div>

        {/* AI interviewer section */}
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <AIAvatar name={interview.interviewerName} speaking={aiSpeaking} processing={isProcessing} reaction={interviewerReaction} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.75rem", color: "var(--c-muted)", marginBottom: 6, fontWeight: 600 }}>
              {interview.interviewerName}
              {interviewerReaction?.audioClue && <span style={{ marginLeft: 8, fontStyle: "italic", color: "var(--c-dim)" }}>({interviewerReaction.audioClue})</span>}
            </div>

            {/* Interruption warning */}
            {interruptMessage && shouldInterrupt && (
              <div style={{
                padding: "10px 14px", marginBottom: 8, borderRadius: 12,
                background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.22)",
                fontSize: "0.85rem", color: "#f59e0b",
              }}>
                <span style={{ fontWeight: 700 }}>⚠️ Interruption:</span> {interruptMessage}
              </div>
            )}

            {/* Question card */}
            {showQuestionCard ? (
              <div style={{
                padding: "14px 18px", borderRadius: "4px 16px 16px 16px",
                background: "rgba(99,102,241,0.06)", border: `1px solid rgba(99,102,241,0.2)`,
              }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                  {followUp ? "Follow-up" : `Question ${currentQ + 1}`}
                </div>
                <p style={{ fontSize: "0.92rem", color: "#e8edf5", lineHeight: 1.65 }}>{questionText}</p>
              </div>
            ) : (
              <MessageBubble isAI speaking={aiSpeaking} processing={isProcessing}>
                Listen to the question…
              </MessageBubble>
            )}
          </div>
        </div>

        {/* Score display */}
        {receivedScore !== null && (
          <div style={{
            padding: "14px 18px", borderRadius: 14,
            background: scoreBg(receivedScore), border: `1px solid ${scoreColor(receivedScore)}25`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--c-muted)" }}>Score</span>
              <span style={{
                fontSize: "1.3rem", fontWeight: 900, fontFamily: "Outfit,sans-serif", color: scoreColor(receivedScore),
              }}>{receivedScore}/10</span>
            </div>
            {interviewerReaction?.bodylanguage && (
              <span style={{ fontSize: "0.78rem", color: "var(--c-dim)", fontStyle: "italic" }}>({interviewerReaction.bodylanguage})</span>
            )}
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div style={{
            padding: "16px 18px", borderRadius: 14,
            background: "rgba(26,37,64,0.4)", borderLeft: `3px solid ${scoreColor(receivedScore || 5)}`,
            fontSize: "0.88rem", color: "#c8d0df", lineHeight: 1.7,
          }}>
            <div style={{ fontWeight: 700, fontSize: "0.78rem", color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Feedback</div>
            <p>{feedback}</p>

            {/* Redemption */}
            {canRedeemAnswer && !redemptionUsed && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${borderC}` }}>
                <p style={{ fontSize: "0.82rem", color: "var(--c-muted)", marginBottom: 10 }}>You have one chance to clarify or rephrase:</p>
                <button onClick={handleAnswerRedemption}
                  style={{
                    padding: "8px 20px", borderRadius: 10, border: "1px solid rgba(245,158,11,0.3)",
                    background: "rgba(245,158,11,0.1)", color: "#f59e0b", fontWeight: 700,
                    fontSize: "0.82rem", fontFamily: "Inter,sans-serif", cursor: "pointer",
                  }}
                >🔄 Improve My Answer</button>
              </div>
            )}
          </div>
        )}

        {/* Next / Continue buttons */}
        {feedback && !followUp && !canRedeemAnswer && (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            {!isLast ? (
              <button onClick={nextQuestion}
                style={{
                  padding: "11px 28px", borderRadius: 12, border: "none",
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  color: "white", fontWeight: 700, fontSize: "0.88rem", fontFamily: "Inter,sans-serif",
                  cursor: "pointer", boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
                }}
              >Next Question →</button>
            ) : (
              <button onClick={startCandidateQAPhase}
                style={{
                  padding: "11px 28px", borderRadius: 12, border: "none",
                  background: "linear-gradient(135deg,#8b5cf6,#06b6d4)",
                  color: "white", fontWeight: 700, fontSize: "0.88rem", fontFamily: "Inter,sans-serif",
                  cursor: "pointer", boxShadow: "0 4px 14px rgba(139,92,246,0.35)",
                }}
              >Continue to Candidate Q&A →</button>
            )}
          </div>
        )}

        {followUp && (
          <p style={{ fontSize: "0.82rem", color: "var(--c-muted)", padding: "0 4px" }}>Follow-up — answer above, then submit.</p>
        )}

        {/* Overall progress */}
        <div style={{ marginTop: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: "0.75rem", color: "var(--c-muted)", fontWeight: 600 }}>Progress</span>
            <span style={{ fontSize: "0.75rem", color: "var(--c-muted)" }}>{currentQ + 1} / {interview.questions?.length || 0}</span>
          </div>
          <div style={{ height: 4, borderRadius: 99, background: "rgba(99,102,241,0.1)" }}>
            <div style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#6366f1,#8b5cf6)", transition: "width 0.5s", width: `${((currentQ + 1) / (interview.questions?.length || 1)) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Answer input bar */}
      <ResponseArea
        value={answer} onChange={e => setAnswer(e.target.value)}
        onSubmit={handleCoreSubmit} onMic={tryMic} listening={listening}
        disabled={isProcessing} aiSpeaking={aiSpeaking}
        placeholder="Type your answer…"
        submitLabel="Submit Answer"
      />
    </div>
  );
};

export default InterviewSessionPage;
