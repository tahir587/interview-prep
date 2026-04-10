import { Schema, model } from 'mongoose';

const progressSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

  // DSA Progress
  solvedProblems: [{
    problem: { type: Schema.Types.ObjectId, ref: 'Problem' },
    solvedAt: { type: Date, default: Date.now },
    attempts: { type: Number, default: 1 }
  }],

  // Subject Progress
  completedTopics: [{
    subject: String,
    topicId: String,
    topicTitle: String,
    completedAt: { type: Date, default: Date.now }
  }],

  // Quiz scores
  quizScores: [{
    subject: String,
    topicId: String,
    score: Number,
    total: Number,
    takenAt: { type: Date, default: Date.now }
  }],

  // Interview Performance
  interviewStats: {
    totalInterviews: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    bestScore: { type: Number, default: 0 }
  },

  // Streak tracking
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActiveDate: { type: Date }

}, { timestamps: true });

export default model('Progress', progressSchema);