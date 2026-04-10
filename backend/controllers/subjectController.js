import Subject from "../models/Subject.js";
import Progress from "../models/Progress.js";
import { explainTopic } from "../services/aiService.js";

// @desc   Get all subjects
// @route  GET /api/subjects
export const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().select("-topics.quiz -topics.content");

    res.json(subjects);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get subject with topics
// @route  GET /api/subjects/:name
export const getSubject = async (req, res) => {
  try {
    const subject = await Subject.findOne({ name: req.params.name });

    if (!subject)
      return res.status(404).json({ message: "Subject not found" });

    res.json(subject);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get topic detail
// @route  GET /api/subjects/:subjectName/topics/:topicId
export const getTopic = async (req, res) => {
  try {
    const subject = await Subject.findOne({ name: req.params.subjectName });

    if (!subject)
      return res.status(404).json({ message: "Subject not found" });

    const topic = subject.topics.id(req.params.topicId);

    if (!topic)
      return res.status(404).json({ message: "Topic not found" });

    res.json(topic);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Mark topic as complete
// @route  POST /api/subjects/:subjectName/topics/:topicId/complete

export const completeTopic = async (req, res) => {
  try {

    const { subject, topicId } = req.params;
    const { topicTitle } = req.body;

    let progress = await Progress.findOne({ user: req.user._id });

    if (!progress) {
      progress = new Progress({
        user: req.user._id,
        completedTopics: []
      });
    }

    const exists = progress.completedTopics.some(
      t => t.topicId === topicId
    );

    if (!exists) {
      progress.completedTopics.push({
        subject,
        topicId,
        topicTitle
      });
    }

    await progress.save();

    res.json({ message: "Topic marked completed" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc   Submit quiz answers
// @route  POST /api/subjects/:subjectName/topics/:topicId/quiz
export const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;

    const subject = await Subject.findOne({ name: req.params.subjectName });

    const topic = subject.topics.id(req.params.topicId);

    if (!topic)
      return res.status(404).json({ message: "Topic not found" });

    let score = 0;

    const results = topic.quiz.map((q, i) => {
      const isCorrect = answers[i] === q.correctAnswer;

      if (isCorrect) score++;

      return {
        question: q.question,
        selectedAnswer: answers[i],
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation
      };
    });

    const progress = await Progress.findOne({ user: req.user._id });

    progress.quizScores.push({
      subject: req.params.subjectName,
      topicId: req.params.topicId,
      score,
      total: topic.quiz.length
    });

    await progress.save();

    res.json({
      score,
      total: topic.quiz.length,
      results
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get AI explanation
// @route  POST /api/subjects/ai-explain
export const aiExplain = async (req, res) => {
  try {
    const { topic, subject } = req.body;

    const explanation = await explainTopic({ topic, subject });

    res.json({ explanation });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Create new subject (Admin)
// @route  POST /api/subjects
export const createSubject = async (req, res) => {
  try {

    const { name, description } = req.body;

    if (!name)
      return res.status(400).json({ message: "Subject name is required" });

    const existing = await Subject.findOne({ name });

    if (existing)
      return res.status(400).json({ message: "Subject already exists" });

    const subject = await Subject.create({
      name,
      description,
      topics: []
    });

    res.status(201).json(subject);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};