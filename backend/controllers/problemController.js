import Problem from "../models/Problem.js";

/*
GET PROBLEMS
Used in DSA practice page
Supports filters
*/

export const getProblems = async (req, res) => {
  try {

    const { company, difficulty, topic, platform, page = 1 } = req.query;

    const filter = {};

    if (company) filter.companies = company;
    if (difficulty) filter.difficulty = difficulty;
    if (topic) filter.topic = topic;
    if (platform) filter.platform = platform;

    const limit = 20;
    const skip = (page - 1) * limit;

    const problems = await Problem.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Problem.countDocuments(filter);

    res.json({
      problems,
      total,
      page,
      pages: Math.ceil(total / limit)
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



/*
ADMIN ADD PROBLEM
*/

export const createProblem = async (req, res) => {
  try {

    const problem = await Problem.create(req.body);

    res.status(201).json(problem);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



/*
ADMIN UPDATE PROBLEM
*/

export const updateProblem = async (req, res) => {
  try {

    const problem = await Problem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(problem);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



/*
ADMIN DELETE PROBLEM
*/

export const deleteProblem = async (req, res) => {
  try {

    await Problem.findByIdAndDelete(req.params.id);

    res.json({ message: "Problem deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



/*
GET ALL COMPANIES
Used in filters
*/

export const getCompanies = async (req, res) => {
  try {

    const companies = await Problem.distinct("companies");

    res.json(companies);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



/*
GET ALL TOPICS
*/

export const getTopics = async (req, res) => {
  try {

    const topics = await Problem.distinct("topic");

    res.json(topics);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};