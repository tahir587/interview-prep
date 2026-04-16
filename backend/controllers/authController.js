
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Progress from "../models/Progress.js";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// Helper function to validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// @desc   Register user
// @route  POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, targetCompanies } = req.body;

    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please provide name, email, and password",
      });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({
        message: "Name must be at least 2 characters long",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "Please provide a valid email address",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser)
      return res
        .status(400)
        .json({ message: "User already exists with this email" });

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
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
        role: user.role,
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

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    console.log("Login attempt for:", email);

    const user = await User.findOne({ email: email.toLowerCase() });
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
        role: user.role,
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

