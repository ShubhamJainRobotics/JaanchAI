import { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger.js";
import { env } from "../config/env.js";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || err.status || 500;
  const code = err.code || "INTERNAL";
  const message = err.message || "An unexpected error occurred.";

  logger.error(
    {
      err: env.NODE_ENV === "production" ? { message, code } : err,
      reqId: req.id,
      method: req.method,
      url: req.url,
    },
    `Request error: ${message}`
  );

  res.status(statusCode).json({
    error: {
      code,
      message,
      ...(env.NODE_ENV !== "production" && err.details ? { details: err.details } : {}),
    },
  });
}
