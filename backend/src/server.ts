import express, { Express } from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db";
import jobRoutes from "./routes/jobs";

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Environment variables
const NODE_ENV = process.env.NODE_ENV || "development";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Middleware
app.use(express.json());

// CORS configuration
app.use(
  cors({
    origin:
      NODE_ENV === "production"
        ? [FRONTEND_URL, "*.vercel.app"] // Allow Vercel domains in production
        : "http://localhost:3000", // Allow localhost in development
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", environment: NODE_ENV });
});

// Routes
app.use("/api/jobs", jobRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
});
