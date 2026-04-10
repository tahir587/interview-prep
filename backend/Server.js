import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/Db.js";
import authRoutes from "./routes/authRoutes.js";
import dsaRoutes from "./routes/dsaRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import problemRoutes from "./routes/problemRoutes.js";




const app = express();

// Connect database
connectDB();


// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/dsa", dsaRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/problems", problemRoutes);


// Test route
app.get("/", (req, res) => {
  res.json({ message: "Interview Prep API running" });
});
//console.log("OPENAI:", process.env.OPENAI_API_KEY);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});