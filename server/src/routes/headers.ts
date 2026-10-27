import { Router, Request, Response, NextFunction } from "express";
import dns from "node:dns/promises";
import { z } from "zod";
import { parseEmailHeaders, parseEmailAddress, CheckRow } from "shared";
import { env } from "../config/env.js";

import { headerAnalyzeLimiter } from "../middleware/rateLimit.js";

export const headersRouter = Router();

const HeadersAnalyzeRequestSchema = z
  .object({
    headers: z.string().min(10).max(20000),
    claimedOrgId: z.string().uuid().optional(),
  })
  .strict();

async function lookupDnsPolicy(
  domain: string
): Promise<{ spfRecordFound: boolean; dmarcPolicy: string | null }> {
  let spfRecordFound = false;
  let dmarcPolicy: string | null = null;

  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("DNS Timeout")), env.DNS_TIMEOUT_MS)
    );

    // 1. Lookup SPF on domain TXT records
    const txtRecords = await Promise.race([
      dns.resolveTxt(domain),
      timeoutPromise,
    ]);
    for (const record of txtRecords) {
      const joined = record.join("");
      if (joined.startsWith("v=spf1")) {
        spfRecordFound = true;
        break;
      }
    }
  } catch {
    // Treat error as not found or unknown
  }

  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("DNS Timeout")), env.DNS_TIMEOUT_MS)
    );

    // 2. Lookup DMARC policy on _dmarc.<domain>
    const dmarcRecords = await Promise.race([
      dns.resolveTxt(`_dmarc.${domain}`),
      timeoutPromise,
    ]);
    for (const record of dmarcRecords) {
      const joined = record.join("");
      if (joined.startsWith("v=DMARC1")) {
        const pMatch = joined.match(/\bp=([a-z]+)/i);
        if (pMatch) {
          dmarcPolicy = pMatch[1].toLowerCase();
        }
        break;
      }
    }
  } catch {
    // Treat error as not found
  }

  return { spfRecordFound, dmarcPolicy };
}

headersRouter.post(
  "/analyze",
  headerAnalyzeLimiter,
  async (req: Request, res: Response, Next: NextFunction) => {
    try {
      const parsed = HeadersAnalyzeRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid email headers input.",
            details: parsed.error.format(),
          },
        });
      }

      const { headers } = parsed.data;
      const analysis = parseEmailHeaders(headers);

      // Perform server DNS policy lookup if From domain is parseable
      if (analysis.from) {
        const parsedEmail = parseEmailAddress(analysis.from);
        if (parsedEmail.domain) {
          const dnsPolicy = await lookupDnsPolicy(parsedEmail.domain);
          analysis.dnsPolicy = dnsPolicy;
        }
      }

      const checks: CheckRow[] = [];
      const outcome =
        analysis.authResults.dmarc === "pass" ||
        (analysis.authResults.spf === "pass" && analysis.authResults.dkim === "pass")
          ? "pass"
          : analysis.authResults.dmarc === "fail" ||
            analysis.authResults.spf === "fail" ||
            analysis.authResults.dkim === "fail"
          ? "fail"
          : "unknown";

      checks.push({
        checkKey: "header_authentication",
        label: "Header Authentication (SPF/DKIM/DMARC)",
        outcome,
        detail: `SPF: ${analysis.authResults.spf}, DKIM: ${analysis.authResults.dkim}, DMARC: ${analysis.authResults.dmarc} (as reported in the headers you supplied).`,
        source: "header_parse",
      });

      if (analysis.mismatches.length > 0) {
        checks.push({
          checkKey: "header_domain_alignment",
          label: "Header Address Alignment",
          outcome: "fail",
          detail: `${analysis.mismatches.join("; ")} (as reported in the headers you supplied).`,
          source: "header_parse",
        });
      }

      return res.json({ analysis, checks });
    } catch (err) {
      Next(err);
    }
  }
);
