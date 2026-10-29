import { convert } from "html-to-text";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  Organization,
  ExtractedFields,
  ListingComparison,
  CheckRow,
  extractOfferFields,
  compareListing,
} from "shared";
import { safeFetch } from "../lib/safeFetch.js";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";

export function normalizeOrgName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(pvt|ltd|limited|inc|llp|technologies|solutions|corporation|corp)\b/gi, "")
    .replace(/[^a-z0-9]/gi, "")
    .trim();
}

export class ListingService {
  /**
   * Search and match organization in the registry.
   */
  public static async matchOrganization(
    supabase: SupabaseClient,
    claimedName: string
  ): Promise<Organization | null> {
    if (!claimedName || claimedName.trim().length < 2) return null;

    const cleanInput = claimedName.trim();
    const normInput = normalizeOrgName(cleanInput);

    try {
      const { data: rows, error } = await supabase
        .from("organizations")
        .select("*")
        .limit(50);

      if (error || !rows) {
        logger.error({ err: error }, "Failed to fetch organizations for matching");
        return null;
      }

      for (const row of rows) {
        const rowNorm = normalizeOrgName(row.name);
        const matchesMain =
          row.name.toLowerCase() === cleanInput.toLowerCase() ||
          rowNorm === normInput ||
          (rowNorm.length >= 4 && (normInput.startsWith(rowNorm) || rowNorm.startsWith(normInput)));

        if (matchesMain) {
          return {
            id: row.id,
            name: row.name,
            aliases: row.aliases || [],
            kind: row.kind,
            officialDomains: row.official_domains,
            careersUrl: row.careers_url,
            scholarshipsUrl: row.scholarships_url,
            isGovernment: row.is_government,
            isDemo: row.is_demo,
            needsTeamReview: row.needs_team_review,
          };
        }

        // Check aliases
        if (Array.isArray(row.aliases)) {
          for (const alias of row.aliases) {
            const aliasNorm = normalizeOrgName(alias);
            const matchesAlias =
              alias.toLowerCase() === cleanInput.toLowerCase() ||
              aliasNorm === normInput ||
              (aliasNorm.length >= 4 && (normInput.startsWith(aliasNorm) || aliasNorm.startsWith(normInput)));

            if (matchesAlias) {
              return {
                id: row.id,
                name: row.name,
                aliases: row.aliases || [],
                kind: row.kind,
                officialDomains: row.official_domains,
                careersUrl: row.careers_url,
                scholarshipsUrl: row.scholarships_url,
                isGovernment: row.is_government,
                isDemo: row.is_demo,
                needsTeamReview: row.needs_team_review,
              };
            }
          }
        }
      }
    } catch (err: any) {
      logger.error({ err }, "Exception during organization matching");
    }

    return null;
  }

  /**
   * Fetch and compare an official listing.
   */
  public static async processOfficialListing(
    offerFields: ExtractedFields,
    matchedOrg: Organization | null,
    listingInput?: { url?: string; text?: string },
    isDemoMode = false
  ): Promise<{ comparison: ListingComparison; check: CheckRow }> {
    if (!listingInput || (!listingInput.url && !listingInput.text)) {
      const defaultComparison: ListingComparison = {
        status: "not_checked",
        sourceType: null,
        listingUrl: null,
        organizationMatched: false,
        roleMatched: false,
        hasMismatches: false,
        matchedFieldsCount: 0,
        comparedFields: [],
        notes: "No official listing URL or text was provided.",
      };

      const check: CheckRow = {
        checkKey: "official_listing",
        label: "Official Listing Verification",
        outcome: "not_run",
        detail: "No official listing provided for comparison.",
        source: "listing_compare",
      };

      return { comparison: defaultComparison, check };
    }

    // Pathway 1: Platform fetch via URL
    if (listingInput.url) {
      const listingUrl = listingInput.url.trim();

      if (!env.ENABLE_THIRD_PARTY_CHECKS && !(isDemoMode && matchedOrg?.isDemo)) {
        const comparison: ListingComparison = {
          status: "not_checked",
          sourceType: "platform_fetch",
          listingUrl,
          organizationMatched: false,
          roleMatched: false,
          hasMismatches: false,
          matchedFieldsCount: 0,
          comparedFields: [],
          notes: "Platform listing URL fetch is disabled (ENABLE_THIRD_PARTY_CHECKS=false). Please paste listing text instead.",
        };

        const check: CheckRow = {
          checkKey: "official_listing",
          label: "Official Listing Verification",
          outcome: "not_run",
          detail: "Listing URL fetch is disabled. Use pasted text to verify via official listing.",
          source: "listing_compare",
        };

        return { comparison, check };
      }

      if (!matchedOrg) {
        const comparison: ListingComparison = {
          status: "unknown",
          sourceType: "platform_fetch",
          listingUrl,
          organizationMatched: false,
          roleMatched: false,
          hasMismatches: false,
          matchedFieldsCount: 0,
          comparedFields: [],
          notes: "Cannot fetch listing: Claimed organization is not in the registry.",
        };

        const check: CheckRow = {
          checkKey: "official_listing",
          label: "Official Listing Verification",
          outcome: "unknown",
          detail: "Listing URL provided, but organization could not be confirmed in registry.",
          source: "listing_compare",
        };

        return { comparison, check };
      }

      try {
        const fetchRes = await safeFetch(listingUrl, {
          timeoutMs: env.LISTING_FETCH_TIMEOUT_MS,
          maxBytes: env.LISTING_MAX_BYTES,
          allowedHosts: matchedOrg.officialDomains,
          allowGovSubdomains: matchedOrg.isGovernment,
          allowedContentTypes: ["text/html", "text/plain"],
        });

        const plainText = convert(fetchRes.text, {
          wordwrap: false,
          selectors: [
            { selector: "script", format: "skip" },
            { selector: "style", format: "skip" },
            { selector: "nav", format: "skip" },
            { selector: "footer", format: "skip" },
          ],
        }).slice(0, 20000);

        if (plainText.trim().length < 50) {
          const comparison: ListingComparison = {
            status: "unknown",
            sourceType: "platform_fetch",
            listingUrl,
            organizationMatched: true,
            roleMatched: false,
            hasMismatches: false,
            matchedFieldsCount: 0,
            comparedFields: [],
            notes: "Page could not be read automatically (may require JavaScript). You may paste the listing text directly.",
          };

          const check: CheckRow = {
            checkKey: "official_listing",
            label: "Official Listing Verification",
            outcome: "unknown",
            detail: "Page could not be read automatically. Try pasting the listing text.",
            source: "listing_compare",
          };

          return { comparison, check };
        }

        const listingFields = extractOfferFields(plainText);
        const comparison = compareListing(offerFields, listingFields, {
          sourceType: "platform_fetch",
          listingUrl,
          orgOfficialDomains: matchedOrg.officialDomains,
        });

        const outcome =
          comparison.status === "match"
            ? "pass"
            : comparison.status === "mismatch"
            ? "fail"
            : "unknown";

        const check: CheckRow = {
          checkKey: "official_listing",
          label: "Official Listing Verification",
          outcome,
          detail:
            comparison.status === "match"
              ? `Matched on official careers page (${new URL(listingUrl).hostname}).`
              : comparison.status === "mismatch"
              ? "Discrepancy found between offer message and official careers page."
              : "Listing fetched but some fields could not be matched.",
          source: "listing_compare",
        };

        return { comparison, check };
      } catch (fetchErr: any) {
        logger.warn({ err: fetchErr, url: listingUrl }, "Failed to fetch official listing");

        const comparison: ListingComparison = {
          status: "unknown",
          sourceType: "platform_fetch",
          listingUrl,
          organizationMatched: false,
          roleMatched: false,
          hasMismatches: false,
          matchedFieldsCount: 0,
          comparedFields: [],
          notes: `Listing fetch rejected or failed: ${fetchErr.message}`,
        };

        const check: CheckRow = {
          checkKey: "official_listing",
          label: "Official Listing Verification",
          outcome: "unknown",
          detail: `Could not fetch listing safely: ${fetchErr.message}`,
          source: "listing_compare",
        };

        return { comparison, check };
      }
    }

    // Pathway 2: Pasted text
    if (listingInput.text) {
      const pasted = listingInput.text.slice(0, 20000);
      const listingFields = extractOfferFields(pasted);

      const comparison = compareListing(offerFields, listingFields, {
        sourceType: "pasted_text",
      });

      const outcome =
        isDemoMode && matchedOrg?.isDemo && comparison.status === "match"
          ? "pass"
          : "user_attested";

      const check: CheckRow = {
        checkKey: "official_listing",
        label: "Official Listing Verification",
        outcome,
        detail:
          isDemoMode && matchedOrg?.isDemo
            ? "Pasted listing verified for demo organization (DEMO_MODE=true)."
            : "Listing details were supplied as pasted text by you; not independently verified from official website.",
        source: "listing_compare",
      };

      return { comparison, check };
    }

    throw new Error("Invalid official listing input");
  }
}
