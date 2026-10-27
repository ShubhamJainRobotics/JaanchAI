import { Router, Request, Response } from "express";
import { GeminiService } from "../ai/geminiService.js";

const router = Router();

router.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    aiAvailable: GeminiService.isAvailable(),
    time: new Date().toISOString(),
  });
});

export default router;
