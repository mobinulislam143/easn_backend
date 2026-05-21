import type { CorsOptions } from "cors";
import type { Request, Response, NextFunction } from "express";

/** Normalize origin for comparison (no trailing slash). */
export const normalizeOrigin = (origin: string): string =>
  origin.trim().replace(/\/$/, "");

/** All allowed browser origins for this API. */
export const getAllowedOrigins = (): string[] => {
  const defaults = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "https://easn-alumni.vercel.app",
    "https://www.easn-alumni.vercel.app",
  ];

  const fromEnv = [
    process.env.FRONTEND_URL,
    ...(process.env.ALLOWED_ORIGINS?.split(",") ?? []),
  ]
    .filter((value): value is string => Boolean(value?.trim()))
    .map(normalizeOrigin);

  return [...new Set([...defaults.map(normalizeOrigin), ...fromEnv])];
};

export const isOriginAllowed = (origin: string | undefined): boolean => {
  if (!origin) return true;
  const normalized = normalizeOrigin(origin);
  return getAllowedOrigins().includes(normalized);
};

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Server-to-server, curl, or same-origin — allow
    if (!origin) {
      callback(null, true);
      return;
    }

    if (isOriginAllowed(origin)) {
      // Echo the request origin (required when credentials: true)
      callback(null, origin);
      return;
    }

    console.warn(`[CORS] Blocked origin: ${origin}. Allowed: ${getAllowedOrigins().join(", ")}`);
    callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  exposedHeaders: ["Content-Disposition"],
  optionsSuccessStatus: 204,
  maxAge: 86400,
};

/** Early CORS headers for Vercel/serverless preflight (before other middleware). */
export const corsPreflightMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const origin = req.headers.origin;

  if (origin && isOriginAllowed(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Vary", "Origin");
  }

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, Accept"
    );
    res.setHeader("Access-Control-Max-Age", "86400");
    res.status(204).end();
    return;
  }

  next();
};
