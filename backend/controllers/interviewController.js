import MockInterview from "../models/Mockinterview.js";
import Progress from "../models/Progress.js";

import {
  generateQuestions,
  evaluateAnswer,
  generateOverallFeedback,
  generateFollowUp,
  generateWarmUpGreeting,
  generateWarmUpResponse,
  generateBackgroundQuestions,
  generateBackgroundResponse,
  generateCandidateQAAnswers,
  generateClosingMessage,
  generateProbeFollowUp,
  generateInterrupterResponse,
  generateAdaptiveQuestion,
  generateInterviewerReaction
} from "../services/aiService.js";

// @desc   Start a new mock interview
// @route  POST /api/interview/start
export const startInterview = async (req, res) => {
  try {
    const { type, company, difficulty, questionCount = 5, resumeText = "" } = req.body;

    if (!type || !difficulty) {
      return res.status(400).json({ message: "Type and difficulty are required" });
    }

    const normalizedResume = typeof resumeText === "string" ? resumeText.trim() : "";

    // Generate questions for core interview
    const aiQuestions = await generateQuestions({
      type,
      company,
      difficulty,
      count: questionCount,
      resumeText: normalizedResume
    });

    const questions = aiQuestions.map((q) => ({
      question: q.question,
      questionType: q.questionType || "technical",
      userAnswer: "",
      aiFeedback: "",
      score: 0,
      displayedAsCard: false
    }));

    let backgroundConversation = [];
    try {
      const bgQuestions = await generateBackgroundQuestions(normalizedResume);
      backgroundConversation = (Array.isArray(bgQuestions) ? bgQuestions : []).map((q) => ({
        question: q.question,
        userResponse: "",
        aiResponse: ""
      }));
    } catch (err) {
      const fallbackBgQuestions = await generateBackgroundQuestions();
      backgroundConversation = (Array.isArray(fallbackBgQuestions) ? fallbackBgQuestions : []).map((q) => ({
        question: q.question,
        userResponse: "",
        aiResponse: ""
      }));
    }

    const interview = await MockInterview.create({
      user: req.user._id,
      title: `${company || "General"} ${type} Interview`,
      type,
      company: company || "General",
      difficulty,
      questions,
      backgroundConversation,
      status: "in-progress",
      currentPhase: "lobby",
      phaseTimestamps: {
        lobbyStarted: new Date()
      }
    });

    res.status(201).json(interview);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Synthesize interviewer voice with ElevenLabs
// @route  POST /api/interview/tts
export const synthesizeInterviewSpeech = async (req, res) => {
  try {
    const { text, voiceId } = req.body;

    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ message: "Text is required" });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
    if (!apiKey) {
      return res.status(503).json({ message: "ElevenLabs voice is not configured" });
    }

    const normalizedText = text.replace(/\s+/g, " ").trim().slice(0, 1800);
    const selectedVoiceId = (voiceId || process.env.ELEVENLABS_VOICE_ID || "EXAVITQu4vr4xnSDxMaL").trim();
    const modelId = (process.env.ELEVENLABS_MODEL_ID || "eleven_turbo_v2_5").trim();

    const elevenResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg"
        },
        body: JSON.stringify({
          text: normalizedText,
          model_id: modelId,
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.82,
            style: 0.35,
            use_speaker_boost: true
          }
        })
      }
    );

    if (!elevenResponse.ok) {
      const details = await elevenResponse.text();
      return res.status(502).json({
        message: "Failed to generate ElevenLabs speech",
        details: details.slice(0, 300)
      });
    }

    const audioArrayBuffer = await elevenResponse.arrayBuffer();
    const audioBuffer = Buffer.from(audioArrayBuffer);

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Length", String(audioBuffer.length));

    return res.status(200).send(audioBuffer);
  } catch (error) {
    console.error("ElevenLabs TTS error:", error);
    return res.status(500).json({ message: "Failed to synthesize interviewer voice" });
  }
};

// @desc   Complete lobby tech check
// @route  POST /api/interview/:id/lobby
export const completeLobby = async (req, res) => {
  try {
    const interview = await MockInterview.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const { cameraWorking, micWorking, audioTestComplete } = req.body;

    const cameraOk = cameraWorking === true;
    const micOk = micWorking === true;
    const audioOk = audioTestComplete === true;

    if (!cameraOk || !micOk || !audioOk) {
      return res.status(400).json({
        message: "Please complete camera, microphone, and audio checks before joining.",
        checks: {
          cameraWorking: cameraOk,
          micWorking: micOk,
          audioTestComplete: audioOk,
        },
      });
    }

    interview.lobbyData = {
      cameraWorking: cameraOk,
      micWorking: micOk,
      audioTestComplete: audioOk,
      techCheckComplete: true,
      interviewerJoined: false
    };

    // Start warmup phase
    interview.currentPhase = "warmup";
    interview.phaseTimestamps.warmupStarted = new Date();

    await interview.save();

    // Generate warm-up greeting
    const resumeHint = Array.isArray(interview.backgroundConversation)
      ? interview.backgroundConversation.map((item) => item.question).filter(Boolean).join(" ")
      : "";

    const greeting = await generateWarmUpGreeting({
      interviewerName: interview.interviewerName,
      company: interview.company,
      resumeText: resumeHint
    });

    res.json({
      message: "Lobby completed",
      nextPhase: "warmup",
      greeting: greeting
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Mark interviewer as joined
// @route  POST /api/interview/:id/join
export const joinInterview = async (req, res) => {
  try {
    const interview = await MockInterview.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    interview.lobbyData.interviewerJoined = true;
    await interview.save();

    res.json({ message: "Interviewer joined" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Submit warm-up response
// @route  POST /api/interview/:id/warmup
export const submitWarmUpResponse = async (req, res) => {
  try {
    const interview = await MockInterview.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (interview.currentPhase !== "warmup") {
      return res.status(400).json({ message: "Not in warm-up phase" });
    }

    const { userResponse, isFirstResponse } = req.body;

    let aiResponse = "";
    let shouldMoveToBackground = false;

    try {
      if (isFirstResponse) {
        // Generate response to candidate's first answer
        const result = await generateWarmUpResponse({
          userResponse,
          interviewerName: interview.interviewerName,
          company: interview.company
        });
        aiResponse = result.response;
        shouldMoveToBackground = result.readyToMoveOn || false;
      } else {
        // Second warm-up exchange - move to background
        aiResponse = "That sounds great. I'd love to hear more about your background.";
        shouldMoveToBackground = true;
      }
    } catch (err) {
      aiResponse = "Thanks for sharing. Let's talk about your background.";
      shouldMoveToBackground = true;
    }

    // Save conversation
    interview.warmUpConversation.push({
      question: isFirstResponse ? "How's your day going?" : "Did you have far to travel?",
      userResponse,
      aiResponse
    });

    // If ready, move to background phase
    if (shouldMoveToBackground) {
      interview.currentPhase = "background";
      interview.phaseTimestamps.backgroundStarted = new Date();

      // Backward-compatibility for existing interviews that don't have pre-generated background questions
      if (!Array.isArray(interview.backgroundConversation) || interview.backgroundConversation.length === 0) {
        const bgQuestions = await generateBackgroundQuestions();
        interview.backgroundConversation = bgQuestions.map(q => ({
          question: q.question,
          userResponse: "",
          aiResponse: ""
        }));
      }
    }

    await interview.save();

    res.json({
      aiResponse,
      shouldMoveToBackground,
      nextPhase: shouldMoveToBackground ? "background" : "warmup",
      backgroundQuestion: shouldMoveToBackground ? interview.backgroundConversation[0]?.question : null
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Submit background/resume response
// @route  POST /api/interview/:id/background
export const submitBackgroundResponse = async (req, res) => {
  try {
    const interview = await MockInterview.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (interview.currentPhase !== "background") {
      return res.status(400).json({ message: "Not in background phase" });
    }

    const { userResponse, questionIndex = 0 } = req.body;

    const bgQuestion = interview.backgroundConversation[questionIndex];

    let aiResponse = "";
    let followUpQuestion = null;
    let shouldAskFollowUp = false;
    let shouldMoveToCore = false;

    try {
      const result = await generateBackgroundResponse({
        question: bgQuestion?.question,
        userResponse,
        interviewerName: interview.interviewerName
      });
      
      aiResponse = result.response;
      followUpQuestion = result.followUpQuestion;
      shouldAskFollowUp = result.shouldAskFollowUp || false;

      const answeredCountBeforeCurrent = interview.backgroundConversation.filter((b) => (b.userResponse || "").trim().length > 0).length;
      const currentWasAlreadyAnswered = (bgQuestion?.userResponse || "").trim().length > 0;
      const answeredCount = answeredCountBeforeCurrent + (currentWasAlreadyAnswered ? 0 : 1);
      const minBackgroundExchanges = Math.min(2, Math.max(1, interview.backgroundConversation.length));
      const atEndOfBackgroundQuestions = questionIndex >= interview.backgroundConversation.length - 1;

      // Move to core only when we have enough signal (not immediately after first response).
      if ((!shouldAskFollowUp && answeredCount >= minBackgroundExchanges) || atEndOfBackgroundQuestions) {
        shouldMoveToCore = true;
      }
    } catch (err) {
      aiResponse = "Interesting. Let's move on to the technical questions.";
      shouldMoveToCore = true;
    }

    // Update conversation
    if (bgQuestion) {
      bgQuestion.userResponse = userResponse;
      bgQuestion.aiResponse = aiResponse;
    }

    if (shouldMoveToCore) {
      interview.currentPhase = "core-questions";
      interview.phaseTimestamps.coreQuestionsStarted = new Date();
    }

    await interview.save();

    const nextBackgroundIndex = shouldMoveToCore
      ? questionIndex + 1
      : (shouldAskFollowUp && followUpQuestion ? questionIndex : questionIndex + 1);

    const nextBackgroundQuestion = shouldMoveToCore
      ? null
      : (shouldAskFollowUp && followUpQuestion
        ? followUpQuestion
        : interview.backgroundConversation[questionIndex + 1]?.question || null);

    res.json({
      aiResponse,
      followUpQuestion,
      shouldAskFollowUp,
      shouldMoveToCore,
      nextPhase: shouldMoveToCore ? "core-questions" : "background",
      nextBackgroundIndex,
      nextBackgroundQuestion
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get next appropriate question based on performance
// @route  POST /api/interview/:id/adaptive-question/:questionIndex
export const getAdaptiveQuestion = async (req, res) => {
  try {
    const interview = await MockInterview.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const idx = Number(req.params.questionIndex);
    const currentQ = interview.questions[idx];

    if (!currentQ) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Calculate average score so far
    const answeredQuestions = interview.questions.slice(0, idx + 1).filter(q => q.score > 0);
    const avgScore = answeredQuestions.length > 0
      ? answeredQuestions.reduce((sum, q) => sum + q.score, 0) / answeredQuestions.length
      : 5;

    try {
      const nextQuestion = await generateAdaptiveQuestion({
        previousScore: currentQ.score,
        topic: currentQ.questionType || "technical",
        difficulty: interview.difficulty
      });

      res.json({
        nextQuestion: nextQuestion.question,
        expectedPoints: nextQuestion.expectedPoints,
        adjustedDifficulty: nextQuestion.difficulty,
        performanceLevel: avgScore < 4 ? "struggling" : avgScore < 7 ? "moderate" : "strong"
      });
    } catch (err) {
      console.error("Adaptive question generation error:", err);
      // Return original question
      res.json({
        nextQuestion: interview.questions[idx + 1]?.question || "How would you approach this problem?",
        performanceLevel: "unknown"
      });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Submit answer to core question
// @route  PUT /api/interview/:id/answer/:questionIndex
export const submitAnswer = async (req, res) => {
  try {
    const { answer } = req.body;

    const interview = await MockInterview.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const idx = Number(req.params.questionIndex);
    const q = interview.questions[idx];

    if (!q) {
      return res.status(404).json({ message: "Question not found" });
    }

    let feedback = "";
    let score = 5;
    let strengths = [];
    let improvements = [];
    let followUp = null;
    let interviewerReaction = null;
    let shouldInterrupt = false;
    let interruptMessage = null;

    const isLast = interview.questions.length - 1 === idx;
    const answerLength = answer.trim().split(/\s+/).length;
    const existingAnswer = (q.userAnswer || "").trim();
    const mergedAnswer = existingAnswer
      ? `${existingAnswer}\n\nFollow-up:\n${answer}`
      : answer;

    const normalizedAnswer = answer.toLowerCase();
    const userDoesntKnow =
      normalizedAnswer.includes("don't know") ||
      normalizedAnswer.includes("dont know") ||
      normalizedAnswer.includes("no idea") ||
      normalizedAnswer.includes("not sure") ||
      normalizedAnswer.includes("don't have any idea") ||
      normalizedAnswer.includes("dunno") ||
      normalizedAnswer.includes("no clue") ||
      normalizedAnswer.includes("not familiar");

    const userRequestedNextQuestion =
      /\b(next question|move on|move ahead|move to next|move to the next|go to next|go to the next|skip question|skip this question|skip the question|pass this question|pass the question|proceed to next|let'?s move on|can we move on)\b/i.test(normalizedAnswer) ||
      ["next", "skip", "pass", "next please"].includes(normalizedAnswer.trim());

    const MAX_FOLLOW_UPS = 1;
    const tooShortAnswer = answerLength < 10;
    const resumeHint = Array.isArray(interview.backgroundConversation)
      ? interview.backgroundConversation
          .map((item) => `${item.question || ""} ${item.userResponse || ""}`.trim())
          .filter(Boolean)
          .join(" ")
      : "";

    try {
      if (userRequestedNextQuestion) {
        feedback = isLast
          ? "Sure, let's wrap up this interview."
          : "Sure, let's move to the next question.";
        score = 0;
      } else if (userDoesntKnow) {
        feedback = "That's okay. Let's simplify this and focus on your approach.";
        score = 3;
      } else {
        const evaluation = await evaluateAnswer({
          question: q.question,
          userAnswer: mergedAnswer
        });

        if (typeof evaluation === 'object') {
          feedback = evaluation.feedback;
          score = typeof evaluation.score === 'number' ? Math.min(10, Math.max(0, evaluation.score)) : 5;
          strengths = evaluation.strengths || [];
          improvements = evaluation.improvements || [];
        } else {
          feedback = evaluation;
          score = 5;
        }

        // Smart interruption for overly general answers
        if (score < 4 && answerLength > 40 && Math.random() > 0.5) {
          try {
            const interrupt = await generateInterrupterResponse({
              question: q.question,
              userAnswer: answer,
              interviewerName: interview.interviewerName
            });
            interruptMessage = interrupt.interruption;
            shouldInterrupt = true;
            // Don't penalize heavily, but acknowledge the interruption
            score = Math.max(2, score - 1);
          } catch (err) {
            console.error("Interrupt generation error:", err);
          }
        }

      }

      // Generate interviewer reaction
      try {
        interviewerReaction = await generateInterviewerReaction({
          answerQuality: score < 4 ? "weak" : score < 7 ? "okay" : "strong",
          answerLength: tooShortAnswer ? "too_short" : answerLength > 100 ? "rambling" : "appropriate",
          isFollowUp: false
        });
      } catch (err) {
        console.error("Reaction generation error:", err);
      }

      // Ask follow-up only when candidate hasn't explicitly requested to move on.
      if (!userRequestedNextQuestion && q.followUpCount < MAX_FOLLOW_UPS) {
        try {
          const probingFollowUp = await generateProbeFollowUp({
            question: q.question,
            userAnswer: answer,
            answerLength,
            previousScore: score,
            interviewType: interview.type,
            difficulty: interview.difficulty,
            resumeText: resumeHint,
            previousAnswers: [answer]
          });
          followUp = probingFollowUp.followUp;
        } catch (err) {
          console.error("Follow-up generation error:", err);
        }

        if (!followUp) {
          followUp = score < 4
            ? "Let's simplify this. What is the first concrete step you would take?"
            : score >= 7
              ? "Good. What trade-off would you consider if scale doubled?"
              : "Why did you choose this approach over alternatives?";
        }

        q.followUpCount = (q.followUpCount || 0) + 1;
        if (!q.followUps) q.followUps = [];
        q.followUps.push(followUp);
      }

      if (!followUp && !feedback.includes("next question") && !feedback.includes("wrap up") && !shouldInterrupt) {
        const nextQuestionText = !isLast ? " Let's move to our next question." : " Let's wrap up this interview.";
        feedback = feedback + nextQuestionText;
      }

    } catch (err) {
      console.error("AI error:", err);
      feedback = "Thanks for your answer. Let's move to the next question.";
      score = 5;
    }

    q.userAnswer = mergedAnswer;
    q.aiFeedback = typeof feedback === 'object' ? JSON.stringify(feedback) : feedback;
    q.score = score;

    if (strengths.length > 0 || improvements.length > 0) {
      q.strengths = strengths;
      q.improvements = improvements;
    }

    // Mark question as displayed as card
    q.displayedAsCard = true;

    await interview.save();

    const hasMoreFollowUps = q.followUpCount < MAX_FOLLOW_UPS;

    const feedbackText = typeof feedback === 'object'
      ? `Strengths: ${strengths.join(', ')}. Improvements: ${improvements.join(', ')}. ${feedback}`
      : feedback;

    res.json({
      feedback: feedbackText,
      feedbackObj: typeof feedback === 'object' ? feedback : null,
      score,
      followUp,
      userRequestedNextQuestion,
      hasMoreFollowUps,
      isLastQuestion: isLast,
      interviewerReaction,
      shouldInterrupt,
      interruptMessage
    });

  } catch (error) {
    console.error("Submit answer error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc   Start candidate Q&A phase
// @route  POST /api/interview/:id/candidate-qa/start
export const startCandidateQA = async (req, res) => {
  try {
    const interview = await MockInterview.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Generate pre-baked Q&A for candidate questions
    const candidateQA = await generateCandidateQAAnswers({
      company: interview.company,
      role: interview.interviewerRole,
      type: interview.type
    });

    interview.candidateQuestions = candidateQA;
    interview.candidateQuestionsAskedCount = 0;
    interview.currentPhase = "candidate-qa";
    interview.phaseTimestamps.candidateQAStarted = new Date();

    await interview.save();

    res.json({
      message: "Candidate Q&A phase started",
      prompt: "Before I let you go — do you have any questions for me about the role or the team?",
      prebakedQA: candidateQA,
      remainingQuestions: 3
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Submit candidate's question
// @route  POST /api/interview/:id/candidate-qa/question
export const submitCandidateQuestion = async (req, res) => {
  try {
    const interview = await MockInterview.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (interview.currentPhase !== "candidate-qa") {
      return res.status(400).json({ message: "Not in candidate Q&A phase" });
    }

    const { question } = req.body;

    const MAX_CANDIDATE_QUESTIONS = 3;
    const askedCount = interview.candidateQuestionsAskedCount || 0;
    if (askedCount >= MAX_CANDIDATE_QUESTIONS) {
      return res.status(400).json({
        message: "Candidate Q&A limit reached",
        remainingQuestions: 0,
        canContinue: false,
      });
    }

    // Find matching pre-baked answer or generate one
    let aiAnswer = "";

    const normalize = (value = "") =>
      value
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const incoming = normalize(question);
    const incomingTokens = incoming.split(" ").filter((t) => t.length > 2);

    let matched = null;
    let bestScore = 0;
    for (const item of interview.candidateQuestions) {
      const candidate = normalize(item.question);
      const candidateTokens = new Set(candidate.split(" ").filter((t) => t.length > 2));
      const overlap = incomingTokens.reduce((count, token) => count + (candidateTokens.has(token) ? 1 : 0), 0);
      if (overlap > bestScore) {
        bestScore = overlap;
        matched = item;
      }
    }

    if (matched) {
      aiAnswer = matched.aiAnswer;
    } else {
      aiAnswer = `Great question. For this ${interview.interviewerRole} role at ${interview.company}, we'd evaluate impact, ownership, and collaboration. Happy to share specifics based on what matters most to you.`;
    }

    interview.candidateQuestionsAskedCount = askedCount + 1;
    await interview.save();

    const remainingQuestions = Math.max(0, MAX_CANDIDATE_QUESTIONS - interview.candidateQuestionsAskedCount);

    res.json({
      answer: aiAnswer,
      remainingQuestions,
      canContinue: remainingQuestions > 0
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Complete candidate Q&A and start closing
// @route  POST /api/interview/:id/closing
export const startClosing = async (req, res) => {
  try {
    const interview = await MockInterview.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    interview.currentPhase = "closing";
    interview.phaseTimestamps.closingStarted = new Date();

    await interview.save();

    // Generate closing message
    const closingMessage = await generateClosingMessage({
      candidateName: req.user.name,
      overallScore: interview.overallScore || 50,
      interviewerName: interview.interviewerName
    });

    res.json({
      message: "Interview closing started",
      closingMessage
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Complete the interview
// @route  PUT /api/interview/:id/complete
export const completeInterview = async (req, res) => {
  try {
    const interview = await MockInterview.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Calculate overall score
    const answeredQuestions = interview.questions.filter(q => q.score > 0);
    const totalScore = answeredQuestions.reduce((sum, q) => sum + q.score, 0);
    const overallScore = answeredQuestions.length > 0 
      ? Math.round((totalScore / answeredQuestions.length) * 10) 
      : 0;

    interview.overallScore = overallScore;
    interview.status = "completed";
    interview.completedAt = new Date();
    interview.currentPhase = "completed";
    interview.phaseTimestamps.completedAt = new Date();

    let overallSummary = null;

    // Generate overall feedback summary
    try {
      const feedback = await generateOverallFeedback({
        questions: interview.questions,
        scores: answeredQuestions.map(q => q.score),
        type: interview.type,
        company: interview.company
      });

      overallSummary = feedback;
      interview.overallFeedback = JSON.stringify(feedback);
    } catch (err) {
      console.error("Error generating overall feedback:", err);
    }

    await interview.save();

    res.json({
      message: "Interview completed",
      interview,
      overallScore,
      overallSummary
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get all interviews for user
// @route  GET /api/interview
export const getInterviews = async (req, res) => {
  try {
    const interviews = await MockInterview.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select("title type company difficulty status overallScore createdAt completedAt");

    res.json(interviews);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get single interview
// @route  GET /api/interview/:id
export const getInterview = async (req, res) => {
  try {
    const interview = await MockInterview.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    res.json(interview);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get current phase of interview
// @route  GET /api/interview/:id/phase
export const getCurrentPhase = async (req, res) => {
  try {
    const interview = await MockInterview.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    res.json({
      currentPhase: interview.currentPhase,
      phaseTimestamps: interview.phaseTimestamps,
      lobbyData: interview.lobbyData,
      warmUpConversation: interview.warmUpConversation,
      backgroundConversation: interview.backgroundConversation,
      questions: interview.questions,
      candidateQuestions: interview.candidateQuestions
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

