import { Router, Request, Response, NextFunction } from "express";
import { LinkCheckRequestSchema } from "shared";
import { validate } from "../middleware/validate.js";
import { optionalAuth } from "../middleware/auth.js";
import { linkCheckLimiter } from "../middleware/rateLimit.js";
import { LinkService } from "../services/linkService.js";

const router = Router();

router.post(
  "/link-check",
  optionalAuth,
  linkCheckLimiter,
  validate(LinkCheckRequestSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await LinkService.checkLink(
        req.body.url,
        req.body.analysisId,
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
