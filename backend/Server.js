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

const localOrigins = ["http://localhost:5173", "http://localhost:5174"];
const envOrigins = [
  process.env.CLIENT_URL,
  ...(process.env.CLIENT_URLS ? process.env.CLIENT_URLS.split(",") : []),
]
  .map((origin) => origin?.trim())
  .filter(Boolean);

const allowedOrigins = [...new Set([...localOrigins, ...envOrigins])];


// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser clients and configured frontend origins.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

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