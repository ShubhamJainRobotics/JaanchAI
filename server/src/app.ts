import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { requestIdMiddleware } from "./middleware/requestId.js";
import { errorHandler } from "./middleware/errorHandler.js";

// Routes
import healthRouter from "./routes/health.js";
import analyzeRouter from "./routes/analyze.js";
import analysesRouter from "./routes/analyses.js";
import checklistRouter from "./routes/checklist.js";
import linkCheckRouter from "./routes/linkCheck.js";
import challengeRouter from "./routes/challenge.js";
import resourcesRouter from "./routes/resources.js";
import feedbackRouter from "./routes/feedback.js";
import accountRouter from "./routes/account.js";
import { organizationsRouter } from "./routes/organizations.js";
import { headersRouter } from "./routes/headers.js";
import { reportsRouter } from "./routes/reports.js";

export function createApp(): Express {
  const app = express();

  // Request correlation ID
  app.use(requestIdMiddleware);

  // Security Headers via Helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          workerSrc: ["'self'", "blob:"],
          imgSrc: ["'self'", "data:", "blob:"],
          connectSrc: ["'self'", ...env.CLIENT_ORIGINS, "https://*.supabase.co"],
        },
      },
      referrerPolicy: { policy: "no-referrer" },
      xContentTypeOptions: true,
    })
  );

  // Restricted CORS
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps or curl) in development or if matching allowlist
        if (
          !origin ||
          env.CLIENT_ORIGINS.includes(origin) ||
          (env.NODE_ENV === "development" &&
            /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))
        ) {
          callback(null, true);
        } else {
          callback(new Error("CORS not allowed for this origin"));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
    })
  );

  // Body parser with 256KB strict limit
  app.use(express.json({ limit: "256kb" }));

  // Pino HTTP request logger
  if (env.NODE_ENV !== "test") {
    app.use(
      pinoHttp({
        logger,
        genReqId: (req) => req.id || "unknown",
      })
    );
  }

  // Mount API routes
  app.use("/api", healthRouter);
  app.use("/api", analyzeRouter);
  app.use("/api", analysesRouter);
  app.use("/api", checklistRouter);
  app.use("/api", linkCheckRouter);
  app.use("/api", challengeRouter);
  app.use("/api", resourcesRouter);
  app.use("/api", feedbackRouter);
  app.use("/api", accountRouter);
  app.use("/api/organizations", organizationsRouter);
  app.use("/api/email-headers", headersRouter);
  app.use("/api/reports", reportsRouter);

  // 404 Route Handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: "The requested API endpoint was not found.",
      },
    });
  });

  // Central Error Handler
  app.use(errorHandler);

  return app;
}
