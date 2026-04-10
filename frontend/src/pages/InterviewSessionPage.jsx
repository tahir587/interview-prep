import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  getInterview, 
  submitAnswer, 
  completeInterview,
  completeLobby,
  joinInterview,
  submitWarmUp,
  submitBackground,
  startCandidateQA,
  submitCandidateQuestion,
  startClosing
} from "../services/api";
import InterviewLobby from "../components/interview/InterviewLobby";

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
  const [closingMessage, setClosingMessage] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [timer, setTimer] = useState(0);
  const [listening, setListening] = useState(false);
  const [showQuestionCard, setShowQuestionCard] = useState(false);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const isSpeakingRef = useRef(false);

  const speak = useCallback((text, callback = null) => {
    if (!text || isSpeakingRef.current) return;
    isSpeakingRef.current = true;
    setAiSpeaking(true);

    if (recognitionRef.current && listening) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 0.9;
    speech.volume = 1;

    speech.onend = () => {
      isSpeakingRef.current = false;
      setAiSpeaking(false);
      if (callback) callback();
    };

    speech.onerror = () => {
      isSpeakingRef.current = false;
      setAiSpeaking(false);
    };

    window.speechSynthesis.speak(speech);
  }, [listening]);

  useEffect(() => {
    getInterview(id)
      .then(r => {
        setInterview(r.data);
        setCurrentPhase(r.data.currentPhase || "lobby");
        if (r.data.questions) {
          for (let i = 0; i < r.data.questions.length; i++) {
            if (!r.data.questions[i].userAnswer || r.data.questions[i].userAnswer === "") {
              setCurrentQ(i);
              break;
            }
            if (i === r.data.questions.length - 1) setCurrentQ(i);
          }
        }
        if (r.data.warmUpConversation) setWarmUpCount(r.data.warmUpConversation.length);
        if (r.data.backgroundConversation) setBackgroundCount(r.data.backgroundConversation.filter(b => b.userResponse).length);
      })
      .catch(console.error);

    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); window.speechSynthesis.cancel(); };
  }, [id]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => { setListening(false); };
    recognition.onresult = (event) => { if (aiSpeaking || isProcessing) return; setAnswer(event.results[0][0].transcript); };
    recognitionRef.current = recognition;
    return () => { if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch (e) {} } };
  }, [aiSpeaking, isProcessing]);

  useEffect(() => {
    if (currentPhase === "core-questions" && interview?.questions) {
      const question = interview.questions[currentQ]?.question;
      if (question) setTimeout(() => speak(question), 1000);
    }
  }, [currentPhase, currentQ, interview, speak]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const handleLobbyComplete = async (data) => { await completeLobby(id, data); };
  const handleJoinInterview = async () => { await joinInterview(id); setCurrentPhase("warmup"); speak("Hi there! How's your day going? Did you have far to travel?"); };

  const handleWarmUpSubmit = async () => {
    if (!candidateResponse.trim() || isProcessing) return;
    setIsProcessing(true);
    try {
      const res = await submitWarmUp(id, { userResponse: candidateResponse, isFirstResponse: warmUpCount === 0 });
      setWarmUpCount(prev => prev + 1);
      speak(res.data.aiResponse, () => {
        if (res.data.shouldMoveToBackground) {
          setTimeout(() => { setCurrentPhase("background"); if (res.data.backgroundQuestion) setTimeout(() => speak(res.data.backgroundQuestion), 500); }, 1500);
        }
      });
      setCandidateResponse("");
    } catch (err) { console.error("Warm-up error:", err); } finally { setIsProcessing(false); }
  };

  const handleBackgroundSubmit = async () => {
    if (!candidateResponse.trim() || isProcessing) return;
    setIsProcessing(true);
    try {
      const res = await submitBackground(id, { userResponse: candidateResponse, questionIndex: backgroundCount });
      setBackgroundCount(prev => prev + 1);
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
      setFeedback(res.data.feedback);
      setReceivedScore(res.data.score);
      setShowQuestionCard(true);
      if (res.data.followUp && !followUpAsked) {
        setFollowUpAsked(true);
        speak(res.data.feedback, () => { setTimeout(() => { speak("Let's take this a step further. " + res.data.followUp); setFollowUp(res.data.followUp); }, 500); });
      } else { speak(res.data.feedback); }
    } catch (err) { 
      const fallbackMsg = "Thanks for your answer. Let's move to the next question.";
      setFeedback(fallbackMsg); 
      speak(fallbackMsg); 
    } finally { setIsProcessing(false); }
  };

  const nextQuestion = () => { setAnswer(""); setFeedback(null); setReceivedScore(null); setFollowUp(null); setFollowUpAsked(false); setShowQuestionCard(false); setCurrentQ(q => q + 1); };

  const startCandidateQAPhase = async () => {
    try {
      const res = await startCandidateQA(id);
      setCandidateQAPrompt(res.data.prompt);
      setCurrentPhase("candidate-qa");
      setTimeout(() => speak(res.data.prompt), 500);
    } catch (err) { console.error("Start candidate QA error:", err); }
  };

  const handleCandidateQuestionSubmit = async () => {
    if (!candidateResponse.trim() || isProcessing) return;
    setIsProcessing(true);
    try {
      const res = await submitCandidateQuestion(id, { question: candidateResponse });
      speak(res.data.answer);
      setCandidateQuestionsAsked(prev => prev + 1);
      setCandidateResponse("");
    } catch (err) { console.error("Candidate question error:", err); } finally { setIsProcessing(false); }
  };

  const finishCandidateQA = async () => {
    try {
      const res = await startClosing(id);
      setClosingMessage(res.data.closingMessage);
      setCurrentPhase("closing");
      speak(res.data.closingMessage);
      setTimeout(() => setShowResults(true), 4000);
    } catch (err) { console.error("Finish candidate QA error:", err); }
  };

  const finishInterview = async () => { try { await completeInterview(id, { duration: timer }); navigate("/interview"); } catch (err) { console.error("Complete error:", err); } };

  const getWarmUpMessage = () => {
    if (aiSpeaking) return <span><span className="animate-pulse">🔊</span> Speaking...</span>;
    if (warmUpCount === 0) return "How's your day going? Did you have far to travel?";
    if (warmUpCount === 1) return "That sounds nice. I'd love to hear more about your background.";
    return "Great! Let's get started with the interview.";
  };

  const getBackgroundMessage = () => {
    if (aiSpeaking) return <span><span className="animate-pulse">🔊</span> Speaking...</span>;
    return interview.backgroundConversation?.[backgroundCount]?.question || "Walk me through your resume — what have you been focused on lately?";
  };

  const getScoreColor = (score) => {
    if (score >= 7) return "text-green-600";
    if (score >= 4) return "text-yellow-600";
    return "text-red-600";
  };

  if (!interview) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <p className="text-gray-600">Loading interview...</p>
      </div>
    </div>
  );

  if (showResults) {
    const totalScore = interview.questions?.reduce((acc, q) => acc + (q.score || 0), 0) / (interview.questions?.length || 1) * 10;
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Interview Complete!</h1>
          <p className="text-gray-600 mb-6">Great job completing the mock interview.</p>
          <div className="bg-gray-100 rounded-lg p-6 mb-6">
            <div className="text-sm text-gray-500 mb-2">Your Score</div>
            <div className={`text-5xl font-bold ${getScoreColor(totalScore)}`}>{Math.round(totalScore)}%</div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{interview.questions?.length || 0}</div>
              <div className="text-sm text-gray-600">Questions</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{formatTime(timer)}</div>
              <div className="text-sm text-gray-600">Duration</div>
            </div>
          </div>
          <button onClick={() => navigate("/interview")} className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold">Back to Interviews</button>
        </div>
      </div>
    );
  }

  if (currentPhase === "lobby") return <InterviewLobby interview={interview} onComplete={handleLobbyComplete} onJoin={handleJoinInterview} />;

  if (currentPhase === "warmup") return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow p-4 mb-4 flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-500">Phase</span>
            <h2 className="font-bold text-lg">Warm-Up</h2>
          </div>
          <div className="font-mono text-xl">{formatTime(timer)}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0">{interview.interviewerName?.[0] || "A"}</div>
            <div className="flex-1">
              <div className="text-sm text-gray-500 mb-1">{interview.interviewerName}</div>
              <div className={`p-4 rounded-lg ${aiSpeaking ? 'bg-blue-100' : 'bg-gray-100'}`}>{getWarmUpMessage()}</div>
            </div>
          </div>
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Your response</label>
            <textarea value={candidateResponse} onChange={e => setCandidateResponse(e.target.value)} rows={3} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Type your response..." disabled={isProcessing} />
            <div className="flex gap-3 mt-3">
              <button onClick={() => !aiSpeaking && !isProcessing && recognitionRef.current?.start()} disabled={aiSpeaking || isProcessing} className={`px-4 py-2 rounded text-white ${listening ? 'bg-green-600' : aiSpeaking || isProcessing ? 'bg-gray-400' : 'bg-gray-800 hover:bg-gray-900'}`}>{listening ? '🎤 Listening...' : '🎤 Speak'}</button>
            </div>
            <button onClick={handleWarmUpSubmit} disabled={!candidateResponse.trim() || isProcessing} className={`mt-4 px-6 py-2 rounded text-white ${!candidateResponse.trim() || isProcessing ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>{isProcessing ? 'Processing...' : 'Send'}</button>
          </div>
        </div>
      </div>
    </div>
  );

  if (currentPhase === "background") return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow p-4 mb-4 flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-500">Phase</span>
            <h2 className="font-bold text-lg">Background & Role</h2>
          </div>
          <div className="font-mono text-xl">{formatTime(timer)}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0">{interview.interviewerName?.[0] || "A"}</div>
            <div className="flex-1">
              <div className="text-sm text-gray-500 mb-1">{interview.interviewerName}</div>
<div className={`p-4 rounded-lg ${aiSpeaking ? 'bg-blue-100' : 'bg-gray-100'}`}>{getBackgroundMessage()}</div>
            </div>
          </div>
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Your response</label>
            <textarea value={candidateResponse} onChange={e => setCandidateResponse(e.target.value)} rows={4} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Share your background and experience..." disabled={isProcessing} />
            <div className="flex gap-3 mt-3">
              <button onClick={() => !aiSpeaking && !isProcessing && recognitionRef.current?.start()} disabled={aiSpeaking || isProcessing} className={`px-4 py-2 rounded text-white ${listening ? 'bg-green-600' : aiSpeaking || isProcessing ? 'bg-gray-400' : 'bg-gray-800 hover:bg-gray-900'}`}>{listening ? '🎤 Listening...' : '🎤 Speak'}</button>
            </div>
            <button onClick={handleBackgroundSubmit} disabled={!candidateResponse.trim() || isProcessing} className={`mt-4 px-6 py-2 rounded text-white ${!candidateResponse.trim() || isProcessing ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>{isProcessing ? 'Processing...' : 'Submit'}</button>
          </div>
        </div>
      </div>
    </div>
  );

  const q = interview.questions?.[currentQ];
  const isLast = currentQ === (interview.questions?.length || 1) - 1;
  const questionText = followUp || q?.question;

  if (currentPhase === "core-questions") return (
    <div className="max-w-3xl mx-auto space-y-6 p-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold">{interview.title}</h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">Question {currentQ + 1} of {interview.questions?.length || 0}</div>
          <div className="font-mono text-lg bg-gray-100 px-3 py-1 rounded">{formatTime(timer)}</div>
        </div>
      </div>
      {receivedScore !== null && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2">
            <span className="font-medium">Your Score:</span>
            <span className={`text-xl font-bold ${getScoreColor(receivedScore)}`}>{receivedScore}/10</span>
          </div>
        </div>
      )}
      <div className="bg-white p-6 shadow rounded-lg">
        {showQuestionCard && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="text-sm text-blue-600 font-medium mb-1">Question</div>
            <p className="text-lg">{questionText}</p>
          </div>
        )}
        {!showQuestionCard && <p className="mb-4 font-medium text-lg text-gray-700">Listen to the question...</p>}
        {aiSpeaking && !showQuestionCard && <div className="flex items-center gap-2 text-blue-600 mb-4"><span className="animate-pulse text-2xl">🔊</span><span>Interviewer is speaking...</span></div>}
        <textarea value={answer} onChange={e => setAnswer(e.target.value)} rows={4} className="w-full border rounded p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Type your answer..." disabled={isProcessing} />
        <div className="flex gap-3 mt-3">
          <button onClick={() => !aiSpeaking && !isProcessing && recognitionRef.current?.start()} disabled={aiSpeaking || isProcessing} className={`px-4 py-2 rounded text-white ${listening ? 'bg-green-600' : aiSpeaking || isProcessing ? 'bg-gray-400' : 'bg-gray-800 hover:bg-gray-900'}`}>{listening ? '🎤 Listening...' : '🎤 Speak'}</button>
          {aiSpeaking && <span className="text-blue-600 flex items-center">🔊 AI Speaking...</span>}
        </div>
        <button onClick={handleCoreSubmit} disabled={!answer.trim() || isProcessing} className={`mt-4 px-4 py-2 rounded text-white ${!answer.trim() || isProcessing ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>{isProcessing ? 'Processing...' : 'Submit Answer'}</button>
        {feedback && (
          <div className="bg-gray-50 p-4 mt-4 rounded border-l-4 border-blue-500">
            <p className="font-medium mb-2">Feedback:</p>
            <p>{feedback}</p>
          </div>
        )}
        {feedback && !followUp && (
          <div className="mt-4">
            {!isLast ? (
              <button onClick={nextQuestion} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Next Question →</button>
            ) : (
              <button onClick={startCandidateQAPhase} className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700">Continue to Candidate Q&A →</button>
            )}
          </div>
        )}
        {followUp && !feedback && <div className="mt-4"><p className="text-sm text-gray-600 mb-2">Follow-up - answer above, then Submit</p></div>}
      </div>
      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1"><span>Progress</span><span>{currentQ + 1}/{interview.questions?.length || 0}</span></div>
        <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: `${((currentQ + 1) / (interview.questions?.length || 1)) * 100}%` }} /></div>
      </div>
    </div>
  );

  if (currentPhase === "candidate-qa") return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow p-4 mb-4 flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-500">Phase</span>
            <h2 className="font-bold text-lg">Your Questions</h2>
          </div>
          <div className="font-mono text-xl">{formatTime(timer)}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0">{interview.interviewerName?.[0] || "A"}</div>
            <div className="flex-1">
              <div className="text-sm text-gray-500 mb-1">{interview.interviewerName}</div>
              <div className={`p-4 rounded-lg ${aiSpeaking ? 'bg-blue-100' : 'bg-gray-100'}`}>
                {aiSpeaking ? <span><span className="animate-pulse">🔊</span> Speaking...</span> : candidateQAPrompt || "Before I let you go — do you have any questions for me about the role or the team?"}
              </div>
            </div>
          </div>
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Ask a question</label>
            <textarea value={candidateResponse} onChange={e => setCandidateResponse(e.target.value)} rows={2} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g., What's the team size? What's the tech stack?" disabled={isProcessing} />
            <div className="flex gap-3 mt-3">
              <button onClick={handleCandidateQuestionSubmit} disabled={!candidateResponse.trim() || isProcessing} className={`px-4 py-2 rounded text-white ${!candidateResponse.trim() || isProcessing ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>{isProcessing ? 'Processing...' : 'Ask Question'}</button>
            </div>
            {candidateQuestionsAsked >= 1 && (
              <div className="mt-6 pt-4 border-t">
                <button onClick={finishCandidateQA} className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">I'm All Done →</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (currentPhase === "closing") return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-6">{interview.interviewerName?.[0] || "A"}</div>
        <div className={`p-4 rounded-lg mb-6 ${aiSpeaking ? 'bg-blue-100' : 'bg-gray-100'}`}>
          {aiSpeaking ? <span><span className="animate-pulse">🔊</span> Speaking...</span> : closingMessage || "This was really great. We'll be in touch within a week or so."}
        </div>
        <div className="text-4xl mb-4">👋</div>
        <p className="text-gray-500">Interview ending...</p>
      </div>
    </div>
  );

  return null;
};

export default InterviewSessionPage;


