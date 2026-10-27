import {
  GeminiAnalysisOutput,
  GeminiAnalysisOutputSchema,
  ChallengeOutput,
  ChallengeOutputSchema,
  LinkExplainOutput,
  LinkExplainOutputSchema,
  ExtractionOutputSchema,
  ListingDiscrepancyOutput,
  ListingDiscrepancyOutputSchema,
  Signal,
  UnknownItem,
  ExtractedFields,
  buildSafeReplyTemplate,
  SafeReplyOutputSchema,
  SAFE_REPLY_JSON_SCHEMA,
} from "shared";
import { generateStructured, getGemini } from "../lib/gemini.js";
import { JAANCH_SYSTEM_PROMPT } from "./prompts/system.js";
import {
  AnalysisPromptParams,
  buildAnalysisPrompt,
} from "./prompts/analysis.js";
import {
  ChallengePromptParams,
  buildChallengePrompt,
} from "./prompts/challenge.js";
import {
  LinkExplainParams,
  buildLinkExplainPrompt,
} from "./prompts/linkExplain.js";
import { buildExtractionPrompt } from "./prompts/extraction.js";
import {
  DiscrepancyItem,
  buildListingDiscrepancyPrompt,
} from "./prompts/listingDiscrepancy.js";
import {
  ANALYSIS_JSON_SCHEMA,
  CHALLENGE_JSON_SCHEMA,
  LINK_EXPLAIN_JSON_SCHEMA,
  EXTRACTION_JSON_SCHEMA,
  LISTING_DISCREPANCY_JSON_SCHEMA,
} from "./schemas.js";
import { logger } from "../lib/logger.js";

export interface AiAnalysisResult {
  status: "ok" | "failed" | "invalid_output" | "timeout";
  signals: Signal[];
  unknowns: UnknownItem[];
  extraSteps: string[];
  overview?: string;
  confidence?: "low" | "medium" | "high";
}

export class GeminiService {
  public static isAvailable(): boolean {
    return !!getGemini();
  }

  public static async analyzeOpportunity(
    params: AnalysisPromptParams
  ): Promise<AiAnalysisResult> {
    if (!this.isAvailable()) {
      return {
        status: "failed",
        signals: [],
        unknowns: [],
        extraSteps: [],
      };
    }

    const prompt = buildAnalysisPrompt(params);

    let rawOutput: unknown;
    try {
      rawOutput = await generateStructured({
        systemInstruction: JAANCH_SYSTEM_PROMPT,
        userContent: prompt,
        jsonSchema: ANALYSIS_JSON_SCHEMA,
        timeoutMs: 20000,
      });
    } catch (err: any) {
      logger.warn({ err: err.message }, "AI opportunity analysis call failed");
      return {
        status: err.code === "AI_TIMEOUT" ? "timeout" : "failed",
        signals: [],
        unknowns: [],
        extraSteps: [],
      };
    }

    let parsed = GeminiAnalysisOutputSchema.safeParse(rawOutput);

    // If validation fails, attempt one retry
    if (!parsed.success) {
      try {
        const retryPrompt = `${prompt}\n\nIMPORTANT: Your previous output failed schema validation. Return ONLY valid JSON strictly matching the schema with all required keys.`;
        const retryOutput = await generateStructured({
          systemInstruction: JAANCH_SYSTEM_PROMPT,
          userContent: retryPrompt,
          jsonSchema: ANALYSIS_JSON_SCHEMA,
          timeoutMs: 15000,
        });
        parsed = GeminiAnalysisOutputSchema.safeParse(retryOutput);
      } catch {
        // Retry failed
      }
    }

    if (!parsed.success) {
      return {
        status: "invalid_output",
        signals: [],
        unknowns: [],
        extraSteps: [],
      };
    }

    const output: GeminiAnalysisOutput = parsed.data;

    // Filter signals: must be evidence-grounded and severity capped at high
    const groundedSignals: Signal[] = [];
    for (const sig of output.additionalSignals) {
      if (params.redactedText.includes(sig.evidenceQuote)) {
        groundedSignals.push({
          ruleId: `AI-${sig.category.toUpperCase().slice(0, 3)}`,
          category: sig.category,
          severity: sig.severity === "high" ? "high" : sig.severity,
          source: "ai",
          title: sig.title,
          whyItMatters: sig.whyItMatters,
          evidenceQuote: sig.evidenceQuote,
          hardDisqualifier: false, // AI signals MAY NEVER be hard disqualifiers
        });
      }
    }

    return {
      status: "ok",
      signals: groundedSignals,
      unknowns: output.unverified,
      extraSteps: output.extraVerificationSteps,
      overview: output.overview,
      confidence: output.textOnlyConfidence,
    };
  }

  /**
   * Field extraction fill-in for missing deterministic fields.
   */
  public static async fillMissingFields(
    redactedText: string,
    missingFields: string[]
  ): Promise<Partial<ExtractedFields>> {
    if (!this.isAvailable() || missingFields.length === 0) return {};

    const prompt = buildExtractionPrompt(redactedText, missingFields);

    try {
      const rawOutput = await generateStructured({
        systemInstruction: JAANCH_SYSTEM_PROMPT,
        userContent: prompt,
        jsonSchema: EXTRACTION_JSON_SCHEMA,
        timeoutMs: 15000,
      });

      const parsed = ExtractionOutputSchema.safeParse(rawOutput);
      if (!parsed.success) return {};

      const fields = parsed.data.fields;
      const result: Partial<ExtractedFields> = {};

      for (const [key, item] of Object.entries(fields)) {
        if (item && item.value && item.evidenceQuote) {
          // Evidence grounding: quote must exist in redactedText
          if (redactedText.includes(item.evidenceQuote)) {
            if (key === "compensation") {
              result.compensation = {
                value: {
                  kind: "stipend",
                  raw: item.value,
                },
                evidenceQuote: item.evidenceQuote,
                source: "ai",
              };
            } else {
              (result as any)[key] = {
                value: item.value,
                evidenceQuote: item.evidenceQuote,
                source: "ai",
              };
            }
          }
        }
      }

      return result;
    } catch (err: any) {
      logger.warn({ err: err.message }, "AI field extraction fill-in failed");
      return {};
    }
  }

  /**
   * Listing-vs-offer discrepancy explainer.
   */
  public static async explainDiscrepancies(
    discrepancies: DiscrepancyItem[]
  ): Promise<ListingDiscrepancyOutput> {
    const fallback: ListingDiscrepancyOutput = {
      plainExplanation:
        discrepancies.length > 0
          ? `Discrepancies were found between the offer and the official listing: ${discrepancies.map((d) => d.field).join(", ")}. Verify directly with the organization.`
          : "No specific discrepancies recorded.",
      whatToAskTheRecruiter: [
        "Can you clarify the differences between the received offer details and your official portal listing?",
        "Could you confirm the stipend, role title, and duration through your official corporate email?",
      ],
    };

    if (!this.isAvailable() || discrepancies.length === 0) {
      return fallback;
    }

    try {
      const prompt = buildListingDiscrepancyPrompt(discrepancies);
      const rawOutput = await generateStructured({
        systemInstruction: JAANCH_SYSTEM_PROMPT,
        userContent: prompt,
        jsonSchema: LISTING_DISCREPANCY_JSON_SCHEMA,
        timeoutMs: 15000,
      });

      const parsed = ListingDiscrepancyOutputSchema.safeParse(rawOutput);
      if (parsed.success) {
        return parsed.data;
      }
      return fallback;
    } catch {
      return fallback;
    }
  }

  public static async generateChallengeEmail(
    params: ChallengePromptParams
  ): Promise<ChallengeOutput> {
    const fallback: ChallengeOutput = {
      subject: `Clarification regarding ${params.domain} opportunity at ${params.claimedOrg || "your organization"}`,
      body: `Dear Recruiter,\n\nI received an offer communication regarding an opportunity at ${params.claimedOrg || "your company"}. To complete my institution's placement verification requirements, could you please confirm this offer from your official corporate email address and provide a link to the active listing on your official website?\n\nThank you for your assistance.`,
    };

    if (!this.isAvailable()) return fallback;

    try {
      const prompt = buildChallengePrompt(params);
      const rawOutput = await generateStructured({
        systemInstruction: JAANCH_SYSTEM_PROMPT,
        userContent: prompt,
        jsonSchema: CHALLENGE_JSON_SCHEMA,
        timeoutMs: 15000,
      });

      const parsed = ChallengeOutputSchema.safeParse(rawOutput);
      return parsed.success ? parsed.data : fallback;
    } catch {
      return fallback;
    }
  }

  public static async generateSafeReply(
    params: ChallengePromptParams & { includeQuestions?: string[] }
  ): Promise<ChallengeOutput> {
    const fallback = buildSafeReplyTemplate({
      domain: params.domain,
      claimedOrg: params.claimedOrg,
      tone: params.tone,
      senderName: params.senderName,
      includeQuestions: params.includeQuestions,
    });

    if (!this.isAvailable()) return fallback;

    try {
      const questionsList: string[] = [];
      if (params.includeQuestions && params.includeQuestions.length > 0) {
        if (params.includeQuestions.includes("official_domain_and_letterhead")) {
          questionsList.push("Request their official corporate email domain, verified website link, and formal offer letter on official letterhead.");
        }
        if (params.includeQuestions.includes("selection_process")) {
          questionsList.push("Request a formal description of the selection/evaluation process and who conducts it.");
        }
        if (params.includeQuestions.includes("registration_meaning_and_fee")) {
          questionsList.push("Ask for clarification on what 'registration' involves, with explicit written confirmation that no fees or deposits apply.");
        }
        if (params.includeQuestions.includes("data_minimization")) {
          questionsList.push("Ask to confirm which personal details are required and at what stage.");
        }
        if (params.includeQuestions.includes("more_time")) {
          questionsList.push("Politely request additional time to independently verify details before proceeding.");
        }
      }

      if (questionsList.length === 0) {
        questionsList.push(
          "Request official corporate email domain and verified website link.",
          "Request a formal description of the selection process.",
          "Ask what 'registration' involves, with confirmation that no fee applies.",
          "Ask for a formal offer letter on official letterhead."
        );
      }

      const prompt = `Write a polite, professional safe reply email (maximum 180 words, strictly capped) to an offer from ${
        params.claimedOrg || "the organization"
      } regarding a ${params.domain} opportunity.
Requirements:
1. Thank the sender and confirm interest conditionally.
2. Share NO personal records, ID numbers, address, or sensitive data.
3. Contain NO accusations, hostile tone, or scam allegations.
4. Politely request written clarification on the following items:
${questionsList.map((q, i) => `   ${i + 1}. ${q}`).join("\n")}
Tone: ${params.tone || "polite"}.
Candidate name: ${params.senderName || "[Your Name]"}.
Length constraint: Under 180 words total.`;

      const rawOutput = await generateStructured({
        systemInstruction: JAANCH_SYSTEM_PROMPT,
        userContent: prompt,
        jsonSchema: SAFE_REPLY_JSON_SCHEMA,
        timeoutMs: 15000,
      });

      const parsed = SafeReplyOutputSchema.safeParse(rawOutput);
      return parsed.success ? parsed.data : fallback;
    } catch {
      return fallback;
    }
  }

  public static async explainLinkRisk(
    params: LinkExplainParams
  ): Promise<LinkExplainOutput> {
    const fallback: LinkExplainOutput = {
      plainExplanation:
        "The link domain could not be verified against the official organization registry. Always navigate to the official portal independently.",
      whatToCheckNext: [
        "Search the company name directly in a search engine instead of clicking the link.",
        "Check domain registration age via WHOIS/RDAP.",
      ],
    };

    if (!this.isAvailable()) return fallback;

    try {
      const prompt = buildLinkExplainPrompt(params);
      const rawOutput = await generateStructured({
        systemInstruction: JAANCH_SYSTEM_PROMPT,
        userContent: prompt,
        jsonSchema: LINK_EXPLAIN_JSON_SCHEMA,
        timeoutMs: 15000,
      });

      const parsed = LinkExplainOutputSchema.safeParse(rawOutput);
      return parsed.success ? parsed.data : fallback;
    } catch {
      return fallback;
    }
  }
}
