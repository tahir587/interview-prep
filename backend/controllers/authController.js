
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Progress from "../models/Progress.js";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// @desc   Register user
// @route  POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, targetCompanies } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res
        .status(400)
        .json({ message: "User already exists with this email" });

    const user = await User.create({
      name,
      email,
      password,
      targetCompanies: targetCompanies || [],
    });

    // Initialize progress document
    await Progress.create({
      user: user._id,
      solvedProblems: [],
      completedTopics: [],
      quizScores: [],
      interviewStats: {
        totalInterviews: 0,
        averageScore: 0,
        bestScore: 0,
      },
      currentStreak: 0,
      lastActiveDate: new Date(),
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        targetCompanies: user.targetCompanies,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc   Login user
// @route  POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login attempt for:", email);

    const user = await User.findOne({ email });
    console.log("User found:", !!user);

    if (!user) {
      console.log("No user found with email:", email);
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await user.comparePassword(password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      console.log("Password mismatch for:", email);
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    console.log("Login successful for:", email);

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        targetCompanies: user.targetCompanies,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get current user profile
// @route  GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Update user profile
// @route  PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, targetCompanies } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, targetCompanies },
      { new: true, runValidators: true },
    ).select("-password");

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

