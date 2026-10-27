import { Router, Request, Response, NextFunction } from "express";
import { FeedbackSchema } from "shared";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post(
  "/feedback",
  requireAuth,
  validate(FeedbackSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { data, error } = await req.supabase!
        .from("feedback")
        .insert({
          user_id: req.user!.id,
          analysis_id: req.body.analysisId || null,
          helpful: req.body.helpful,
          comment: req.body.comment || null,
        })
        .select()
        .single();

      if (error) throw error;
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
