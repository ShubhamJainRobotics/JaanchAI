import { Router, Request, Response, NextFunction } from "express";
import { AnalyzeRequestSchema } from "shared";
import { validate } from "../middleware/validate.js";
import { optionalAuth } from "../middleware/auth.js";
import { analyzeLimiter } from "../middleware/rateLimit.js";
import { AnalyzeService } from "../services/analyzeService.js";

const router = Router();

router.post(
  "/analyze",
  optionalAuth,
  analyzeLimiter,
  validate(AnalyzeRequestSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await AnalyzeService.analyze(
        req.body,
        req.user,
        req.supabase
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
