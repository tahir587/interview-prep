import mongoose from "mongoose";

const { Schema, model } = mongoose;

const quizQuestionSchema = new Schema({
  question: String,
  options: [String],
  correctAnswer: Number, // index of correct option
  explanation: String,
});

const topicSchema = new Schema({
  title: String,
  content: String, // markdown content
  interviewQuestions: [
    {
      question: String,
      answer: String,
    },
  ],
  quiz: [quizQuestionSchema],
});

const subjectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },

    description: String,

    icon: String,

    topics: [topicSchema],

    totalTopics: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default model("Subject", subjectSchema);
