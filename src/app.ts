import dotenv from "dotenv";
dotenv.config();

import { ensureSystemAdmin } from "./app/helpers/ensureSystemAdmin";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import router from "./app/routes";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import { corsOptions, corsPreflightMiddleware } from "./app/config/cors";

const app: Application = express();

// Provision super admin from ADMIN_EMAIL / ADMIN_PASSWORD (Vercel + local)
let adminBootstrap: Promise<void> | null = null;
const adminReady = (): Promise<void> => {
  if (!adminBootstrap) {
    adminBootstrap = ensureSystemAdmin().catch((err) => {
      adminBootstrap = null;
      console.error("[Admin] Bootstrap failed:", err);
    });
  }
  return adminBootstrap;
};
void adminReady();

// CORS preflight first (important on Vercel serverless)
app.use(corsPreflightMiddleware);
app.use(cors(corsOptions));

// Security and standard middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate Limiter — skip OPTIONS so preflight is never blocked
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "OPTIONS",
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

export default app;
