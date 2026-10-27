import {
  ChallengeRequest,
  ChallengeOutput,
  buildChallengeTemplate,
  buildSafeReplyTemplate,
} from "shared";
import { User, SupabaseClient } from "@supabase/supabase-js";
import { GeminiService } from "../ai/geminiService.js";
import { logger } from "../lib/logger.js";

export interface ChallengeServiceResult extends ChallengeOutput {
  aiUsed: boolean;
}

export class ChallengeService {
  public static async generateEmail(
    req: ChallengeRequest,
    user?: User,
    supabase?: SupabaseClient
  ): Promise<ChallengeServiceResult> {
    let email: ChallengeOutput | null = null;
    let aiUsed = false;

    if (req.kind === "safe_reply") {
      if (req.useAi && GeminiService.isAvailable()) {
        email = await GeminiService.generateSafeReply({
          domain: req.domain,
          claimedOrg: req.claimedOrg,
          tone: req.tone,
          senderName: req.senderName,
          includeQuestions: req.includeQuestions,
        });
        if (email) {
          aiUsed = true;
        }
      }

      if (!email) {
        email = buildSafeReplyTemplate({
          domain: req.domain,
          claimedOrg: req.claimedOrg,
          tone: req.tone,
          senderName: req.senderName,
          includeQuestions: req.includeQuestions,
        });
        aiUsed = false;
      }
    } else {
      if (req.useAi && GeminiService.isAvailable()) {
        email = await GeminiService.generateChallengeEmail({
          domain: req.domain,
          claimedOrg: req.claimedOrg,
          tone: req.tone,
          senderName: req.senderName,
        });
        if (email) {
          aiUsed = true;
        }
      }

      // Fallback to deterministic template
      if (!email) {
        email = buildChallengeTemplate({
          domain: req.domain,
          claimedOrg: req.claimedOrg,
          tone: req.tone,
          senderName: req.senderName,
        });
        aiUsed = false;
      }
    }

    // Persist if authenticated
    if (user && supabase) {
      try {
        await supabase.from("recruiter_challenges").insert({
          user_id: user.id,
          analysis_id: req.analysisId || null,
          subject: email.subject,
          body: email.body,
          ai_used: aiUsed,
        });
      } catch (err) {
        logger.warn({ err }, "Failed to persist challenge email");
      }
    }

    return {
      subject: email.subject,
      body: email.body,
      aiUsed,
    };
  }
}
