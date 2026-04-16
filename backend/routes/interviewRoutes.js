import express from "express";
const router = express.Router();

import {
  startInterview,
  submitAnswer,
  completeInterview,
  getInterviews,
  getInterview,
  completeLobby,
  joinInterview,
  submitWarmUpResponse,
  submitBackgroundResponse,
  startCandidateQA,
  submitCandidateQuestion,
  startClosing,
  getCurrentPhase,
  getAdaptiveQuestion,
  synthesizeInterviewSpeech
} from "../controllers/interviewController.js";

import { protect } from "../middleware/authMiddleware.js";

// Start interview
router.post("/start", protect, startInterview);

// Get interviews
router.get("/", protect, getInterviews);
router.get("/:id", protect, getInterview);
router.get("/:id/phase", protect, getCurrentPhase);

// Interview voice synthesis
router.post("/tts", protect, synthesizeInterviewSpeech);

// Lobby phase
router.post("/:id/lobby", protect, completeLobby);
router.post("/:id/join", protect, joinInterview);

// Warm-up phase
router.post("/:id/warmup", protect, submitWarmUpResponse);

// Background phase
router.post("/:id/background", protect, submitBackgroundResponse);

// Core questions (existing)
router.put("/:id/answer/:questionIndex", protect, submitAnswer);
router.post("/:id/adaptive/:questionIndex", protect, getAdaptiveQuestion);

// Candidate Q&A phase
router.post("/:id/candidate-qa/start", protect, startCandidateQA);
router.post("/:id/candidate-qa/question", protect, submitCandidateQuestion);

// Closing phase
router.post("/:id/closing", protect, startClosing);

// Complete interview
router.put("/:id/complete", protect, completeInterview);

export default router;


