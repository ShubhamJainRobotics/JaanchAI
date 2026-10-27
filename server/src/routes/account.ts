import { Router, Request, Response, NextFunction } from "express";
import { DeleteAllSchema } from "shared";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { HistoryService } from "../services/historyService.js";

const router = Router();

router.delete(
  "/account-data",
  requireAuth,
  validate(DeleteAllSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await HistoryService.deleteAllData(
        req.user!,
        req.supabase!
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
