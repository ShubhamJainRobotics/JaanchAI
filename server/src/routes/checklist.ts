import { Router, Request, Response, NextFunction } from "express";
import { ChecklistPatchSchema } from "shared";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { HistoryService } from "../services/historyService.js";

const router = Router();

// PATCH /api/checklist/:itemId - Update checklist item completion
router.patch(
  "/checklist/:itemId",
  requireAuth,
  validate(ChecklistPatchSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await HistoryService.patchChecklist(
        req.params.itemId,
        req.body.completed,
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
