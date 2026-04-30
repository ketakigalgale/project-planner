const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config(); // Load .env variables

const taskRoutes = require("./routes/tasks");

const app = express();

// ── MIDDLEWARE ──────────────────────────────────
// Parse incoming JSON request bodies
app.use(express.json());

// Allow requests from React frontend (CORS)
app.use(
  cors({
    origin: ["http://localhost:5000/",
      "https://project-planner-tcbe.onrender.com"], // Vite default port
    methods: ["GET", "POST", "DELETE"],
  }),
);

// ── ROUTES ──────────────────────────────────────
// All task routes are prefixed with /api/tasks
app.use("/api/tasks", taskRoutes);

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "Project Planner API is running!" });
});

// ── DATABASE CONNECTION ──────────────────────────
// mongoose.connect() returns a Promise
// We wait for it before starting the server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB successfully!");

    // Start the Express server only after DB connection is established
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1); // Exit process if DB connection fails
  });
