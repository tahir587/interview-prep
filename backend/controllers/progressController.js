import Progress from "../models/Progress.js";
import Problem from "../models/Problem.js";
import MockInterview from "../models/Mockinterview.js";

// @desc   Get user progress dashboard data
// @route  GET /api/progress
export const getProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({ user: req.user._id })
      .populate("solvedProblems.problem", "title difficulty topic companies");

    if (!progress)
      return res.status(404).json({ message: "Progress not found" });

    const solved = progress.solvedProblems;

    const solvedByDifficulty = {
      Easy: 0,
      Medium: 0,
      Hard: 0
    };

    const solvedByTopic = {};

    solved.forEach(({ problem }) => {
      if (!problem) return;

      solvedByDifficulty[problem.difficulty] =
        (solvedByDifficulty[problem.difficulty] || 0) + 1;

      solvedByTopic[problem.topic] =
        (solvedByTopic[problem.topic] || 0) + 1;
    });

    const recentInterviews = await MockInterview.find({
      user: req.user._id,
      status: "completed"
    })
      .sort({ completedAt: -1 })
      .limit(5)
      .select("title type overallScore completedAt company");

    res.json({
      progress,
      summary: {
        totalSolved: solved.length,
        solvedByDifficulty,
        solvedByTopic,
        completedTopics: progress.completedTopics.length,
        interviewStats: progress.interviewStats,
        currentStreak: progress.currentStreak,
        quizzesTaken: progress.quizScores.length
      },
      recentInterviews
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get solved problem IDs
// @route  GET /api/progress/solved-ids
export const getSolvedIds = async (req, res) => {
  try {
    const progress = await Progress.findOne({ user: req.user._id })
      .select("solvedProblems");

    const ids =
      progress?.solvedProblems.map((p) => p.problem.toString()) || [];

    res.json(ids);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Mark problem solved
// @route  POST /api/dsa/problems/:id/solve
export const markSolved = async (req, res) => {
  try {

    console.log("User:", req.user);
    console.log("Problem ID:", req.params.id);

    const problemId = req.params.id;

    let progress = await Progress.findOne({ user: req.user._id });

    if (!progress) {
      progress = new Progress({
        user: req.user._id,
        solvedProblems: []
      });
    }

    const exists = progress.solvedProblems.some(
      (p) => p.problem && p.problem.toString() === problemId
    );

    if (!exists) {
      progress.solvedProblems.push({
        problem: problemId,
        attempts: 1
      });
    }

    await progress.save();

    res.json({ message: "Problem marked solved" });

  } catch (error) {

    console.error("MarkSolved ERROR:", error);

    res.status(500).json({
      message: error.message
    });
  }
};


// @desc   Unmark solved problem
// @route  DELETE /api/dsa/problems/:id/solve
export const unmarkSolved = async (req, res) => {
  try {
    const problemId = req.params.id;

    const progress = await Progress.findOne({ user: req.user._id });

    if (!progress)
      return res.status(404).json({ message: "Progress not found" });

    progress.solvedProblems = progress.solvedProblems.filter(
      (p) => p.problem && p.problem.toString() !== problemId
    );

    await progress.save();

    res.json({ message: "Problem unmarked" });

  } catch (error) {
    console.error("UnmarkSolved error:", error);
    res.status(500).json({ message: error.message });
  }
};