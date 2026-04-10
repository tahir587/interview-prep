import mongoose from "mongoose";

const { Schema, model } = mongoose;

const problemSchema = new Schema(
  {
    title: { type: String, required: true },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true
    },

    topic: { type: String, required: true }, // e.g., Arrays, Trees

    companies: [{ type: String }], // e.g., ["Google", "Amazon"]

    platform: {
      type: String,
      enum: ["LeetCode", "GeeksforGeeks"],
      required: true
    },

    externalUrl: { type: String, required: true },

    description: { type: String },

    tags: [{ type: String }],

    isPremium: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Index for faster filtering
problemSchema.index({ companies: 1, difficulty: 1, topic: 1 });

export default model("Problem", problemSchema);