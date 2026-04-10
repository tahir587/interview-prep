import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

import {
  createProblem,
  updateProblem,
  deleteProblem,
  createSubject,
  addTopic
} from "../controllers/adminController.js";

const router = Router();

/* DSA problems */

router.post("/problems", protect, adminOnly, createProblem);
router.put("/problems/:id", protect, adminOnly, updateProblem);
router.delete("/problems/:id", protect, adminOnly, deleteProblem);

/* Subjects */

router.post("/subjects", protect, adminOnly, createSubject);
router.post("/subjects/:subjectId/topics", protect, adminOnly, addTopic);

export default router;