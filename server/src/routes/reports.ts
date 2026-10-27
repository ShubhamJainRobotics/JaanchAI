import { Router, Request, Response, NextFunction } from "express";
import { ReportLookupRequestSchema, ReportRequestSchema } from "shared";
import { ReportedService } from "../services/reportedService.js";
import { supabaseAdmin } from "../lib/supabase.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";
import { lookupLimiter, reportsLimiter } from "../middleware/rateLimit.js";

export const reportsRouter = Router();

reportsRouter.post(
  "/lookup",
  optionalAuth,
  lookupLimiter,
  async (req: Request, res: Response, Next: NextFunction) => {
    try {
      const parsed = ReportLookupRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid lookup request payload.",
            details: parsed.error.format(),
          },
        });
      }

      const matches = await ReportedService.lookupEntities(
        supabaseAdmin,
        parsed.data.items
      );

      return res.json({ matches });
    } catch (err) {
      Next(err);
    }
  }
);

reportsRouter.post(
  "/",
  requireAuth,
  reportsLimiter,
  async (req: Request, res: Response, Next: NextFunction) => {
    try {
      const parsed = ReportRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid report request payload.",
            details: parsed.error.format(),
          },
        });
      }

      const { type, value, description } = parsed.data;

      await ReportedService.submitReport(
        req.supabase!,
        type,
        value,
        description
      );

      return res.json({
        success: true,
        message: "Scam report submitted successfully. Thank you for protecting fellow students.",
      });
    } catch (err) {
      Next(err);
    }
  }
);
