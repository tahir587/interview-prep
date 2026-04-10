import Problem from "../models/Problem.js";
import Progress from "../models/Progress.js";

// @desc   Get all problems with filters
// @route  GET /api/dsa/problems
export const getProblems = async (req, res) => {
  try {
    const { company, difficulty, topic, platform, page = 1, limit = 20 } = req.query;

    const filter = {};

    if (company) filter.companies = { $in: [company] };
    if (difficulty) filter.difficulty = difficulty;
    if (topic) filter.topic = topic;
    if (platform) filter.platform = platform;

    const skip = (page - 1) * limit;

    const [problems, total] = await Promise.all([
      Problem.find(filter)
        .skip(skip)
        .limit(Number(limit))
        .sort({ difficulty: 1 }),

      Problem.countDocuments(filter),
    ]);

    res.json({
      problems,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get companies list
// @route  GET /api/dsa/companies
export const getCompanies = async (req, res) => {
  try {
    const companies = await Problem.distinct("companies");
    res.json(companies.sort());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get topics list
// @route  GET /api/dsa/topics
export const getTopics = async (req, res) => {
  try {
    const topics = await Problem.distinct("topic");
    res.json(topics.sort());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Mark problem as solved
// @route  POST /api/dsa/problems/:id/solve
export const markSolved = async (req, res) => {
  try {

    const problemId = req.params.id;

    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

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

// @desc   Unmark problem as solved
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

    console.error("UnmarkSolved ERROR:", error);

    res.status(500).json({ message: error.message });
  }
};

// @desc   Get single problem
// @route  GET /api/dsa/problems/:id
export const getProblem = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);

    if (!problem)
      return res.status(404).json({ message: "Problem not found" });

    res.json(problem);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Create problem (admin)
// @route  POST /api/dsa/problems
export const createProblem = async (req, res) => {
  try {
    const problem = await Problem.create(req.body);

    res.status(201).json(problem);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};