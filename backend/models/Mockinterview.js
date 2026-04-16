import mongoose from "mongoose";

const { Schema, model } = mongoose;

const questionAnswerSchema = new Schema({
  question: { type: String, required: true },
  questionType: { type: String, enum: ["technical", "behavioral", "system-design", "dsa"], default: "technical" },
  userAnswer: { type: String, default: "" },
  aiFeedback: { type: String, default: "" },
  score: { type: Number, min: 0, max: 10, default: 0 },
  timeTaken: { type: Number, default: 0 },
  followUpCount: { type: Number, default: 0 },
  followUps: [{ type: String }],
  displayedAsCard: { type: Boolean, default: false }
});

// Warm-up conversation schema
const warmUpSchema = new Schema({
  question: { type: String },
  userResponse: { type: String, default: "" },
  aiResponse: { type: String, default: "" },
  timestamp: { type: Date, default: Date.now }
});

// Background conversation schema
const backgroundSchema = new Schema({
  question: { type: String },
  userResponse: { type: String, default: "" },
  aiResponse: { type: String, default: "" },
  timestamp: { type: Date, default: Date.now }
});

// Candidate Q&A schema
const candidateQASchema = new Schema({
  question: { type: String },
  aiAnswer: { type: String, default: "" },
  timestamp: { type: Date, default: Date.now }
});

const mockInterviewSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },

    title: { type: String, required: true },

    interviewerName: { type: String, default: "Sophia" },
    interviewerRole: { type: String, default: "Senior Software Engineer" },
    company: { type: String, default: "General" },

    type: {
      type: String,
      enum: ["Technical", "Behavioral", "System Design", "DSA"],
      required: true
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium"
    },

    // Current phase: lobby, warmup, background, core-questions, candidate-qa, closing, completed
    currentPhase: {
      type: String,
      enum: ["lobby", "warmup", "background", "core-questions", "candidate-qa", "closing", "completed"],
      default: "lobby"
    },

    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "in-progress"
    },

    // Lobby tech check data
    lobbyData: {
      cameraWorking: { type: Boolean, default: false },
      micWorking: { type: Boolean, default: false },
      techCheckComplete: { type: Boolean, default: false },
      audioTestComplete: { type: Boolean, default: false },
      interviewerJoined: { type: Boolean, default: false }
    },

    // Warm-up phase conversations
    warmUpConversation: [warmUpSchema],

    // Background phase conversations
    backgroundConversation: [backgroundSchema],

    // Core questions
    questions: [questionAnswerSchema],

    // Candidate Q&A phase
    candidateQuestions: [candidateQASchema],
    candidateQuestionsAskedCount: { type: Number, default: 0 },

    overallScore: { type: Number, min: 0, max: 100, default: 0 },

    overallFeedback: { type: String, default: "" },

    duration: { type: Number, default: 0 },

    // Track when each phase started
    phaseTimestamps: {
      lobbyStarted: { type: Date },
      warmupStarted: { type: Date },
      backgroundStarted: { type: Date },
      coreQuestionsStarted: { type: Date },
      candidateQAStarted: { type: Date },
      closingStarted: { type: Date },
      completedAt: { type: Date }
    },

    completedAt: { type: Date }
  },
  { timestamps: true }
);

export default model("MockInterview", mockInterviewSchema);

