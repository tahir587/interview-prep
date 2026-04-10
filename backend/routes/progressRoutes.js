import express from "express";
const router = express.Router();

import {
  getProgress,
  getSolvedIds
} from "../controllers/progressController.js";

import { protect } from "../middleware/authMiddleware.js";

router.get("/", protect, getProgress);

router.get("/solved-ids", protect, getSolvedIds);

export default router;