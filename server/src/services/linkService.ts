import {
  LinkCheckResult,
  evaluateLink,
} from "shared";
import { User, SupabaseClient } from "@supabase/supabase-js";
import { lookupRdap } from "../lib/rdap.js";
import { logger } from "../lib/logger.js";

export class LinkService {
  public static async checkLink(
    rawUrl: string,
    analysisId?: string,
    user?: User,
    supabase?: SupabaseClient
  ): Promise<LinkCheckResult> {
    const parsed = new URL(rawUrl);
    const hostname = parsed.hostname;

    // RDAP lookup
    const rdapInfo = await lookupRdap(hostname);

    // Run heuristics with RDAP data
    const evalResult = evaluateLink({
      url: rawUrl,
      hostname,
      registrableDomain: rdapInfo.registrableDomain,
      domainRegisteredAt: rdapInfo.domainRegisteredAt,
      rdapStatus: rdapInfo.rdapStatus,
    });

    const result: LinkCheckResult = {
      url: rawUrl,
      hostname,
      registrableDomain: rdapInfo.registrableDomain,
      riskLevel: evalResult.riskLevel,
      observations: evalResult.observations,
      unverified: evalResult.unverified,
      rdapStatus: rdapInfo.rdapStatus,
      domainRegisteredAt: rdapInfo.domainRegisteredAt,
      disclaimer: evalResult.disclaimer,
    };

    // Persist if authenticated
    if (user && supabase) {
      try {
        await supabase.from("link_checks").insert({
          user_id: user.id,
          analysis_id: analysisId || null,
          url: rawUrl,
          hostname,
          registrable_domain: rdapInfo.registrableDomain,
          risk_level: result.riskLevel,
          observations: result.observations,
          unverified: result.unverified,
          rdap_status: result.rdapStatus,
          domain_registered_at: result.domainRegisteredAt,
        });
      } catch (err) {
        logger.warn({ err }, "Failed to persist link check");
      }
    }

    return result;
  }
}
