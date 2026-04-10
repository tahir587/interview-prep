import express from "express";
const router = express.Router();

import {
  getProblems,
  getCompanies,
  getTopics,
  markSolved,
  unmarkSolved,
  getProblem,
  createProblem
} from "../controllers/dsaController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

// Problem routes
router.get("/problems", protect, getProblems);
router.get("/problems/:id", protect, getProblem);
router.post("/problems", protect, adminOnly, createProblem);

router.post("/problems/:id/solve", protect, markSolved);
router.delete("/problems/:id/solve", protect, unmarkSolved);

router.post("/problems/:id/solve", protect, (req, res, next) => {
  console.log("Solve route hit");
  next();
}, markSolved);

// Filters
router.get("/companies", protect, getCompanies);
router.get("/topics", protect, getTopics);

export default router;