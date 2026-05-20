import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import router from "./app/routes";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";

// Load Environment variables
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 5000;

// Security and standard middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate Limiter to prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes.",
});
app.use("/api/v1", limiter);

// API route registry
app.use("/api/v1", router);

// Root route
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to EASN Alumni & Batch Management Platform API",
  });
});

// Centralized error handler middleware
app.use(globalErrorHandler);

// Route not found fallback
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `API Route Not Found: ${req.originalUrl}`,
  });
});

const startServer = () => {
  try {
    app.listen(port, () => {
      console.log(`[Server]: EASN Backend running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start the backend server:", error);
    process.exit(1);
  }
};

startServer();
