import express from "express";

import {
  getProblems,
  createProblem,
  updateProblem,
  deleteProblem,
  getCompanies,
  getTopics
} from "../controllers/problemController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getProblems);

router.post("/", protect, createProblem);

router.put("/:id", protect, updateProblem);

router.delete("/:id", protect, deleteProblem);

router.get("/companies/list", protect, getCompanies);

router.get("/topics/list", protect, getTopics);

export default router;