import MockInterview from "../models/MockInterview.js";
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
  generateClosingMessage
} from "../services/aiService.js";

// @desc   Start a new mock interview
// @route  POST /api/interview/start
export const startInterview = async (req, res) => {
  try {
    const { type, company, difficulty, questionCount = 5 } = req.body;

    if (!type || !difficulty) {
      return res.status(400).json({ message: "Type and difficulty are required" });
    }

    // Generate questions for core interview
    const aiQuestions = await generateQuestions({
      type,
      company,
      difficulty,
      count: questionCount
    });

    const questions = aiQuestions.map((q) => ({
      question: q.question,
      questionType: q.questionType || "technical",
      userAnswer: "",
      aiFeedback: "",
      score: 0,
      displayedAsCard: false
    }));

    const interview = await MockInterview.create({
      user: req.user._id,
      title: `${company || "General"} ${type} Interview`,
      type,
      company: company || "General",
      difficulty,
      questions,
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

    interview.lobbyData = {
      cameraWorking: cameraWorking || true,
      micWorking: micWorking || true,
      audioTestComplete: audioTestComplete || true,
      techCheckComplete: true,
      interviewerJoined: false
    };

    // Start warmup phase
    interview.currentPhase = "warmup";
    interview.phaseTimestamps.warmupStarted = new Date();

    await interview.save();

    // Generate warm-up greeting
    const greeting = await generateWarmUpGreeting({
      interviewerName: interview.interviewerName,
      company: interview.company
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

      // Generate background questions
      const bgQuestions = await generateBackgroundQuestions();
      interview.backgroundConversation = bgQuestions.map(q => ({
        question: q.question,
        userResponse: "",
        aiResponse: ""
      }));
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

      // Move to core questions after 1-2 background questions
      const currentIndex = interview.backgroundConversation.filter(b => b.userResponse).length;
      if (currentIndex >= 1) {
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

    res.json({
      aiResponse,
      followUpQuestion,
      shouldAskFollowUp,
      shouldMoveToCore,
      nextPhase: shouldMoveToCore ? "core-questions" : "background",
      nextBackgroundIndex: questionIndex + 1,
      nextBackgroundQuestion: !shouldMoveToCore ? interview.backgroundConversation[questionIndex + 1]?.question : null
    });

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

    const isLast = interview.questions.length - 1 === idx;

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

    const MAX_FOLLOW_UPS = 1;
    const shouldAskFollowUp = !userDoesntKnow && answer.length > 30;

    try {
      if (userDoesntKnow) {
        feedback = "That's completely fine. Not knowing something is part of learning. It's better to be honest than to guess. Let's move to the next question.";
        score = 3;
      } else {
        const evaluation = await evaluateAnswer({
          question: q.question,
          userAnswer: answer
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

        const nextQuestionText = !isLast ? " Let's move to our next question." : " Let's wrap up this interview.";
        
        if (!feedback.includes("next question") && !feedback.includes("wrap up")) {
          feedback = feedback + nextQuestionText;
        }
      }

      if (shouldAskFollowUp && q.followUpCount < MAX_FOLLOW_UPS) {
        followUp = await generateFollowUp({
          question: q.question,
          userAnswer: answer
        });

        q.followUpCount = (q.followUpCount || 0) + 1;
        if (!q.followUps) q.followUps = [];
        q.followUps.push(followUp);
      }

    } catch (err) {
      console.error("AI error:", err);
      feedback = "Thanks for your answer. Let's move to the next question.";
      score = 5;
    }

    q.userAnswer = answer;
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
      hasMoreFollowUps,
      isLastQuestion: isLast
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
    interview.currentPhase = "candidate-qa";
    interview.phaseTimestamps.candidateQAStarted = new Date();

    await interview.save();

    res.json({
      message: "Candidate Q&A phase started",
      prompt: "Before I let you go — do you have any questions for me about the role or the team?",
      prebakedQA: candidateQA
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

    // Find matching pre-baked answer or generate one
    let aiAnswer = "";
    
    // Try to find a matching question
    const matched = interview.candidateQuestions.find(
      q => q.question.toLowerCase().includes(question.toLowerCase().split(' ').slice(0, 3).join(' '))
    );

    if (matched) {
      aiAnswer = matched.aiAnswer;
    } else {
      // Generate a generic but realistic answer
      aiAnswer = "That's a great question. I'd be happy to tell you more about that. Generally speaking, we focus on...";
    }

    res.json({
      answer: aiAnswer,
      remainingQuestions: 2 // Allow 2-3 questions
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

    // Generate overall feedback
    try {
      const feedback = await generateOverallFeedback({
        questions: interview.questions,
        scores: answeredQuestions.map(q => q.score),
        type: interview.type,
        company: interview.company
      });

      interview.overallFeedback = feedback;
    } catch (err) {
      console.error("Error generating overall feedback:", err);
    }

    await interview.save();

    res.json({
      message: "Interview completed",
      interview,
      overallScore
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

