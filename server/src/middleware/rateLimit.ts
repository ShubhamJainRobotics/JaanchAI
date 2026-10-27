import rateLimit from "express-rate-limit";
import { Request, Response } from "express";
import { env } from "../config/env.js";

function standard429Handler(req: Request, res: Response): void {
  res.status(429).json({
    error: {
      code: "RATE_LIMITED",
      message: "Rate limit exceeded. Please try again later.",
    },
  });
}

// Analyze rate limiter: 30/hour for guests, 120/hour for logged-in users
export const analyzeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: (req: Request) => (req.user ? 120 : 30),
  keyGenerator: (req: Request) => req.user?.id || req.ip || "unknown-ip",
  handler: standard429Handler,
  standardHeaders: true,
  legacyHeaders: false,
});

// Link check limiter: 40/hour
export const linkCheckLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 40,
  keyGenerator: (req: Request) => req.user?.id || req.ip || "unknown-ip",
  handler: standard429Handler,
  standardHeaders: true,
  legacyHeaders: false,
});

// Challenge email limiter: 20/hour
export const challengeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyGenerator: (req: Request) => req.user?.id || req.ip || "unknown-ip",
  handler: standard429Handler,
  standardHeaders: true,
  legacyHeaders: false,
});

// Listing fetch limiter: 10/hour
export const listingFetchLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: env.RATE_LIMIT_LISTING_PER_HOUR,
  keyGenerator: (req: Request) => req.user?.id || req.ip || "unknown-ip",
  handler: standard429Handler,
  standardHeaders: true,
  legacyHeaders: false,
});

// Reports submission limiter: 20/day
export const reportsLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: env.RATE_LIMIT_REPORTS_PER_DAY,
  keyGenerator: (req: Request) => req.user?.id || req.ip || "unknown-ip",
  handler: standard429Handler,
  standardHeaders: true,
  legacyHeaders: false,
});

// Reported entity lookup limiter: 60/hour
export const lookupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: env.RATE_LIMIT_LOOKUP_PER_HOUR,
  keyGenerator: (req: Request) => req.user?.id || req.ip || "unknown-ip",
  handler: standard429Handler,
  standardHeaders: true,
  legacyHeaders: false,
});

// Header analysis limiter: 40/hour
export const headerAnalyzeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 40,
  keyGenerator: (req: Request) => req.user?.id || req.ip || "unknown-ip",
  handler: standard429Handler,
  standardHeaders: true,
  legacyHeaders: false,
});
