import { Router, Request, Response, NextFunction } from "express";
import {
  HistoryQuerySchema,
  DeleteAllSchema,
  AttestationRequestSchema,
  OfficialListingRequestSchema,
} from "shared";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { HistoryService } from "../services/historyService.js";
import { listingFetchLimiter } from "../middleware/rateLimit.js";

const router = Router();

// GET /api/analyses - Paginated list of past analyses
router.get(
  "/analyses",
  requireAuth,
  validate(HistoryQuerySchema, "query"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await HistoryService.getAnalyses(
        req.user!,
        req.supabase!,
        req.query as any
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/analyses/:id - Full saved result by id
router.get(
  "/analyses/:id",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await HistoryService.getAnalysisById(
        req.params.id,
        req.user!,
        req.supabase!
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/analyses/:id/official-listing - Attach official listing URL or text & recompute status
router.post(
  "/analyses/:id/official-listing",
  requireAuth,
  listingFetchLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = OfficialListingRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid official listing input.",
            details: parsed.error.format(),
          },
        });
      }

      const updatedAnalysis = await HistoryService.attachOfficialListing(
        req.params.id,
        req.user!,
        req.supabase!,
        parsed.data
      );

      res.json(updatedAnalysis);
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/analyses/:id/attestations - Save user attestation & recompute status
router.put(
  "/analyses/:id/attestations",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = AttestationRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid attestation request.",
            details: parsed.error.format(),
          },
        });
      }

      const updated = await HistoryService.saveAttestation(
        req.params.id,
        req.user!,
        req.supabase!,
        parsed.data.checkKey,
        parsed.data.outcome
      );

      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/analyses/:id/evidence-report - Full report JSON for export/print
router.get(
  "/analyses/:id/evidence-report",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const report = await HistoryService.getEvidenceReport(
        req.params.id,
        req.user!,
        req.supabase!
      );
      res.json(report);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/analyses/:id - Delete one analysis
router.delete(
  "/analyses/:id",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await HistoryService.deleteAnalysis(
        req.params.id,
        req.user!,
        req.supabase!
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/analyses - Delete all user's analyses history
router.delete(
  "/analyses",
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
