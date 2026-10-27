import { Router, Request, Response, NextFunction } from "express";
import { ChallengeRequestSchema } from "shared";
import { validate } from "../middleware/validate.js";
import { optionalAuth } from "../middleware/auth.js";
import { challengeLimiter } from "../middleware/rateLimit.js";
import { ChallengeService } from "../services/challengeService.js";

const router = Router();

router.post(
  "/challenge-email",
  optionalAuth,
  challengeLimiter,
  validate(ChallengeRequestSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await ChallengeService.generateEmail(
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
