import express from "express";
import {
  getSubjects,
  getSubject,
  getTopic,
  createSubject,
  completeTopic,
  submitQuiz,
  aiExplain
} from "../controllers/subjectController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getSubjects);
router.get("/:name", getSubject);
router.get("/:name/topics/:topicId", protect, getTopic);

// Protected routes
router.post("/", protect, adminOnly, createSubject);
router.post("/:subject/topics/:topicId/complete", protect, completeTopic);
router.post("/:subject/topics/:topicId/quiz", protect, submitQuiz);
router.post("/ai-explain", protect, aiExplain);

export default router;
