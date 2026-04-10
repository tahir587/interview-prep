import Problem from "../models/Problem.js";
import Subject from "../models/Subject.js";

/* ---------------- DSA PROBLEMS ---------------- */

export const createProblem = async (req, res) => {

  try {

    const problem = await Problem.create(req.body);

    res.status(201).json(problem);

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

};

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

export const deleteProblem = async (req, res) => {

  try {

    await Problem.findByIdAndDelete(req.params.id);

    res.json({ message: "Problem deleted" });

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

};


/* ---------------- SUBJECTS ---------------- */

export const createSubject = async (req, res) => {

  try {

    const subject = await Subject.create({
      name: req.body.name,
      description: req.body.description
    });

    res.status(201).json(subject);

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

};

export const addTopic = async (req, res) => {

  try {

    const subject = await Subject.findById(req.params.subjectId);

    subject.topics.push(req.body);

    await subject.save();

    res.json(subject);

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

};